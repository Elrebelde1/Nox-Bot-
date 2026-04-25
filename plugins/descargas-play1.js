import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ ¡Te faltó el link!\n\nEjemplo:\n*${usedPrefix + command}* https://www.youtube.com/watch?v=pyf8cbqyfPs`

    try {
        // Determinamos si quiere audio o video según el comando
        const isVideo = command === 'playvid' || command === 'ytmp4' || text.includes('--mp4')
        const apiUrl = isVideo 
            ? `https://api.delirius.store/download/ytmp4?url=${text}`
            : `https://api.delirius.store/download/ytmp3v2?url=${text}`

        await m.reply('_⏳ Procesando, espera un momento..._')

        const response = await axios.get(apiUrl)
        const res = response.data

        if (!res.status && !res.success) throw '❌ Error al obtener los datos de la API.'

        const { title, author, views, likes, image, download, format } = res.data

        let caption = `
✨ *YOUTUBE DOWNLOADER* ✨

🎵 *Título:* ${title}
👤 *Canal:* ${author}
👀 *Vistas:* ${views || 'No disponible'}
👍 *Likes:* ${likes || 'No disponible'}
⚙️ *Calidad/Formato:* ${format || (isVideo ? 'mp4' : 'mp3')}

> *Enviando archivo...*`.trim()

        // Enviamos la miniatura con la info
        await conn.sendMessage(m.chat, { image: { url: image }, caption: caption }, { quoted: m })

        // Enviamos el archivo final
        if (isVideo) {
            await conn.sendMessage(m.chat, { 
                video: { url: download }, 
                fileName: `${title}.mp4`, 
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                audio: { url: download }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply(`❌ *Error:* No se pudo descargar el contenido. Intenta con otro enlace.`)
    }
}

handler.help = ['play', 'playvid']
handler.tags = ['downloader']
handler.command = /^(play|playvid|ytmp3|ytmp4)$/i

export default handler
