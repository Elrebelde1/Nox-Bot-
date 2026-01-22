import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `⚠️ Ingrese el nombre o link de YouTube.`, m)
        await m.react('⏳')

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        
        if (!search.all || search.all.length === 0) {
            await m.react('❌')
            throw '❌ No se encontraron resultados.'
        }

        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        const { title, thumbnail, timestamp, views, url, author } = result

        let info = `🔷 *YOUTUBE DOWNLOADER* 🔷\n\n`
        info += `⭐ *Título:* ${title}\n`
        info += `👤 *Autor:* ${author.name}\n`
        info += `⏱️ *Duración:* ${timestamp}\n`
        info += `👁️ *Vistas:* ${views.toLocaleString()}\n`
        info += `🔗 *Link:* ${url}`

        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        const format = isAudio ? 'mp3' : 'mp4'
        const apiKey = 'barboza'

        const apiUrl = `https://getmod-mediahub.vercel.app/api/ytdl?url=${encodeURIComponent(url)}&format=${format}&apikey=${apiKey}`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.status || !json.dl) throw '🛑 Error al obtener el archivo de la API.'

        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: json.dl }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: json.dl }, 
                fileName: `${title}.mp4`, 
                caption: `✅ *Descarga Completa:* ${title}`,
                mimetype: 'video/mp4'
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ Error: ${e.message || e}`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|ytmp4|playaudio|mp4)$/i
handler.group = false
handler.register = false

export default handler
