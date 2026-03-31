import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text.trim()) return conn.reply(m.chat, `⚠️ Ingrese el nombre o link de YouTube.`, m)

    try {
        if (m.react) await m.react('⏳')

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)

        if (!search || !search.all || search.all.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron resultados.', m)
        }

        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        const { title, thumbnail, timestamp, url } = result

        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        let downloadUrl = null
        let selectedApi = ""

        // Intento 1: Delirius
        try {
            const apiLink = isAudio ? `ytmp3?url=${encodeURIComponent(url)}` : `ytmp4?url=${encodeURIComponent(url)}`
            const res = await fetch(`https://api.delirius.store/download/${apiLink}`)
            const json = await res.json()
            if (json.status) {
                downloadUrl = isAudio ? json.data.download : json.data.download
                selectedApi = "Delirius"
            }
        } catch {}

        // Intento 2: Sylphy (Fallback)
        if (!downloadUrl) {
            try {
                const format = isAudio ? 'ytmp3' : 'ytmp4'
                const res = await fetch(`https://sylphy.xyz/download/${format}?url=${encodeURIComponent(url)}&api_key=sylphy-6f150d`)
                const json = await res.json()
                if (json.status) {
                    downloadUrl = json.result.dl_url
                    selectedApi = "Sylphy"
                }
            } catch {}
        }

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 Error: No se pudo obtener el enlace.', m)
        }

        const info = `🎬 *YOUTUBE*\n\n⭐ *${title}*\n⏱️ *${timestamp}*\n📡 *Servidor:* ${selectedApi}`
        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        if (isAudio) {
            // Configuración para que se escuche en Android y iPhone como nota de voz/audio reproducible
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mp4', 
                ptt: false, 
                fileName: `${title}.mp3` 
            }, { quoted: m })
        } else {
            // Configuración para que el video abra el reproductor nativo en ambos sistemas
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                mimetype: 'video/mp4', 
                caption: `✅ Reproducción lista`,
                asDocument: false
            }, { quoted: m })
        }

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|ytmp4|playaudio|mp4)$/i
export default handler