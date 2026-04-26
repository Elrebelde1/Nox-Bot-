import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Nuevas URLs verificadas
    const mapas = {
        'bermuda': {
            nombre: '𝐁𝐄𝐑𝐌𝐔𝐃𝐀 🏝️',
            url: 'https://files.catbox.moe/6v0f9j.jpg'
        },
        'kalahari': {
            nombre: '𝐊𝐀𝐋𝐀𝐇𝐀𝐑𝐈 🏜️',
            url: 'https://files.catbox.moe/9p9x07.jpg'
        },
        'purgatorio': {
            nombre: '𝐏𝐔𝐑𝐆𝐀𝐓𝐎𝐑𝐈𝐎 🏔️',
            url: 'https://files.catbox.moe/97p9v3.jpg'
        },
        'alpes': {
            nombre: '𝐀𝐋𝐏𝐄𝐒 ❄️',
            url: 'https://files.catbox.moe/og6h0u.jpg'
        },
        'nexterra': {
            nombre: '𝐍𝐄𝐗𝐓𝐄𝐑𝐑𝐀 🤖',
            url: 'https://files.catbox.moe/8b0n25.jpg'
        }
    }

    let seleccion = text.toLowerCase().trim()

    // Si no hay texto o el mapa no existe, muestra el menú de ayuda
    if (!seleccion || !mapas[seleccion]) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
        let menuImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/6v0f9j.jpg' }

        let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
        txt += `   ⚔️  𝐒𝐄𝐋𝐄𝐂𝐂𝐈Ó𝐍 𝐃𝐄 𝐌𝐀𝐏𝐀𝐒  ⚔️\n`
        txt += `╚════════════════════╝\n\n`
        
        txt += `> 🏮 *Escribe el nombre del mapa correctamente.*\n\n`
        
        txt += `📍 *EJEMPLOS:* \n`
        txt += `  • ${usedPrefix + command} bermuda\n`
        txt += `  • ${usedPrefix + command} kalahari\n\n`

        txt += `🗺️ *LISTA DISPONIBLE:*\n`
        txt += `  • Bermuda\n  • Kalahari\n  • Purgatorio\n  • Alpes\n  • Nexterra\n\n`
        
        txt += `*◈────────── • ☄️ • ──────────◈*\n`
        txt += `   ✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑬𝒔𝒕𝒓𝒂𝒕𝒆𝒈𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ✨`

        return await conn.sendMessage(m.chat, { image: menuImg, caption: txt }, { quoted: m })
    }

    // Enviar el mapa seleccionado
    let mapa = mapas[seleccion]

    let cap = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    cap += `   🌍  𝐌𝐀𝐏𝐀: ${mapa.nombre}\n`
    cap += `╚════════════════════╝\n\n`
    cap += `> 🥷🏻 *Analicen el terreno. La victoria se construye con estrategia y honor. ¡A la batalla!*`

    // Se usa un try-catch para manejar errores de red silenciosamente
    try {
        await conn.sendMessage(m.chat, { 
            image: { url: mapa.url }, 
            caption: cap 
        }, { quoted: m })
    } catch (e) {
        console.log(e)
        m.reply('❌ Error al cargar la imagen. Inténtalo de nuevo.')
    }
}

handler.help = ['mapa']
handler.tags = ['clanes']
handler.command = /^(mapa|mapas)$/i
handler.group = true

export default handler
