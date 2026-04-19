import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Carga segura de la imagen local al iniciar
const imgPath = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
let imgLocal
try {
  imgLocal = existsSync(imgPath) ? readFileSync(imgPath) : Buffer.alloc(0)
} catch (e) {
  imgLocal = Buffer.alloc(0)
  console.error('[ERROR] Error al leer miniurl:', e)
}

let handler = async (m, { conn, text, participants, isAdmin, usedPrefix }) => {
  try {
    if (!isAdmin) return m.reply('🚫 Este comando solo puede usarlo un administrador del grupo.')

    let users = participants.map(u => u.id)
    let q = m.quoted ? m.quoted : m
    let contenido = text || q.text || '📢 ¡Atención a todos! 👋'

    // Formateamos el texto para que incluya la instrucción del botón de forma visual
    // Si los botones nativos fallan en tu versión, esta estructura es 100% segura
    let txt = `${contenido}\n\n`
    txt += `*By Barboza-Team* ⚡`

    // Intentamos enviar con el formato de botones más estable
    await conn.sendMessage(m.chat, {
      image: imgLocal,
      caption: txt,
      footer: 'Presiona el botón para ver los canales ⚡',
      buttons: [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: '📢 Ver canales' }, type: 1 }
      ],
      headerType: 4,
      mentions: users,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 999,
        externalAdReply: {
          title: 'WhatsApp Business ✅',
          body: '𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾',
          thumbnail: imgLocal,
          sourceUrl: 'https://github.com/Barboza-Team',
          mediaType: 1,
          showAdAttribution: true
        }
      }
    }, { quoted: m })

  } catch (error) {
    console.error("[ERROR EN HIDETAG]:", error)
    // Si falla lo anterior, esto es el "Salvavidas" (siempre responderá aquí)
    await conn.sendMessage(m.chat, { 
      text: (text || '📢 Notificación'), 
      mentions: participants.map(u => u.id) 
    }, { quoted: m })
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = ['hidetag', 'notify', 'n', 'noti', 'b'] 
handler.group = true
handler.admin = true

export default handler
