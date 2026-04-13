let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️ Solo los admins pueden usar este comando."

  let chat = global.db.data.chats[m.chat]
  if (!args[0]) throw "📌 Usa: .autorechazar on / off"

  if (args[0] === 'on') {
    chat.autoRechazar = true
    await m.reply("✅ Auto-rechazar números extranjeros activado.")
  } else if (args[0] === 'off') {
    chat.autoRechazar = false
    await m.reply("❌ Auto-rechazar desactivado.")
  } else {
    await m.reply("📌 Usa: .autorechazar on / off")
  }
}

handler.help = ['autorechazar <on/off>']
handler.tags = ['group']
handler.command = /^(autorechazar|antifake)$/i
handler.group = true
handler.admin = true

handler.before = async function (m, { conn, isBotAdmin }) {
  if (!m.isGroup) return !1
  
  let chat = global.db.data.chats[m.chat]
  if (!chat?.autoRechazar || !isBotAdmin) return !1

  // Prefijos de números a rechazar
  const prefixes = ['6', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '49', '2', '91', '48']
  
  // Si el remitente empieza con algún prefijo de la lista
  if (prefixes.some(prefix => m.sender.startsWith(prefix))) {
    try {
      await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')
    } catch (e) {
      console.error("Error al rechazar participante:", e)
    }
  }
  return !0
}

export default handler
