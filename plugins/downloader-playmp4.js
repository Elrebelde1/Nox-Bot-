import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* ¿Qué buscas en YouTube?\n\n*Ejemplo:* ${usedPrefix}${command} Lupita`, m)

    const isVideo = command === 'play2'
    await m.react(isVideo ? '🎥' : '🎧')

    try {
        const searchApi = `https://api.delirius.store/search/ytsearch?text=${encodeURIComponent(text)}`
        const { data: searchData } = await axios.get(searchApi)

        if (!searchData.status || !searchData.data || searchData.data.length === 0) throw new Error()

        const videoUrl = searchData.data[0].url
        const { title, image, author, views } = searchData.data[0]

        // Aquí están las APIs de descarga integradas:
        const endpoint = isVideo ? 'ytmp4' : 'ytmp3'
        const downloadApi = `https://api.delirius.store/download/${endpoint}?url=${encodeURIComponent(videoUrl)}${isVideo ? '&format=360p' : ''}`
        
        const { data: res } = await axios.get(downloadApi)
        if (!res.status || !res.data) throw new Error()

        const downloadUrl = res.data.download

        let caption = `*〔 YOUTUBE PLAY 〕*\n\n`
        caption += `📌 *Título:* ${title}\n`
        caption += `👤 *Canal:* ${author}\n`
        caption += `👀 *Vistas:* ${views}\n`
        caption += `📦 *Tipo:* ${isVideo ? 'Video' : 'Audio'}\n\n`
        caption += `*By: Barboza Developer*`

        if (isVideo) {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { image: { url: image }, caption: caption }, { quoted: m })
            
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ Error al obtener el archivo de la API.`, m)
    }
}

handler.help = ['play', 'play2']
handler.tags = ['downloader']
handler.command = ['play3', 'play4']

export default handler
