import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Tus enlaces de qu.ax asignados correctamente
    const mapas = {
        'bermuda': {
            nombre: '𝐁𝐄𝐑𝐌𝐔𝐃𝐀 🏝️',
            url: 'https://qu.ax/Z6Ho1'
        },
        'purgatorio': {
            nombre: '𝐏𝐔𝐑𝐆𝐀𝐓𝐎𝐑𝐈𝐎 🏔️',
            url: 'https://qu.ax/f118g'
        },
        'kalahari': {
            nombre: '𝐊𝐀𝐋𝐀𝐇𝐀𝐑𝐈 🏜️',
            url: 'https://qu.ax/B5sH9'
        },
        'alpes': {
            nombre: '𝐀𝐋𝐏𝐄𝐒 ❄️',
            url: 'https://qu.ax/kTUpa'
        },
        'nexterra': {
            nombre: '𝐍𝐄𝐗𝐓𝐄𝐑𝐑𝐀 🤖',
            url: 'https://qu.ax/Brc3j'
        }
    }

    let seleccion = text.toLowerCase().trim()

    if (!seleccion || !mapas[seleccion]) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
        let menuImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://qu.ax/Z6Ho1' }

        let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
        txt += `   ⚔️  𝐒𝐄𝐋𝐄𝐂𝐂𝐈Ó𝐍 𝐃𝐄 𝐌𝐀𝐏𝐀𝐒  ⚔️\n`
        txt += `╚════════════════════╝\n\n`
        
        txt += `📍 *EJEMPLO:* \n`
        txt += `  *${usedPrefix + command} kalahari*\n\n`

        txt += `🗺️ *LISTA DISPONIBLE:*\n`
        txt += `  • Bermuda\n  • Purgatorio\n  • Kalahari\n  • Alpes\n  • Nexterra\n\n`
        
        txt += `*◈────────── • ☄️ • ──────────◈*\n`
        txt += `   ✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑬𝒔𝒕𝒓𝒂𝒕𝒆𝒈𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ✨`

        return await conn.sendMessage(m.chat, { image: menuImg, caption: txt }, { quoted: m })
    }

    let mapa = mapas[seleccion]

    let cap = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    cap += `   🌍  𝐌𝐀𝐏𝐀: ${mapa.nombre}\n`
    cap += `╚════════════════════╝\n\n`
    cap += `> 🥷🏻 *Analicen el terreno. La victoria se construye con estrategia y honor. ¡A la batalla!*`

    await conn.sendMessage(m.chat, { 
        image: { url: mapa.url }, 
        caption: cap 
    }, { quoted: m })
}

handler.help = ['mapa']
handler.tags = ['clanes']
handler.command = /^(mapa|mapas)$/i
handler.group = true

export default handler
