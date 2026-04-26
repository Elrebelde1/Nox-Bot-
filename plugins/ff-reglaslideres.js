import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Inicializar el espacio en la base de datos si no existe
    global.db.data.reglasClan = global.db.data.reglasClan || { texto: "No hay reglas establecidas aún." }

    // Si el comando es para configurar las reglas (Solo Admins)
    if (command === 'setreglas') {
        if (!text) throw `⚠️ *Escribe el nuevo reglamento después del comando.*\n\nEjemplo:\n${usedPrefix + command} 1. No ser tóxico...`
        global.db.data.reglasClan.texto = text
        return m.reply('✅ *Reglamento actualizado correctamente.*')
    }

    // Comandos para ver las reglas
    const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
    let menuImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' }

    let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    txt += `   ⚔️  𝐑𝐄𝐆𝐋𝐀𝐌𝐄𝐍𝐓𝐎 𝐃𝐄𝐋 𝐂𝐋𝐀𝐍  ⚔️\n`
    txt += `╚════════════════════╝\n\n`

    txt += `${global.db.data.reglasClan.texto}\n\n`

    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑳𝒂 𝒗𝒐𝒛 𝒅𝒆𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 ✨`

    await conn.sendMessage(m.chat, { 
        image: menuImg, 
        caption: txt 
    }, { quoted: m })
}

handler.help = ['reglas', 'setreglas']
handler.tags = ['clanes']
handler.command = /^(reglas|setreglas|normas)$/i
handler.group = true

export default handler
