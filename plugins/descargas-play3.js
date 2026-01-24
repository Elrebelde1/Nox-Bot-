import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `⚠️ Ingrese el nombre o link de YouTube.`, m)
        await m.react('⏳')

        // Extraer ID de video o usar el texto como búsqueda
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)

        if (!search.all || search.all.length === 0) {
            await m.react('❌')
            throw '❌ No se encontraron resultados.'
        }

        // Obtener el resultado más relevante
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
        const { title, thumbnail, timestamp, url, author } = result

        // 1. Enviar mensaje de información con la miniatura
        let info = `🔷 *YOUTUBE DOWNLOADER* 🔷\n\n`
        info += `⭐ *Título:* ${title}\n`
        info += `👤 *Autor:* ${author.name}\n`
        info += `⏱️ *Duración:* ${timestamp}\n`
        info += `🔗 *Link:* ${url}`

        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

        // 2. Configuración de la nueva API (Sylphy)
        // Nota: Asegúrate de que el api_key sea correcto
        const apiUrl = `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&q=&api_key=sylphy-6f150d`

        const res = await fetch(apiUrl)
        const json = await res.json()

        // Verificación de la respuesta de la API (según el JSON que pasaste)
        if (!json.status || !json.result || !json.result.dl_url) {
            throw '🛑 La API no devolvió un enlace de descarga válido o está caída.'
        }

        const downloadLink = json.result.dl_url // Cambiado a dl_url según tu JSON
        const quality = json.result.quality || '360p'
        const size = json.result.size || 'Desconocido'

        // 3. ENVIAR EL VIDEO COMO DOCUMENTO
        const fileName = `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`

        await conn.sendMessage(m.chat, { 
            document: { url: downloadLink }, 
            fileName: fileName, 
            mimetype: 'video/mp4',
            caption: `✅ *Vídeo descargado correctamente*\n\n🎬 *Calidad:* ${quality}\n⚖️ *Tamaño:* ${size}`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ Error: ${e.message || e}`, m)
    }
}

handler.command = /^(play|play2|play3|ytv|ytmp4|mp4)$/i
handler.group = false
handler.register = false

export default handler
