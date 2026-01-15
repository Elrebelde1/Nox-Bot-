import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const handler = async (m, { conn, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const isBusiness = conn.user.isBusiness || false
    const platformName = isBusiness ? 'WhatsApp Business' : 'WhatsApp'

    // 1. Intentar obtener la foto de perfil o usar una de las tuyas
    let profilePicUrl
    try {
      profilePicUrl = await conn.profilePictureUrl(conn.user.jid, 'image')
    } catch {
      // Usa aquí la de Catbox que pasaste, es muy confiable
      profilePicUrl = 'https://files.catbox.moe/zdp6m6.jpg' 
    }

    // 2. DESCARGAR LA IMAGEN (Esto es clave para que no salga en negro)
    const response = await fetch(profilePicUrl)
    const buffer = await response.buffer()

    const userText = m.text ? m.text.slice(m.text.split(' ')[0].length).trim() : ''

    const saskContext = {
      externalAdReply: {
        title: `${platformName} ✅`, 
        body: '𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾',
        thumbnail: buffer, // USAMOS EL BUFFER DESCARGADO
        sourceUrl: 'https://whatsapp.com/channel/0029VaeS99b96H4l9p9k4Y0e', // Cambia por tu canal si quieres
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false // A veces desactivarlo ayuda a que no tape la imagen
      }
    }

    const messageOptions = {
      mentions: users,
      contextInfo: saskContext
    }

    // Lógica de envío (simplificada y funcional)
    if (m.quoted) {
      const q = m.quoted
      const media = q.download ? await q.download() : null
      const finalText = [userText, q.text || q.caption || ''].filter(Boolean).join('\n')

      if (q.mtype === 'imageMessage') {
        await conn.sendMessage(m.chat, { image: media, caption: finalText, ...messageOptions })
      } else if (q.mtype === 'videoMessage') {
        await conn.sendMessage(m.chat, { video: media, caption: finalText, ...messageOptions })
      } else {
        await conn.sendMessage(m.chat, { text: finalText || 'Mensaje de grupo', ...messageOptions })
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: userText || 'hola grupo',
        ...messageOptions
      })
    }
  } catch (e) {
    console.error(e)
    m.reply('Error en hidetag')
  }
}

handler.command = /^(hidetag|notify|n)$/i
handler.group = true
handler.admin = true

export default handler
