import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'
import axios from 'axios'

let handler = async (m, { conn, text, participants, isAdmin }) => {
  if (!isAdmin) return m.reply('🚫 Este comando solo puede usarlo un administrador del grupo.')

  let users = participants.map(u => u.id)
  let q = m.quoted ? m.quoted : m
  let contenido = text || q.text || '📢 ¡Atención a todos! 👋'

  try {
    // Descargamos la imagen para convertirla en Buffer y que aparezca sí o sí
    const response = await axios.get('https://files.catbox.moe/t7uytz.png', { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, 'utf-8')

    const msg = await generateWAMessageFromContent(m.chat, {
      extendedTextMessage: {
        text: contenido,
        contextInfo: {
          mentionedJid: users,
          isForwarded: true,
          forwardingScore: 999,
          externalAdReply: {
            title: 'WhatsApp Business ✅',
            body: '𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾',
            thumbnail: buffer, // <--- Usamos el Buffer descargado aquí
            sourceUrl: 'https://github.com/Barboza-Team', 
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false 
          }
        }
      }
    }, { 
      quoted: {
        key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net' },
        message: { conversation: "𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾" }
      },
      userJid: conn.user.id 
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (e) {
    console.error(e)
    // Si falla la descarga, enviamos sin imagen para no trabar el bot
    m.reply('Error al cargar la imagen, enviando solo texto...')
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = ['hidetag', 'notify', 'n', 'noti', 'b'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
