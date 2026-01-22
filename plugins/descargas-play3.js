import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `⚠️ Ingrese el nombre o link de YouTube.`, m)
        await m.react('⏳')

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)

        if (!search.all || search.all.length === 0) {
            await m.react('❌')
            throw '❌ No se encontraron resultados.'
        }

        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        const { title, thumbnail, timestamp, views, url, author } = result

        // Enviar la info previa con la miniatura
        let info = `🔷 *YOUTUBE DOWNLOADER* 🔷\n\n`
        info += `⭐ *Título:* ${title}\n`
        info += `👤 *Autor:* ${author.name}\n`
        info += `⏱️ *Duración:* ${timestamp}\n`
        info += `🔗 *Link:* ${url}`

        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

        // Configuración de la nueva API
        const apiUrl = `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&q=&api_key=sylphy-6f150d`
        
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.status || !json.result || !json.result.url) {
            throw '🛑 La API no devolvió un enlace de descarga válido.'
        }

        const downloadLink = json.result.url
        // Limpiar el nombre del archivo de caracteres extraños para evitar errores en el sistema de archivos
        const fileName = `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`

        // ENVIAR COMO ARCHIVO (DOCUMENTO)
        await conn.sendMessage(m.chat, { 
            document: { url: downloadLink }, 
            fileName: fileName, 
            mimetype: 'video/mp4',
            caption: `✅ *Vídeo enviado como archivo:* ${title}`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ Error: ${e.message || e}`, m)
    }
}

// Comandos activadores
handler.command = /^(play|play2|play3|ytv|ytmp4|mp4)$/i
handler.group = false
handler.register = false

export default handler
