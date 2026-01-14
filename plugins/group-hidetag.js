import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const watermark = '\n\n> Barboza'

    // Texto escrito después del comando
    const userText = m.text
      ? m.text.slice(m.text.split(' ')[0].length).trim()
      : ''

    // 🔹 SI RESPONDE A UN MENSAJE
    if (m.quoted) {
      const q = m.quoted
      const type = q.mtype

      // Descargar media si existe
      let media = null
      if (q.download) {
        try {
          media = await q.download()
        } catch {}
      }

      // Texto final (caption o texto)
      const baseText = q.text || q.caption || ''
      const finalText =
        [userText, baseText].filter(Boolean).join('\n') + watermark

      // 🟢 IMAGEN
      if (type === 'imageMessage') {
        await conn.sendMessage(m.chat, {
          image: media,
          caption: finalText,
          mentions: users
        })
      }

      // 🟢 VIDEO
      else if (type === 'videoMessage') {
        await conn.sendMessage(m.chat, {
          video: media,
          caption: finalText,
          mentions: users
        })
      }

      // 🟢 AUDIO
      else if (type === 'audioMessage') {
        await conn.sendMessage(m.chat, {
          audio: media,
          mimetype: 'audio/ogg; codecs=opus',
          mentions: users
        })
      }

      // 🟢 STICKER
      else if (type === 'stickerMessage') {
        await conn.sendMessage(m.chat, {
          sticker: media,
          mentions: users
        })
        // enviar texto aparte si existe
        if (finalText.trim() !== watermark.trim()) {
          await conn.sendMessage(m.chat, {
            text: finalText,
            mentions: users
          })
        }
      }

      // 🟢 DOCUMENTO
      else if (type === 'documentMessage') {
        await conn.sendMessage(m.chat, {
          document: media,
          fileName: q.fileName || 'archivo',
          mimetype: q.mimetype,
          caption: finalText,
          mentions: users
        })
      }

      // 🟢 TEXTO / OTROS
      else {
        await conn.sendMessage(m.chat, {
          text: finalText,
          mentions: users
        })
      }
    }

    // 🔹 SI NO RESPONDE A NADA (hidetag normal)
    else {
      const hiddenText = String.fromCharCode(8206).repeat(850)
      await conn.sendMessage(m.chat, {
        text: (userText || hiddenText) + watermark,
        mentions: users
      })
    }
  } catch (e) {
    console.error(e)
    m.reply('Ocurrió un error')
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|notify|n)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler