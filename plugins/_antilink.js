let handler = async (m, { conn, text, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat]
  let isClose = /on/i.test(text)
  
  if (!text) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n🚩 *Uso correcto:* ${usedPrefix + command} *on/off*`)
  
  chat.antiLink = isClose
  m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n✅ *Antilink* ha sido ${isClose ? 'activado' : 'desactivado'} para este grupo.`)
}

handler.help = ['antilink <on/off>']
handler.tags = ['grupos']
handler.command = /^antilink$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
