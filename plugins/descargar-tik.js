/**
 * Code creado por Barboza Developer
 * Se te agradece dejar los créditos.
 * Disfruta el código de Barboza Developer x Zona Developers.
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `✨ *¿Qué imágenes de TikTok buscas?*\n\n> *Ejemplo:* ${usedPrefix + command} Chaewon`, m)

    await m.react('📸')

    try {
        // Llamada a la API de búsqueda de imágenes de TikTok
        const { data } = await axios.get(`https://api.delirius.store/search/tiktoksearchimages?query=${encodeURIComponent(text)}`)

        if (!data.status || !data.data.length) {
            await m.react('❌')
            return m.reply('⚠️ No se encontraron resultados para esa búsqueda.')
        }

        // Tomamos el primer resultado del carrusel
        const primerResultado = data.data[0]
        const imagenes = primerResultado.download // Array de links de fotos

        let info = `✨ *TIKTOK IMAGES — BARBOZA*\n\n`
        info += `📝 *Título:* ${primerResultado.title}\n`
        info += `👤 *Autor:* ${primerResultado.author}\n`
        info += `📊 *Likes:* ${primerResultado.likes}\n`
        info += `📸 *Fotos encontradas:* ${imagenes.length}\n\n`
        info += `> *By: Barboza Developer x Zona Developers*`

        // Enviamos la primera imagen con la información
        await conn.sendMessage(m.chat, { 
            image: { url: imagenes[0] }, 
            caption: info 
        }, { quoted: m })

        // Si hay más imágenes, las enviamos una por una (opcional: puedes limitar a 5 para no saturar)
        if (imagenes.length > 1) {
            for (let i = 1; i < imagenes.length; i++) {
                // Pequeña espera para evitar spam-ban del bot
                await new Promise(resolve => setTimeout(resolve, 1000))
                await conn.sendMessage(m.chat, { image: { url: imagenes[i] } }, { quoted: m })
                
                // Limitamos a 6 fotos para que el grupo no se llene de golpe
                if (i >= 5) break 
            }
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ Error al buscar imágenes en TikTok.')
    }
}

handler.help = ['tiktokimg', 'ttimg']
handler.tags = ['search']
handler.command = /^(tiktokimg|ttimg|ttsearch)$/i

export default handler
