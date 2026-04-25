/* Comando: .tiktokmusic
   Descripción: Busca y descarga el video/audio de TikTok basado en una búsqueda.
*/

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*¿Qué música o video buscas?*\n\nEjemplo: _${usedPrefix + command} Reguetón 2024_`
    
    try {
        // Notificación de inicio
        await m.reply('*🎵 Buscando en TikTok, un momento...*')

        // Usamos un buscador alternativo que suele ser más estable para búsquedas abiertas
        let searchRes = await fetch(`https://api.agatz.xyz/api/tiktoksearch?message=${encodeURIComponent(text)}`)
        let searchJson = await searchRes.json()
        
        if (searchJson.status !== 200) throw 'No se encontraron resultados.'
        
        // Seleccionamos el primer video de los resultados
        let video = searchJson.data[0]
        
        let caption = `*🎵 TIKTOK MUSIC 🎵*\n\n`
        caption += `*📌 Título:* ${video.title}\n`
        caption += `*👤 Autor:* ${video.author.nickname}\n`
        caption += `*🔗 Link:* https://www.tiktok.com/@${video.author.unique_id}/video/${video.video_id}\n\n`
        caption += `_🚀 Enviando el video solicitado..._`

        // Enviamos el video (usamos el enlace 'no_watermark' o 'nowm' si está disponible)
        // En este API la propiedad suele ser 'url' o 'play'
        let videoUrl = video.no_watermark || video.url || video.play

        await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', caption, m)

    } catch (e) {
        console.error(e)
        m.reply('*❌ Lo siento, no pude encontrar ese video o el servidor está saturado. Intenta con otro nombre.*')
    }
}

handler.help = ['tiktokmusic']
handler.tags = ['downloader']
handler.command = /^(tiktokmusic|ttmusic)$/i

export default handler
