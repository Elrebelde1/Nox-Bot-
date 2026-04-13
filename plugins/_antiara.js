let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️ Solo los admins pueden usar este comando."

  let chat = global.db.data.chats[m.chat]
  if (!args[0]) throw "📌 Usa: .antiestado on / off"

  if (args[0] === 'on') {
    chat.antiEstado = true
    await m.reply("✅ Antiestado activado. El bot expulsará a quien etiquete este grupo en su estado.")
  } else if (args[0] === 'off') {
    chat.antiEstado = false
    await m.reply("❌ Antiestado desactivado.")
  } else {
    await m.reply("📌 Usa: .antiestado on / off")
  }
}

handler.help = ['antiestado <on/off>']
handler.tags = ['group']
handler.command = /^(antiestado)$/i
handler.group = true

handler.before = async function (m, { conn }) {
  // Solo procesar si es un estado
  if (m.key.remoteJid !== 'status@broadcast') return !1

  const user = m.sender
  const msg = m.message?.extendedTextMessage || m.message?.imageMessage || m.message?.videoMessage
  const mentions = msg?.contextInfo?.mentionedJid || []

  if (mentions.length > 0) {
    for (let jid of mentions) {
      // Verificar si el JID mencionado es un grupo y si tiene el antiEstado activo
      let chat = global.db.data.chats[jid]
      if (chat && chat.antiEstado) {
        
        // Verificar si el bot es admin en ese grupo para poder eliminar
        let groupMetadata = await conn.groupMetadata(jid)
        let participants = groupMetadata.participants
        let bot = participants.find(p => p.id === conn.user.jid)
        
        if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
          try {
            // Avisar y eliminar
            await conn.sendMessage(jid, { 
              text: `🚫 @${user.split('@')[0]} expulsado automáticamente.\n*Motivo:* Etiquetar al grupo en un estado.`, 
              mentions: [user] 
            })
            
            await conn.groupParticipantsUpdate(jid, [user], 'remove')
          } catch (e) {
            console.error("Error al eliminar del grupo:", jid, e)
          }
        }
      }
    }
  }
  return !0
}

export default handler
