let handler = async (m, { conn, isAdmin, isBotAdmin, text }) => {
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  
  const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
  const isGroupLink = linkRegex.test(m.text)
  
  if (chat.antiLink && isGroupLink && !isAdmin && isBotAdmin) {
    await conn.sendMessage(m.chat, { delete: m.key })
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
  }
}

handler.help = ['antilink']
handler.tags = ['on/off']
handler.command = /^(antilink)$/i

export default handler
