/**
 * Code: Multi-Source Image Search
 * Función: Búsqueda avanzada de imágenes en alta resolución combinando 
 * múltiples fuentes (Dorratz v2 y Unsplash v3).
 * * Code creado por Barboza Developer
 * Se te agradece dejar los créditos.
 * Disfruta el código de Barboza Developer x Zona Developers.
 */

import fetch from "node-fetch"

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Ingrese lo que desea buscar*\n\n*Ejemplo:* ${usedPrefix}${command} Messi vs Cristiano Ronaldo`)

    await m.react('🔍')

    try {
        // URLs de ambas APIs
        const apiDorratzV2 = `https://api.dorratz.com/v2/wallpaper-s?q=${encodeURIComponent(text)}`
        const apiUnsplashV3 = `https://api.dorratz.com/v3/unsplash?query=${encodeURIComponent(text)}`

        // Intentar obtener resultados de ambas de forma aleatoria para variar
        const sources = [apiDorratzV2, apiUnsplashV3]
        const selectedApi = sources[Math.floor(Math.random() * sources.length)]
        
        const res = await fetch(selectedApi)
        const json = await res.json()

        let imageUrl = ''

        // Lógica para manejar los diferentes formatos de respuesta
        if (selectedApi.includes('v2/wallpaper-s')) {
            if (json.status === 200 && json.result?.length > 0) {
                imageUrl = json.result[Math.floor(Math.random() * json.result.length)]
            }
        } else {
            if (json.result?.length > 0) {
                // De Unsplash usamos la URL 'regular' o 'full'
                const randomRes = json.result[Math.floor(Math.random() * json.result.length)]
                imageUrl = randomRes.urls.regular || randomRes.urls.full
            }
        }

        // Si la API seleccionada no dio resultados, intentamos con la otra automáticamente
        if (!imageUrl) {
            const backupApi = selectedApi === apiDorratzV2 ? apiUnsplashV3 : apiDorratzV2
            const res2 = await fetch(backupApi)
            const json2 = await res2.json()
            
            if (backupApi.includes('v2/wallpaper-s')) {
                imageUrl = json2.result?.[0]
            } else {
                imageUrl = json2.result?.[0]?.urls?.regular
            }
        }

        if (!imageUrl) {
            await m.react('❌')
            return m.reply('⚠️ No se encontraron imágenes para esa búsqueda.')
        }

        await conn.sendMessage(m.chat, { 
            image: { url: imageUrl }, 
            caption: `*Resultado para:* ${text}\n\n_Disfruta el código de Barboza Developer x Zona Developers._` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('🛑 Error al procesar la solicitud.')
    }
}

handler.help = ['imagen']
handler.tags = ['img']
handler.command = /^(imagen|img|wallpaper)$/i

export default handler
