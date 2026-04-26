import { readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    // Cargar imagen local (miniurl.jpg)
    let menuImg
    try {
        menuImg = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'))
    } catch {
        menuImg = { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' }
    }

    let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    txt += `   ⚔️  𝐃𝐎𝐍𝐀𝐂𝐈Ó𝐍 𝐃𝐄 𝐒𝐀𝐋𝐀𝐒  ⚔️\n`
    txt += `╚════════════════════╝\n\n`

    txt += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ ✨  *¡ATENCIÓN GUERREROS!* ✨\n`
    txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

    txt += `> 🏮 *Se solicita el apoyo de un voluntario para donar la sala del próximo reto.* \n\n`
    
    txt += `📢 *RECUERDEN:* \n`
    txt += `  ⚡ Sin salas no hay gloria.\n`
    txt += `  ⚡ El clan se fortalece con tu apoyo.\n`
    txt += `  ⚡ Al donar, aseguras tu cupo titular.\n\n`

    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `   🛡️ *RECOMPENSA:* Respeto y Rango \n`
    txt += `*◈────────── • ☄️ • ──────────◈*\n\n`

    txt += `👤 *Donador:* ____________________\n\n`
    
    txt += `✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑼𝒏𝒆𝒕𝒆 𝒂𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 ✨`

    await conn.sendMessage(m.chat, {
        image: menuImg,
        caption: txt
    }, { quoted: m })
}

handler.help = ['donarsala']
handler.tags = ['clanes']
handler.command = /^(donarsala|sala|donar)$/i
handler.group = true

export default handler
