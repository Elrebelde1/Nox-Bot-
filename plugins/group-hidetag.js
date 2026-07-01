import MessageType from '@whiskeysockets/baileys'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, participants }) => {
  let users = participants.map(u => conn.decodeJid(u.id))
  let q = m.quoted ? m.quoted : m
  let c = m.quoted ? m.quoted : m.msg

  // Detectar si el mensaje citado es del bot
  let botJid = conn.user.jid
  let isFromBot = false

  if (q?.key?.fromMe) {
    isFromBot = true
  } else if (q?.participant && botJid.includes(q.participant)) {
    isFromBot = true
  } else if (q?.sender && botJid.includes(q.sender)) {
    isFromBot = true
  }

  // Obtener nombre del grupo
  let groupMeta = await conn.groupMetadata(m.chat).catch(() => null)
  let groupName = groupMeta?.subject || "Grupo"

  // Watermark personalizado con nombre del grupo en estilo pequeño
  // Puedes usar subscript o small caps para simular letra pequeña
  let watermark = `\n\n> *Ale Bot*`

  // Construir el texto final según origen
  let baseText = text || q.text || c || ''
  let finalText = isFromBot ? baseText : baseText + watermark

  const msg = conn.cMod(
    m.chat,
    generateWAMessageFromContent(m.chat, {
      [c.toJSON ? q.mtype : 'extendedTextMessage']: c.toJSON ? c.toJSON() : {
        text: finalText
      }
    }, {
      userJid: conn.user.id
    }),
    finalText,
    conn.user.jid,
    { mentions: users }
  )

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['notify']
handler.tags = ['gc']
handler.command = /^(hidetag|notify|notificar|notifi|noti|n|hidet|aviso)$/i
handler.group = true
handler.admin = true

export default handler