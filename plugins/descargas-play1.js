import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ Ingresa un link de YouTube para descargar.`

    try {
        // Determinamos si el comando pide video o audio
        let isVideo = /vid|mp4|v$/i.test(command)
        let apiEndpoint = isVideo 
            ? `https://api.delirius.store/download/ytmp4?url=${text}`
            : `https://api.delirius.store/download/ytmp3v2?url=${text}`

        await m.reply('_⏳ Procesando, por favor espera..._')

        const { data: res } = await axios.get(apiEndpoint)

        // Validación según la respuesta de cada endpoint
        if (isVideo && !res.status) throw 'Error en la API de Video'
        if (!isVideo && !res.success) throw 'Error en la API de Audio'

        const data = res.data
        const title = data.title || 'Sin título'
        const author = data.author || 'Desconocido'
        const fileSize = isVideo ? data.format : 'MP3' // En video el JSON trae "360p" en format
        const dl_url = data.download

        let txt = `
✨ *YOUTUBE DOWNLOADER* ✨

📌 *Título:* ${title}
👤 *Canal:* ${author}
👀 *Vistas:* ${data.views}
👍 *Likes:* ${data.likes}
💾 *Calidad:* ${fileSize}

> *Enviando contenido...*`.trim()

        // Enviamos miniatura informativa
        await conn.sendMessage(m.chat, { image: { url: data.image }, caption: txt }, { quoted: m })

        if (isVideo) {
            // Enviar Video
            await conn.sendMessage(m.chat, { 
                video: { url: dl_url }, 
                fileName: `${title}.mp4`, 
                mimetype: 'video/mp4',
                caption: `🎬 ${title}`
            }, { quoted: m })
        } else {
            // Enviar Audio
            await conn.sendMessage(m.chat, { 
                audio: { url: dl_url }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg'
            }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply(`❌ *Error:* Verifique que el enlace sea de YouTube o intente más tarde.\n\n${e.message || e}`)
    }
}

handler.help = ['play', 'playvid', 'ytmp3', 'ytmp4']
handler.tags = ['downloader']
handler.command = /^(play|playvid|ytmp3|ytmp4)$/i

export default handler
