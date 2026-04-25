import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*¿Qué música buscas?*\n\nEjemplo: _${usedPrefix + command} Reggaeton Mix_`
    
    try {
        await m.reply('*🎵 Buscando el video más duro de TikTok... Dame un segundo.*')

        // Buscamos el video primero
        let search = await fetch(`https://api.fgmods.xyz/api/search/tiktok?text=${encodeURIComponent(text)}&apikey=fg-free`)
        let res = await search.json()
        
        if (res.status !== 200 || !res.result.length) {
            throw 'No encontré nada con ese nombre.'
        }

        // Agarramos el link del primer video encontrado
        let videoUrl = res.result[0].url
        
        // Ahora obtenemos el video directo sin marca de agua
        let download = await fetch(`https://api.fgmods.xyz/api/downloader/tiktok?url=${videoUrl}&apikey=fg-free`)
        let data = await download.json()

        if (data.status !== 200) throw 'Error al procesar la descarga.'

        let { title, author, nowm } = data.result

        let txt = `*✅ ¡LISTO! AQUÍ TIENES TU MÚSICA*\n\n`
        txt += `*📌 Título:* ${title || 'Sin título'}\n`
        txt += `*👤 Autor:* ${author.nickname || 'Desconocido'}\n`
        txt += `\n_Enviando archivo..._`

        // Enviamos el video
        await conn.sendFile(m.chat, nowm, 'tiktok.mp4', txt, m)

    } catch (e) {
        console.log(e)
        // Respuesta en caso de que el servidor esté caído de verdad
        m.reply('*⚠️ El servidor de descarga está saturado ahorita. Prueba con .play (nombre de la canción) si quieres solo el audio.*')
    }
}

handler.help = ['tiktokmusic']
handler.tags = ['downloader']
handler.command = /^(tiktokmusic|ttmusic)$/i

export default handler
