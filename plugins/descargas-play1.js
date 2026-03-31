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

        if (!search || !search.all || search.all.length === 0) {
            await m.react('❌')
            throw '❌ No se encontraron resultados.'
        }

        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        const { title, thumbnail, timestamp, url } = result

        // 2. Determinar si es audio o video
        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        let downloadUrl = null

        if (isAudio) {
            // --- INTENTO 1: API DELIRIUS (AUDIO) ---
            try {
                const resDelirius = await fetch(`https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(url)}`)
                const jsonDelirius = await resDelirius.json()
                if (jsonDelirius.status && jsonDelirius.data?.download) {
                    downloadUrl = jsonDelirius.data.download
                }
            } catch (e) { console.log("Error Delirius Audio: ", e.message) }

            // --- INTENTO 2: API MEDIAHUB (FALLBACK) ---
            if (!downloadUrl) {
                const apiAudio = `https://getmod-mediahub.vercel.app/api/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=barboza`
                const res = await fetch(apiAudio)
                const json = await res.json()
                if (json.status && json.dl) downloadUrl = json.dl
            }
        } else {
            // --- INTENTO 1: API DELIRIUS (VIDEO) ---
            try {
                const resDelirius = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(url)}&format=360`)
                const jsonDelirius = await resDelirius.json()
                if (jsonDelirius.status && jsonDelirius.data?.download) {
                    downloadUrl = jsonDelirius.data.download
                }
            } catch (e) { console.log("Error Delirius Video: ", e.message) }

            // --- INTENTO 2: API SYLPHY (FALLBACK) ---
            if (!downloadUrl) {
                const apiVideo = `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&q=&api_key=sylphy-6f150d`
                const res = await fetch(apiVideo)
                const json = await res.json()
                if (json.status && json.result?.dl_url) downloadUrl = json.result.dl_url
            }
        }

        if (!downloadUrl) throw '🛑 No fue posible obtener el enlace de descarga de ninguna API.'

        // 3. Enviar respuesta visual informativa
        const info = `🎬 *YOUTUBE DOWNLOADER*\n\n⭐ *Título:* ${title}\n⏱️ *Duración:* ${timestamp}\n📌 *Tipo:* ${isAudio ? 'Audio (MP3)' : 'Video (MP4)'}\n🔗 *Link:* ${url}`
        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        // 4. Enviar el archivo final
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
