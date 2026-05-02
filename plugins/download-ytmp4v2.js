/**
 * 📂 YT-SEARCH & DOWNLOAD SCRAPER
 * 📝 DESCRIPCIÓN: Busca y descarga videos de YouTube por nombre o link.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import yts from 'yt-search'
import ytdl from 'ytdl-core'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`✨ *¿Qué video deseas buscar?*\n\n> *Ejemplo:* ${usedPrefix + command} Yan Block 444`)

    await m.react('🔍')

    try {
        // 1. SCRAPER DE BÚSQUEDA: Buscamos el video en YouTube
        const search = await yts(text)
        const video = search.videos[0]

        if (!video) {
            await m.react('❌')
            return m.reply('⚠️ No se encontraron resultados.')
        }

        // 2. SCRAPER DE EXTRACCIÓN: Obtenemos el link de descarga directo
        const info = await ytdl.getInfo(video.url)
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' })

        let caption = `🎥 *BARBOZA YT-SEARCH SCRAPER*\n\n`
        caption += `📌 *Título:* ${video.title}\n`
        caption += `👤 *Canal:* ${video.author.name}\n`
        caption += `⏱️ *Duración:* ${video.timestamp}\n`
        caption += `👁️ *Vistas:* ${video.views.toLocaleString()}\n\n`
        caption += `> *By: Barboza Developer x Zona Developers*`

        // 3. ENVÍO DEL CONTENIDO
        await conn.sendMessage(m.chat, { 
            video: { url: format.url }, 
            caption: caption,
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ Error al buscar o procesar el video.')
    }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4v2)$/i

export default handler
