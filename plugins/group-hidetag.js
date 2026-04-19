import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Carga segura de la imagen local al iniciar
const imgPath = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
let imgLocal
try {
  imgLocal = existsSync(imgPath) ? readFileSync(imgPath) : Buffer.alloc(0)
} catch (e) {
  imgLocal = Buffer.alloc(0)
  console.error('[ERROR] Error al leer miniurl para hidetag:', e)
}

let handler = async (m, { conn, text, participants, isAdmin, usedPrefix }) => {
  try {
    if (!isAdmin) return m.reply('🚫 Este comando solo puede usarlo un administrador del grupo.')

    let users = participants.map(u => u.id)
    let q = m.quoted ? m.quoted : m
    let contenido = text || q.text || '📢 ¡Atención a todos! 👋'

    // Generamos el mensaje con el estilo de Sasuke Bot
    const msg = await generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          buttonsMessage: {
            contentText: contenido,
            footerText: 'By Barboza-Team ⚡',
            buttons: [
              { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: '📢 Ver canales' }, type: 1 }
            ],
            headerType: 4,
            imageMessage: (await conn.prepareWAMessageMedia({ image: imgLocal }, { upload: conn.waUploadToServer })).imageMessage,
            contextInfo: {
              mentionedJid: users,
              isForwarded: true,
              forwardingScore: 999,
              externalAdReply: {
                title: 'WhatsApp Business ✅',
                body: '𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾',
                thumbnail: imgLocal,
                sourceUrl: 'https://github.com/Barboza-Team',
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: false
              }
            }
          }
        }
      }
    }, { 
      quoted: {
        key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net', fromMe: false },
        message: { conversation: "𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾" }
      },
      userJid: conn.user.id 
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (error) {
    console.error("[ERROR EN HIDETAG]:", error)
    // Fallback en caso de que relayMessage falle por incompatibilidad de botones
    conn.sendMessage(m.chat, { text: text || '📢 Notificación a todos', mentions: participants.map(u => u.id) }, { quoted: m })
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = ['hidetag', 'notify', 'n', 'noti', 'b'] 
handler.group = true
handler.admin = true

export default handler
