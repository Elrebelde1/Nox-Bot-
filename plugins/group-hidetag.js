import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, participants }) => {
  let users = participants.map(u => conn.decodeJid(u.id))
  let q = m.quoted ? m.quoted : m

  let botJid = conn.user.jid
  let isFromBot = q.key?.fromMe || false

  let watermark = `\n\n> 🛸 *[ NOX BOT MD ]* 🌌`

  let baseText = text || q.text || q.caption || q.body || ''
  let finalText = isFromBot ? baseText : (baseText ? baseText + watermark : watermark.trim())

  await conn.sendMessage(m.chat, {
    text: finalText,
    mentions: users
  }, { 
    quoted: q
  })
}

handler.help = ['notify']
handler.tags = ['grupos']
handler.command = /^(hidetag|notify|notificar|notifi|noti|n|hidet|aviso)$/i
handler.group = true
handler.admin = true

export default handler
