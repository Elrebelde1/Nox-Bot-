import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const isBusiness = conn.user.isBusiness || false
    const platformName = isBusiness ? 'WhatsApp Business' : 'WhatsApp'

    let profilePic
    try {
      profilePic = await conn.profilePictureUrl(conn.user.jid, 'image')
    } catch {
      profilePic = 'https://files.catbox.moe/zdp6m6.jpg'
    }

    const userText = m.text ? m.text.slice(m.text.split(' ')[0].length).trim() : ''

    const saskContext = {
      externalAdReply: {
        title: `${platformName} ✅`, 
        body: '𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾',
        thumbnailUrl: profilePic,
        sourceUrl: 'https://www.whatsapp.com', 
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true
      }
    }

    const messageOptions = {
      mentions: users,
      contextInfo: saskContext
    }

    if (m.quoted) {
      const q = m.quoted
      const type = q.mtype
      let media = null
      if (q.download) {
        try { media = await q.download() } catch {}
      }

      const baseText = q.text || q.caption || ''
      const finalText = [userText, baseText].filter(Boolean).join('\n')

      if (type === 'imageMessage') {
        await conn.sendMessage(m.chat, { image: media, caption: finalText, ...messageOptions })
      } else if (type === 'videoMessage') {
        await conn.sendMessage(m.chat, { video: media, caption: finalText, ...messageOptions })
      } else if (type === 'audioMessage') {
        await conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mp4', ...messageOptions })
      } else if (type === 'documentMessage') {
        await conn.sendMessage(m.chat, { document: media, fileName: q.fileName || 'archivo', mimetype: q.mimetype, caption: finalText, ...messageOptions })
      } else {
        await conn.sendMessage(m.chat, { text: finalText, ...messageOptions })
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: userText || 'Hola a todos! 👋',
        ...messageOptions
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
