import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text.trim()) return conn.reply(m.chat, `⚠️ Ingrese el nombre o link de YouTube.`, m)

    try {
        if (m.react) await m.react('⏳')

        // 1. Búsqueda del video
        const search = await yts(text)
        if (!search || !search.all || search.all.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron resultados.', m)
        }

        const video = search.all[0]
        const { title, thumbnail, timestamp, url, views, author } = video

        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        let downloadUrl = null
        let selectedMethod = ""

        // --- MÉTODO 1: API YanzBotz (Muy estable actualmente) ---
        try {
            const apiType = isAudio ? 'youtube-audio' : 'youtube-video'
            const res = await fetch(`https://api.yanzbotz.my.id/api/downloader/${apiType}?url=${encodeURIComponent(url)}`)
            const json = await res.json()
            
            if (json.status === 200 && json.result.url) {
                downloadUrl = json.result.url
                selectedMethod = "YanzServer"
            }
        } catch (e) {
            console.log("Error en Método 1")
        }

        // --- MÉTODO 2: API AYLUN (Fallback / Respaldo) ---
        if (!downloadUrl) {
            try {
                const res = await fetch(`https://api.alyurobot.my.id/api/dl/yt?url=${encodeURIComponent(url)}&type=${isAudio ? 'mp3' : 'mp4'}`)
                const json = await res.json()
                if (json.status) {
                    downloadUrl = isAudio ? json.result.download.url : json.result.download.url
                    selectedMethod = "AlyuServer"
                }
            } catch (e) {
                console.log("Error en Método 2")
            }
        }

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 Todas las APIs fallaron. Intente de nuevo más tarde.', m)
        }

        // Enviar miniatura e información
        const info = `🎬 *YOUTUBE PLAY*\n\n📌 *Título:* ${title}\n⏱️ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views}\n👤 *Canal:* ${author.name}\n🔗 *Link:* ${url}\n\n📡 *Servidor:* ${selectedMethod}`
        
        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info 
        }, { quoted: m })

        // Enviar el archivo
        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg', 
                ptt: false,
                fileName: `${title}.mp3`
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                mimetype: 'video/mp4', 
                fileName: `${title}.mp4`,
                caption: `✅ *Aquí tienes tu video*`,
                asDocument: false // Cambiar a true si el video es muy pesado
            }, { quoted: m })
        }

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, `⚠️ Ocurrió un error inesperado.`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|ytmp4|playaudio|mp4)$/i
export default handler
