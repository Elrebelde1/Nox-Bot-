import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `✨ *¡Ups! Ingresa el nombre o link de YouTube.* \n\n> *Ejemplo:* ${usedPrefix + command} Pharrell Williams - Happy`, m)
        
        await m.react('🔍')

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]

        if (!result) throw '❌ No se encontraron resultados para tu búsqueda.'

        const { title, thumbnail, timestamp, views, url, author } = result
        
        // --- DISEÑO DE MENSAJE ---
        const info = `╔══🎬 *YOUTUBE DOWNLOADER* 🎬══╗\n` +
                     `║ \n` +
                     `║ 📌 *Título:* ${title}\n` +
                     `║ 👤 *Canal:* ${author.name}\n` +
                     `║ ⏳ *Duración:* ${timestamp}\n` +
                     `║ 👁️ *Vistas:* ${views.toLocaleString()}\n` +
                     `║ 🔗 *Link:* ${url}\n` +
                     `║ \n` +
                     `╚═════════════════════╝\n\n` +
                     `> 🚀 *Enviando archivo, por favor espera...*`

        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

        const isAudio = ['play', 'yta', 'ytmp3', 'playaudio'].includes(command)
        const endpoint = isAudio ? 'ytaudio' : 'ytvideo'

        const res = await fetch(`https://api-adonix.ultraplus.click/download/${endpoint}?apikey=AdonixKeyvr85v01953&url=${encodeURIComponent(url)}`)
        const json = await res.json()

        if (!json.status || !json.data?.url) throw '🤯 El servidor no respondió correctamente.'

        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: json.data.url }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })
        } else {
            await conn.sendFile(m.chat, json.data.url, `${title}.mp4`, `✅ *Aquí tienes tu video:* \n🎥 ${title}`, m)
        }

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ *OCURRIÓ UN ERROR* ⚠️\n\n> _Motivo: ${e}_`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play5|ytv|ytmp4|playaudio|mp4)$/i
handler.group = false

export default handler


600 robux Shi go go amorshito