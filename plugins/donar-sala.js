import { readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, groupMetadata }) => {
    // Cargar imagen local
    let menuImg
    try {
        menuImg = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'))
    } catch {
        menuImg = { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' }
    }

    // Elegir a alguien al azar del grupo
    const participantes = groupMetadata.participants.map(u => u.id)
    const victima = participantes[Math.floor(Math.random() * participantes.length)]

    let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    txt += `   ⚔️  𝐒𝐎𝐑𝐓𝐄𝐎 𝐃𝐄 𝐒𝐀𝐋𝐀  ⚔️\n`
    txt += `╚════════════════════╝\n\n`

    txt += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ 📢  *EL ELEGIDO ES...* \n`
    txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

    txt += `> 🏮 *El destino ha hablado. El siguiente guerrero debe poner la sala para el clan:* \n\n`
    
    txt += `👤 *DONADOR:* @${victima.split('@')[0]}\n\n`

    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `  ⚠️ *TIENES 5 MINUTOS PARA CONFIRMAR*\n`
    txt += `  ⚡ Si no tienes, busca quién te la preste.\n`
    txt += `  ⚡ No decepciones al equipo.\n`
    txt += `*◈────────── • ☄️ • ──────────◈*\n\n`

    txt += `✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑳𝒂 𝒗𝒐𝒛 𝒅𝒆𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 ✨`

    await conn.sendMessage(m.chat, {
        image: menuImg,
        caption: txt,
        mentions: [victima] // Esto hace que le llegue la mención
    }, { quoted: m })
}

handler.help = ['donarsala']
handler.tags = ['clanes']
handler.command = /^(donarsala|sala|donar|suerte)$/i
handler.group = true

export default handler
