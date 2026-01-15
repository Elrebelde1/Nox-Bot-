import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const watermark = '\n\n> Barboza'
    
    // 1. Detectar si es Business o Personal
    const isBusiness = conn.user.isBusiness || false
    const platformName = isBusiness ? 'WhatsApp Business' : 'WhatsApp'
    
    // 2. Obtener la foto de perfil del Bot
    let profilePic
    try {
      profilePic = await conn.profilePictureUrl(conn.user.jid, 'image')
    } catch {
      profilePic = 'https://qu.ax/eaLLM' // Imagen por defecto si no tiene foto
    }

    const userText = m.text
      ? m.text.slice(m.text.split(' ')[0].length).trim()
      : ''

    // Configuración dinámica con la info del bot
    const saskContext = {
      externalAdReply: {
        title: `${platformName} ✅`, 
        body: 'Hola, Soy SASUKE BOT 👾',
        thumbnailUrl: profilePic, 
        sourceUrl: 'https://www.whatsapp.com', 
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false 
      }
    }

    if (m.quoted) {
      const q = m.quoted
      const type = q.mtype
      let media = null
      if (q.download) {
        try { media = await q.download() } catch {}
      }

      const baseText = q.text || q.caption || ''
      const finalText = [userText, baseText].filter(Boolean).join('\n') + watermark

      const messageOptions = {
        mentions: users,
        contextInfo: saskContext
      }

      // Envíos con multimedia
      if (type === 'imageMessage') {
        await conn.sendMessage(m.chat, { image: media, caption: finalText, ...messageOptions })
      } else if (type === 'videoMessage') {
        await conn.sendMessage(m.chat, { video: media, caption: finalText, ...messageOptions })
      } else if (type === 'audioMessage') {
        await conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/ogg; codecs=opus', ...messageOptions })
      } else if (type === 'documentMessage') {
        await conn.sendMessage(m.chat, { document: media, fileName: q.fileName || 'archivo', mimetype: q.mimetype, caption: finalText, ...messageOptions })
      } else {
        await conn.sendMessage(m.chat, { text: finalText, ...messageOptions })
      }

    } else {
      // SI NO RESPONDE A NADA
      await conn.sendMessage(m.chat, {
        text: (userText || '') + watermark,
        mentions: users,
        contextInfo: saskContext
      })
    }
  } catch (e) {
    console.error(e)
    m.reply('Ocurrió un error al procesar el hidetag')
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|notify|n)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
