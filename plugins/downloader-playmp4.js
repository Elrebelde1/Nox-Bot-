import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* ¿Qué deseas descargar?\n\n*Uso:* ${usedPrefix}${command} [Nombre o Link]`, m)

    const isVideo = command === 'play4'
    const isAudio = command === 'play3'
    
    await m.react(isVideo ? '🎥' : '🎧')

    try {
        let videoUrl = text
        let title, image, author, views, likes

        // 1. LÓGICA DE BÚSQUEDA / LINK
        if (!text.match(/youtu/gi)) {
            // Si NO es un link, buscamos en la API
            const searchApi = `https://api.delirius.store/search/ytsearch?text=${encodeURIComponent(text)}`
            const { data: searchData } = await axios.get(searchApi)
            
            if (!searchData.status || !searchData.data.length) {
                await m.react('❌')
                return m.reply('❌ No se encontró nada con ese nombre.')
            }
            videoUrl = searchData.data[0].url
        }

        // 2. OBTENER DATOS DE DESCARGA
        const endpoint = isVideo ? 'ytmp4' : 'ytmp3'
        const downloadApi = `https://api.delirius.store/download/${endpoint}?url=${encodeURIComponent(videoUrl)}${isVideo ? '&format=360p' : ''}`
        
        const { data: res } = await axios.get(downloadApi)
        if (!res.status) throw new Error()

        const data = res.data
        
        // 3. MENSAJE DE ESPERA CON INFO
        let caption = `*〔 DOWNLOADER 〕*\n\n`
        caption += `📌 *Título:* ${data.title}\n`
        caption += `👤 *Autor:* ${data.author}\n`
        caption += `👀 *Vistas:* ${data.views}\n`
        caption += `📦 *Tipo:* ${isVideo ? 'Video' : 'Audio'}\n\n`
        caption += `*By: Barboza Developer*`

        // Enviamos miniatura e info
        await conn.sendMessage(m.chat, { image: { url: data.image }, caption: caption }, { quoted: m })

        // 4. ENVÍO DE ARCHIVO SEGÚN EL COMANDO
        if (isVideo) {
            // Enviar solo video si es play4
            await conn.sendMessage(m.chat, { 
                video: { url: data.download }, 
                mimetype: 'video/mp4',
                fileName: `${data.title}.mp4`
            }, { quoted: m })
        } else {
            // Enviar solo audio si es play3
            await conn.sendMessage(m.chat, { 
                audio: { url: data.download }, 
                mimetype: 'audio/mpeg',
                fileName: `${data.title}.mp3`
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ Hubo un error al procesar la descarga.`, m)
    }
}

handler.help = ['play3', 'play4']
handler.tags = ['downloader']
handler.command = ['play3', 'play4'] 

export default handler
