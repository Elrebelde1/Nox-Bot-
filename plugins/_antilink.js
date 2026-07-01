let handler = m => m
handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (m.isBaileys && m.fromMe) return
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  let isGroupLink = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i.test(m.text)
  
  if (chat.antiLink && isGroupLink) {
    if (isAdmin) return m.reply('⚠️ *Enlace detectado:* Como eres admin, no borraré tu mensaje.')
    if (!isBotAdmin) return m.reply('⚠️ *El bot necesita ser admin para borrar enlaces.*')
    
    await conn.sendMessage(m.chat, { delete: m.key })
    await conn.reply(m.chat, `🚫 *Enlace detectado y eliminado.*`, m)
  }
}

export default handler
