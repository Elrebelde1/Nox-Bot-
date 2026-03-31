import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validación de entrada para evitar procesos vacíos
    if (!text.trim()) return conn.reply(m.chat, `⚠️ Ingrese el nombre o link de YouTube.`, m)
    
    try {
        await m.react('⏳')

        // 2. Búsqueda del video (Soporta links y texto)
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)

        if (!search || !search.all || search.all.length === 0) {
            await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron resultados.', m)
        }

        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        const { title, thumbnail, timestamp, url } = result

        // 3. Determinar tipo de archivo
        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        let downloadUrl = null
        let selectedApi = ""

        // --- LÓGICA DE APIS (SI UNA FALLA, BUSCA LA OTRA) ---
        if (isAudio) {
            // Intento 1: Delirius
            try {
                const res1 = await fetch(`https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(url)}`)
                const json1 = await res1.json()
                if (json1.status && json1.data?.download) {
                    downloadUrl = json1.data.download
                    selectedApi = "Delirius"
                }
            } catch { /* Salta al siguiente */ }

            // Intento 2: Mediahub (Fallback)
            if (!downloadUrl) {
                try {
                    const res2 = await fetch(`https://getmod-mediahub.vercel.app/api/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=barboza`)
                    const json2 = await res2.json()
                    if (json2.status && json2.dl) {
                        downloadUrl = json2.dl
                        selectedApi = "Mediahub"
                    }
                } catch { /* Error total */ }
            }
        } else {
            // Intento 1: Delirius Video
            try {
                const res1 = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(url)}&format=360`)
                const json1 = await res1.json()
                if (json1.status && json1.data?.download) {
                    downloadUrl = json1.data.download
                    selectedApi = "Delirius"
                }
            } catch { /* Salta al siguiente */ }

            // Intento 2: Sylphy (Fallback)
            if (!downloadUrl) {
                try {
                    const res2 = await fetch(`https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&q=360&api_key=sylphy-6f150d`)
                    const json2 = await res2.json()
                    if (json2.status && json2.result?.dl_url) {
                        downloadUrl = json2.result.dl_url
                        selectedApi = "Sylphy"
                    }
                } catch { /* Error total */ }
            }
        }

        if (!downloadUrl) {
            await m.react('❌')
            return conn.reply(m.chat, '🛑 Todas las APIs fallaron. Intente de nuevo más tarde.', m)
        }

        // 4. Envío de información (Captura y Miniatura)
        const info = `🎬 *YOUTUBE DOWNLOADER*\n\n⭐ *Título:* ${title}\n⏱️ *Duración:* ${timestamp}\n📌 *Tipo:* ${isAudio ? 'Audio (MP3)' : 'Video (MP4)'}\n📡 *Servidor:* ${selectedApi}`
        
        // Enviamos la imagen con la info primero
        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        // 5. Envío del Archivo Final
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
                mimetype: 'video/mp4'
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        // El return evita que si hay un error en el flujo, se intente enviar algo más
        return
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|ytmp4|playaudio|mp4)$/i
handler.group = false

export default handler
