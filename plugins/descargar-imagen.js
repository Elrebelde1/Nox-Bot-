/**
 * Code: Wallpaper Search
 * Función: Búsqueda y obtención de fondos de pantalla en alta resolución 
 * mediante la API de Dorratz.
 * * Code creado por Barboza Developer
 * Se te agradece dejar los créditos.
 * Disfruta el código de Barboza Developer x Zona Developers.
 */

import fetch from "node-fetch"

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Ingrese el tema del fondo de pantalla*\n\n*Ejemplo:* ${usedPrefix}${command} Minecraft`)

    await m.react('🔍')

    try {
        const res = await fetch(`https://api.dorratz.com/v2/wallpaper-s?q=${encodeURIComponent(text)}`)
        const json = await res.json()

        if (!json.status === 200 || !json.result || json.result.length === 0) {
            await m.react('❌')
            return m.reply('⚠️ No se encontraron resultados.')
        }

        // Selecciona un wallpaper aleatorio de la lista de resultados
        const wallpaper = json.result[Math.floor(Math.random() * json.result.length)]

        await conn.sendMessage(m.chat, { 
            image: { url: wallpaper }, 
            caption: `*Resultado para:* ${text}\n\n_Disfruta el código de Barboza Developer x Zona Developers._` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('🛑 Error al buscar el fondo de pantalla.')
    }
}

handler.help = ['wallpaper', 'wp']
handler.tags = ['img']
handler.command = /^(wallpaper|wp|fondo)$/i

export default handler
