import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, text }) => {
  const canal1 = "https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I"
  const canal2 = "https://whatsapp.com/channel/0029VbBbaFCAO7RL7UEhBD2F"

  // Detecta el ID del botón presionado (ver_canales)
  let id = text || m.text

  if (id === 'ver_canales') {
    let txt = `✨ *¡Hola! Forma parte de nuestra comunidad oficial.* 👤⚡\n\n`
    txt += `Sigue nuestros canales oficiales para estar al tanto de cada actualización de **Sasuke Bot MD**.\n\n`
    txt += `🔗 *Canal Principal:* ${canal1}\n\n`
    txt += `🚀 *Canal de Soporte:* ${canal2}\n\n`
    txt += `> 𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺ᴍ ⚡`

    await conn.reply(m.chat, txt, m)
  }
}

// El comando debe ser igual al buttonId que pusiste en enable.js
handler.command = ['ver_canales']

export default handler
