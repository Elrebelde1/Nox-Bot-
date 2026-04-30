import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* ¿Qué deseas buscar?\n\n*Ejemplo:* ${usedPrefix}${command} Yan Block 444`, m)

    await m.react('⏳')

    try {
        // 1. BUSQUEDA: Usamos el endpoint de búsqueda primero
        const searchApi = `https://api.delirius.store/search/ytsearch?text=${encodeURIComponent(text)}`
        const { data: searchData } = await axios.get(searchApi)

        if (!searchData.status || !searchData.data || searchData.data.length === 0) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ No se encontraron resultados para: ${text}`, m)
        }

        const videoUrl = searchData.data[0].url
        const { title, image, author, views, timestamp } = searchData.data[0]

        // 2. DESCARGA MP3: Obtenemos el audio
        const mp3Api = `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
        const { data: resMp3 } = await axios.get(mp3Api)

        // 3. DESCARGA MP4: Obtenemos el video (360p por defecto)
        const mp4Api = `https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(videoUrl)}&format=360p`
        const { data: resMp4 } = await axios.get(mp4Api)

        if (!resMp3.status || !resMp4.status) throw new Error("Error en las APIs de descarga")

        let caption = `*〔 YOUTUBE DOWNLOADER 〕*\n\n`
        caption += `📌 *Título:* ${title}\n`
        caption += `👤 *Canal:* ${author}\n`
        caption += `👀 *Vistas:* ${views}\n`
        caption += `⏱️ *Duración:* ${timestamp}\n\n`
        caption += `_Se enviará Audio y Video..._`

        // Enviamos la imagen con la info
        await conn.sendMessage(m.chat, { image: { url: image }, caption: caption }, { quoted: m })

        // Enviamos el Audio (MP3)
        await conn.sendMessage(m.chat, { 
            audio: { url: resMp3.data.download }, 
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m })

        // Enviamos el Video (MP4)
        await conn.sendMessage(m.chat, { 
            video: { url: resMp4.data.download }, 
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ Hubo un fallo al obtener los archivos.`, m)
    }
}

handler.help = ['play3', 'play4']
handler.tags = ['downloader']
handler.command = ['play3', 'play4']

export default handler
