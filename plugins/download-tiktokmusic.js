import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*¿Qué quieres buscar?*\n\nEjemplo: _${usedPrefix + command} Reguetón 2024_`

    try {
        await m.reply('*📥 Extrayendo directamente de TikTok... espera.*')

        // 1. BUSQUEDA: Buscamos el video en TikTok vía DuckDuckGo/Google de forma interna
        let searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(text)}`
        
        // 2. SCRAPER: Usamos un servicio de descarga directa (TikWM o similares que no piden API Key)
        // Estos servicios funcionan como scrapers web.
        let response = await axios.post('https://www.tikwm.com/api/feed/search', new URLSearchParams({
            keywords: text,
            count: 1,
            cursor: 0
        }))

        let result = response.data.data.videos[0]

        if (!result) throw 'No se encontró nada.'

        let videoUrl = `https://www.tikwm.com${result.play}`
        let title = result.title
        let author = result.author.nickname

        let txt = `*🔥 TIKTOK DIRECT SCRAPER 🔥*\n\n`
        txt += `*📌 Título:* ${title}\n`
        txt += `*👤 Autor:* ${author}\n\n`
        txt += `_Cocinando tu video..._`

        // Enviamos el video sin marca de agua
        await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', txt, m)

    } catch (e) {
        console.error(e)
        // Si el scraper falla, intentamos una vía alternativa de emergencia
        try {
            let backup = await axios.get(`https://api.agatz.xyz/api/tiktoksearch?message=${encodeURIComponent(text)}`)
            let res = backup.data.data[0]
            await conn.sendFile(m.chat, res.no_watermark, 'video.mp4', `*✅ Backup:* ${res.title}`, m)
        } catch (err) {
            m.reply('*💀 Todos los métodos de extracción fallaron. TikTok cambió algo en su seguridad, intenta más tarde.*')
        }
    }
}

handler.help = ['tiktokmusic']
handler.tags = ['downloader']
handler.command = /^(tiktokmusic|ttmusic)$/i

export default handler
