import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validamos que el usuario envíe un link
    if (!text) return conn.reply(m.chat, `*¡Oye!* Necesito un link de YouTube para descargar.\n\n*Ejemplo:* ${usedPrefix}${command} https://www.youtube.com/watch?v=5M_n2UCe7DQ`, m)

    // Reacción de procesando
    await m.react('⏳')

    try {
        const urlYouTube = encodeURIComponent(text)
        
        // 1. LLAMADA A MP3
        const mp3Api = `https://api.delirius.store/download/ytmp3?url=${urlYouTube}`
        const { data: resMp3 } = await axios.get(mp3Api)

        // 2. LLAMADA A MP4 (360p)
        const mp4Api = `https://api.delirius.store/download/ytmp4?url=${urlYouTube}&format=360p`
        const { data: resMp4 } = await axios.get(mp4Api)

        // Validamos que ambas APIs respondieron con status: true
        if (!resMp3.status || !resMp4.status) {
            throw new Error("La API no devolvió una respuesta válida.")
        }

        // Extraemos la info del JSON de cualquiera de las dos (son iguales en metadata)
        const info = resMp3.data
        
        let caption = `*〔 DOWNLOAD COMPLETED 〕*\n\n`
        caption += `📌 *Título:* ${info.title}\n`
        caption += `👤 *Autor:* ${info.author}\n`
        caption += `👀 *Vistas:* ${info.views}\n`
        caption += `👍 *Likes:* ${info.likes}\n\n`
        caption += `*By: Barboza Developer*`

        // Enviamos la miniatura con la info
        await conn.sendMessage(m.chat, { image: { url: info.image }, caption: caption }, { quoted: m })

        // Enviamos el Audio (MP3)
        await conn.sendMessage(m.chat, { 
            audio: { url: resMp3.data.download }, 
            mimetype: 'audio/mpeg',
            fileName: `${info.title}.mp3`
        }, { quoted: m })

        // Enviamos el Video (MP4)
        await conn.sendMessage(m.chat, { 
            video: { url: resMp4.data.download }, 
            mimetype: 'video/mp4',
            fileName: `${info.title}.mp4`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ *Error:* No se pudo procesar el link. Asegúrate de que sea una URL válida de YouTube.`, m)
    }
}

handler.help = ['play3', 'play4']
handler.tags = ['downloader']
handler.command = ['play3', 'play4']

export default handler
