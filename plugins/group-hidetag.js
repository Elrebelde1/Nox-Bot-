import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, participants }) => {
  try {
    // Obtenemos todos los IDs de los participantes correctamente
    const users = participants.map(u => u.id) 
    const isBusiness = conn.user.isBusiness || false
    const platformName = isBusiness ? 'WhatsApp Business' : 'WhatsApp'

    const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
    let catalogoImg
    if (existsSync(pathImg)) {
      catalogoImg = readFileSync(pathImg)
    } else {
      catalogoImg = { url: 'https://files.catbox.moe/t7uytz.png' }
    }

    const userText = m.text ? m.text.slice(m.text.split(' ')[0].length).trim() : ''

    // Configuración del mensaje
    const messageOptions = {
      contextInfo: {
        mentions: users, // <--- LAS MENCIONES DEBEN IR AQUÍ ADENTRO
        externalAdReply: {
          title: `${platformName} ✅`, 
          body: '𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾',
          thumbnail: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url },
          sourceUrl: 'https://github.com/Barboza-Team', 
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true
        }
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
      const finalText = [userText, baseText].filter(Boolean).join('\n')

      if (type === 'imageMessage') {
        await conn.sendMessage(m.chat, { image: media, caption: finalText, ...messageOptions.contextInfo }, { mentions: users })
      } else if (type === 'videoMessage') {
        await conn.sendMessage(m.chat, { video: media, caption: finalText, ...messageOptions.contextInfo }, { mentions: users })
      } else if (type === 'audioMessage') {
        await conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mp4', ...messageOptions.contextInfo }, { mentions: users })
      } else if (type === 'documentMessage') {
        await conn.sendMessage(m.chat, { document: media, fileName: q.fileName || 'archivo', mimetype: q.mimetype, caption: finalText, ...messageOptions.contextInfo }, { mentions: users })
      } else {
        await conn.sendMessage(m.chat, { text: finalText, mentions: users, contextInfo: messageOptions.contextInfo })
      }
    } else {
      // Mensaje de texto simple con hidetag
      await conn.sendMessage(m.chat, {
        text: userText || '¡Atención a todos! 👋',
        mentions: users,
        contextInfo: messageOptions.contextInfo
      })
    }
  } catch (e) {
    console.error(e)
    m.reply('Ocurrió un error al procesar el hidetag')
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|notify|n|b)$/i // Añadí 'b' para que funcione con .b hola
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
