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

    // Definimos el botón que llama al comando .scanal
    const buttons = [
      { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: '📢 Ver canales' }, type: 1 }
    ]

    const buttonMessage = {
      image: imgLocal, // Imagen local miniurl
      caption: contenido,
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4,
      mentions: users, // Menciona a todos los integrantes
      contextInfo: {
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

    // Usamos sendMessage directamente que es más compatible con botones actualmente
    await conn.sendMessage(m.chat, buttonMessage, { 
      quoted: {
        key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net', fromMe: false },
        message: { conversation: "𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾" }
      }
    })

  } catch (error) {
    console.error("[ERROR EN HIDETAG]:", error)
    conn.sendMessage(m.chat, { text: (text || '📢 Notificación'), mentions: participants.map(u => u.id) }, { quoted: m })
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = ['hidetag', 'notify', 'n', 'noti', 'b'] 
handler.group = true
handler.admin = true

export default handler
