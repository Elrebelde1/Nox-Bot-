let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️ Solo los admins pueden usar este comando."

  let chat = global.db.data.chats[m.chat]
  if (!args[0]) throw "📌 Usa: .antiestado on / off"

  if (args[0] === 'on') {
    chat.antiEstado = true
    await m.reply("✅ Antiestado activado. Si alguien etiqueta al grupo en su estado, será eliminado.")
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
handler.admin = true
handler.botAdmin = true

handler.before = async function (m, { conn, isBotAdmin }) {
  if (!m.isGroup) return !1
  
  let chat = global.db.data.chats[m.chat]
  if (!chat?.antiEstado || !isBotAdmin) return !1

  // Detectar si el mensaje proviene de un estado (status@broadcast)
  // y si menciona el JID del grupo actual
  if (m.key.remoteJid === 'status@broadcast') {
    // Revisamos si el grupo actual está mencionado en el estado
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    
    if (mentions.includes(m.chat)) {
      try {
        const user = m.sender
        
        // Avisar al grupo
        await conn.sendMessage(m.chat, { 
          text: `🚫 @${user.split('@')[0]} ha sido eliminado por etiquetar al grupo en un estado.`, 
          mentions: [user] 
        })

        // Eliminar al usuario del grupo
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        
      } catch (e) {
        console.error("Error al eliminar por antiestado:", e)
      }
    }
  }
  return !0
}

export default handler
