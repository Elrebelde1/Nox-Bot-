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
        // Llamada a la API de Delirius para imágenes de TikTok
        const { data } = await axios.get(`https://api.delirius.store/search/tiktoksearchimages?query=${encodeURIComponent(text)}`)

        if (!data.status || !data.data.length) {
            await m.react('❌')
            return m.reply('⚠️ No encontré resultados para esa búsqueda.')
        }

        // Seleccionamos el primer resultado (el más relevante)
        const res = data.data[0]
        const fotos = res.download // Array con los links de las imágenes

        // Información breve y en español
        let info = `✨ *TIKTOK SEARCH — BARBOZA*\n\n`
        info += `📝 *Descripción:* ${res.title || 'Sin descripción'}\n`
        info += `👤 *Usuario:* ${res.author}\n`
        info += `❤️ *Likes:* ${res.likes.toLocaleString()}\n`
        info += `📸 *Total de fotos:* ${fotos.length}\n\n`
        info += `> *By: Barboza Developer x Zona Developers*`

        // Enviamos la PRIMERA FOTO con la información
        await conn.sendMessage(m.chat, { 
            image: { url: fotos[0] }, 
            caption: info 
        }, { quoted: m })

        // Enviamos el RESTO de las fotos del carrusel (máximo 5 para no saturar el bot)
        if (fotos.length > 1) {
            for (let i = 1; i < fotos.length; i++) {
                if (i >= 6) break // Límite de seguridad
                
                await new Promise(resolve => setTimeout(resolve, 800)) // Pausa para evitar spam
                await conn.sendMessage(m.chat, { image: { url: fotos[i] } }, { quoted: m })
            }
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ Hubo un error al procesar la búsqueda.')
    }
}

handler.help = ['tiktokimg']
handler.tags = ['search']
handler.command = /^(tiktokimg|ttimg|ttsearch)$/i

export default handler
