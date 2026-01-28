import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `⚠️ Ingrese el nombre o link de YouTube.`, m)
        await m.react('⏳')

        // 1. Búsqueda del video
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)

        if (!search.all || search.all.length === 0) {
            await m.react('❌')
            throw '❌ No se encontraron resultados.'
        }

        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        const { title, thumbnail, timestamp, url, author } = result

        // 2. Determinar si es audio o video según el comando
        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        
        // 3. Selección de API
        let downloadUrl = ''
        
        if (isAudio) {
            // --- API PARA AUDIO (Mediahub) ---
            const apiKeyAudio = 'barboza'
            const apiAudio = `https://getmod-mediahub.vercel.app/api/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=${apiKeyAudio}`
            const res = await fetch(apiAudio)
            const json = await res.json()
            if (!json.status || !json.dl) throw '🛑 Error en la API de Audio.'
            downloadUrl = json.dl
        } else {
            // --- API PARA VIDEO (Sylphy) ---
            const apiKeyVideo = 'sylphy-6f150d'
            const apiVideo = `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&q=&api_key=${apiKeyVideo}`
            const res = await fetch(apiVideo)
            const json = await res.json()
            if (!json.status || !json.result || !json.result.dl_url) throw '🛑 Error en la API de Sylphy (Video).'
            downloadUrl = json.result.dl_url
        }

        // 4. Enviar respuesta visual informativa
        const info = `🎬 *YOUTUBE DOWNLOADER*\n\n⭐ *Título:* ${title}\n⏱️ *Duración:* ${timestamp}\n📌 *Tipo:* ${isAudio ? 'Audio (MP3)' : 'Video (MP4)'}\n🔗 *Link:* ${url}`
        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

        // 5. Enviar el archivo final
        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                fileName: `${title}.mp4`, 
                caption: `✅ *Video descargado:* ${title}`,
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

handler.command = /^(play|yta|ytmp3|play5|ytv|ytmp4|playaudio|mp4)$/i
handler.group = false

export default handler
