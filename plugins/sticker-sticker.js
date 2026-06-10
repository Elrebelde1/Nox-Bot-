import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

const fkontak = {
  key: {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
    fromMe: false,
    id: 'SasukeUchihaJutsu'
  },
  message: {
    contactMessage: {
      displayName: '💥 𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵 💥\n👁️‍🗨️ ¡𝘑𝘶𝘵𝘴𝘶: 𝘚𝘵𝘪𝘤𝘬𝘦𝘳 𝘊𝘳𝘦𝘢𝘥𝘰!',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sasuke;Uchiha;;;\nFN:👁️‍🗨️ Sasuke Bot Uchiha\nORG:Clan Uchiha\nTEL;type=CELL;type=VOICE;waid=1234567890:+1 234 567 890\nEND:VCARD`
    }
  }
}

let handler = async (m, { conn, args }) => {
  let stiker = false
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  
  const mensajeError = `🏮 *𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵* 🏮\n⚠️ _Conversión fallida. Responde a una imagen, video o gif para crear el sticker._`

  try {
    if (mime.startsWith('image/') || mime.startsWith('video/') || mime === 'image/webp') {
      let media = await q.download?.()
      if (!media) return conn.reply(m.chat, mensajeError, m)

      try {
        stiker = await sticker(media, false, global.packN, global.authN)
      } catch (e) {
        let url
        if (mime === 'image/webp') url = await webp2png(media)
        else if (mime.startsWith('image/')) url = await uploadImage(media)
        else if (mime.startsWith('video/')) url = await uploadFile(media)

        if (!url || typeof url !== 'string' || !isValidUrl(url)) {
          return conn.reply(m.chat, '⚡ _Ocurrió un error al procesar el pergamino multimedia (URL inválida)._', m)
        }

        stiker = await sticker(false, url, global.packN, global.authN)
      }

    } else if (args[0]) {
      if (!isValidUrl(args[0])) return conn.reply(m.chat, '❌ _La URL proporcionada no es un enlace válido de imagen o video._', m)
      stiker = await sticker(false, args[0], global.packN, global.authN)
    } else {
      return conn.reply(m.chat, mensajeError, m)
    }

  } catch (error) {
    console.error(error)
    stiker = false
  }

  if (stiker && Buffer.isBuffer(stiker)) {
    await conn.sendMessage(
      m.chat,
      { sticker: stiker },
      { quoted: fkontak }
    )
  } else {
    conn.reply(m.chat, '⚡ _El Jutsu falló. No se pudo empaquetar el sticker, asegúrate de que el archivo no esté corrupto._', m)
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

function isValidUrl(text) {
  return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(text)
}
