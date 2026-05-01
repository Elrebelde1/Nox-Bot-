/**
 * Code: AI Image Generator
 * Función: Generación de imágenes artísticas y realistas a partir de texto 
 * utilizando modelos de difusión avanzada.
 * * Code creado por Barboza Developer
 * Se te agradece dejar los créditos.
 * Disfruta el código de Barboza Developer x Zona Developers.
 */

import fetch from "node-fetch"

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Ingrese la descripción de la imagen*\n\n*Ejemplo:* ${usedPrefix}${command} un gato astronauta en el espacio`)

    await m.react('🎨')

    try {
        // Usando el endpoint de generación de imágenes de Delirius
        const res = await fetch(`https://api.delirius.store/ia/midjourney?query=${encodeURIComponent(text)}`)
        const json = await res.json()

        if (!json.status || !json.data) {
            await m.react('❌')
            return m.reply('⚠️ Error al generar la imagen.')
        }

        const image = json.data.image // La URL de la imagen generada
        
        await conn.sendMessage(m.chat, { 
            image: { url: image }, 
            caption: `*Resultado para:* ${text}\n\n_Disfruta el código de Barboza Developer x Zona Developers._` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('🛑 Error en el servidor de imágenes.')
    }
}

handler.help = ['imagen', 'iaimg']
handler.tags = ['ia']
handler.command = /^(draw)$/i

export default handler
