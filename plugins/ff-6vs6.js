import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Base de datos de imágenes en qu.ax (Permanentes)
    const mapas = {
        'bermuda': {
            nombre: '𝐁𝐄𝐑𝐌𝐔𝐃𝐀 🏝️',
            url: 'https://qu.ax/YvAn.jpg'
        },
        'kalahari': {
            nombre: '𝐊𝐀𝐋𝐀𝐇𝐀𝐑𝐈 🏜️',
            url: 'https://qu.ax/vXpS.jpg'
        },
        'purgatorio': {
            nombre: '𝐏𝐔𝐑𝐆𝐀𝐓𝐎𝐑𝐈𝐎 🏔️',
            url: 'https://qu.ax/WpXp.jpg'
        },
        'alpes': {
            nombre: '𝐀𝐋𝐏𝐄𝐒 ❄️',
            url: 'https://qu.ax/XmYf.jpg'
        },
        'nexterra': {
            nombre: '𝐍𝐄𝐗𝐓𝐄𝐑𝐑𝐀 🤖',
            url: 'https://qu.ax/pYmG.jpg'
        }
    }

    let seleccion = text.toLowerCase().trim()

    // Si no escribe el nombre del mapa o el mapa no existe
    if (!seleccion || !mapas[seleccion]) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
        let menuImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://qu.ax/YvAn.jpg' }

        let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
        txt += `   ⚔️  𝐒𝐄𝐋𝐄𝐂𝐂𝐈Ó𝐍 𝐃𝐄 𝐌𝐀𝐏𝐀𝐒  ⚔️\n`
        txt += `╚════════════════════╝\n\n`
        
        txt += `> 🏮 *Escribe el nombre del mapa correctamente para enviarlo.*\n\n`
        
        txt += `📍 *EJEMPLO:* \n`
        txt += `  *${usedPrefix + command} kalahari*\n\n`

        txt += `🗺️ *LISTA DE MAPAS:*\n`
        txt += `  • Bermuda\n`
        txt += `  • Kalahari\n`
        txt += `  • Purgatorio\n`
        txt += `  • Alpes\n`
        txt += `  • Nexterra\n\n`
        
        txt += `*◈────────── • ☄️ • ──────────◈*\n`
        txt += `   ✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑬𝒔𝒕𝒓𝒂𝒕𝒆𝒈𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ✨`

        return await conn.sendMessage(m.chat, { image: menuImg, caption: txt }, { quoted: m })
    }

    // Proceso de envío del mapa seleccionado
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

handler.help = ['mapa <nombre>']
handler.tags = ['clanes']
handler.command = /^(mapa|mapas)$/i
handler.group = true

export default handler
