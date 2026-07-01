let handler = m => m

// Lógica del detector (se ejecuta antes de procesar mensajes)
handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (m.isBaileys && m.fromMe) return
  if (!m.isGroup) return
  
  let chat = global.db.data.chats[m.chat]
  let isLink = /https?:\/\//i.test(m.text)
  
  if (chat && chat.antiLink && isLink && !isAdmin) {
    if (!isBotAdmin) return
    await conn.sendMessage(m.chat, { delete: m.key })
    await conn.reply(m.chat, `🚫 *Enlace detectado y eliminado.*`, m)
  }
}

// Lógica del comando (para activar/desactivar)
handler.all = async (m, { conn, text, usedPrefix, command }) => {
  if (command === 'antilink') {
    let chat = global.db.data.chats[m.chat]
    if (!text) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n🚩 *Uso correcto:* ${usedPrefix + command} *on/off*`)
    chat.antiLink = (text.toLowerCase() === 'on')
    m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n✅ *Antilink* ha sido ${chat.antiLink ? 'activado' : 'desactivado'} para este grupo.`)
  }
}

handler.help = ['antilink <on/off>']
handler.tags = ['grupos']
handler.command = /^antilink$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
