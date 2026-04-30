import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*Ingrese el nombre o el link de YouTube.*\n\n*Ejemplos:*\n${usedPrefix}play3 Yan Block 444\n${usedPrefix}play4 https://www.youtube.com/watch?v=5M_n2UCe7DQ`, m)

    const isVideo = command === 'play4'
    await m.react(isVideo ? '🎥' : '🎧')

    try {
        let videoUrl = text
        let description = ''

        // Si no es un link, buscar el video
        if (!text.match(/youtu/gi)) {
            const search = await yts(text)
            if (!search.all.length) {
                await m.react('❌')
                return m.reply('❌ No se encontraron resultados.')
            }
            videoUrl = search.videos[0].url
            description = search.videos[0].timestamp
        }

        // Configuración de la API
        const endpoint = isVideo ? 'ytmp4' : 'ytmp3'
        const apiUrl = `https://api.delirius.store/download/${endpoint}?url=${encodeURIComponent(videoUrl)}${isVideo ? '&format=360p' : ''}`
        
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.status || !json.data) {
            await m.react('❌')
            return m.reply('⚠️ Error al obtener el archivo.')
        }

        const { title, author, image, download } = json.data

        // Texto del mensaje
        let info = `*🎬 YOUTUBE DOWNLOADER*\n\n`
        info += `📌 *Título:* ${title}\n`
        info += `👤 *Canal:* ${author}\n`
        if (description) info += `⏱️ *Duración:* ${description}\n`
        info += `📦 *Calidad:* ${isVideo ? '360p' : '128kbps'}\n`

        if (isVideo) {
            // Enviar Video
            await conn.sendMessage(m.chat, { 
                video: { url: download }, 
                caption: info,
                mimetype: 'video/mp4'
            }, { quoted: m })
        } else {
            // Enviar Imagen de portada y luego el Audio
            await conn.sendMessage(m.chat, { image: { url: image }, caption: info }, { quoted: m })
            await conn.sendMessage(m.chat, { 
                audio: { url: download }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (error) {
        console.error(error)
        await m.react('❌')
        conn.reply(m.chat, '🛑 Ocurrió un error inesperado.', m)
    }
}

handler.help = ['play3', 'play4']
handler.tags = ['downloader']
handler.command = ['play3', 'play4']

export default handler
