import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre o link de YouTube.`, m)
        await m.react('🕒')

        // 1. Buscar el video en YouTube
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]

        if (!result) throw 'ꕥ No se encontraron resultados.'

        const { title, thumbnail, timestamp, views, url, author } = result
        const info = `「✦」Descargando *<${title}>*\n\n> ❑ Canal » *${author.name}*\n> ♡ Vistas » *${views.toLocaleString()}*\n> ✧︎ Duración » *${timestamp}*\n> ➪ Link » ${url}`

        // 2. Enviar la miniatura e información
        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

        // 3. Determinar si es audio o video para la nueva API
        const isAudio = ['play', 'yta', 'ytmp3', 'playaudio'].includes(command)
        const format = isAudio ? 'mp3' : 'mp4'
        const apiKey = 'barboza' // Tu apikey proporcionada

        // 4. Llamada a la nueva API: getmod-mediahub
        const apiUrl = `https://getmod-mediahub.vercel.app/api/ytdl?url=${encodeURIComponent(url)}&format=${format}&apikey=${apiKey}`
        const res = await fetch(apiUrl)
        const json = await res.json()

        // Basado en tu JSON de ejemplo: json.status y json.dl
        if (!json.status || !json.dl) throw '⚠ No se pudo obtener el archivo de descarga.'

        // 5. Enviar el archivo descargado
        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: json.dl }, 
                fileName: `${json.title || title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: json.dl }, 
                fileName: `${json.title || title}.mp4`, 
                caption: `> ❀ ${json.title || title}`,
                mimetype: 'video/mp4'
            }, { quoted: m })
        }

        await m.react('✔️')

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        return conn.reply(m.chat, `⚠︎ Error: ${e.message || e}`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|ytmp4|playaudio|mp4)$/i
handler.group = false

export default handler
