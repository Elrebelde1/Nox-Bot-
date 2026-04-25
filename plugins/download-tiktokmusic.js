/* Comando: .tiktokmusic
   Descripción: Descarga y envía el audio/video de música de TikTok
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*¿Qué música buscas?*\n\nEjemplo: _${usedPrefix + command} Gata Only_`
    
    try {
        await m.reply('*🎵 Buscando y procesando la música, espera un momento...*')

        // Buscando el video mediante un servicio de scraping
        let res = await fetch(`https://api.lolhuman.xyz/api/tiktoksearch?apikey=GataDios&query=${encodeURIComponent(text)}`)
        let json = await res.json()
        
        if (!json.status) throw 'No se encontró ningún resultado para tu búsqueda.'
        
        // Tomamos el primer resultado de la búsqueda
        let videoData = json.result[0]
        let { title, author, play } = videoData

        let txt = `*🎵 TIKTOK MUSIC 🎵*\n\n`
        txt += `*📌 Título:* ${title}\n`
        txt += `*👤 Autor:* ${author.nickname}\n`
        txt += `*🚀 Enviando video...*`

        // Enviamos el video directamente
        await conn.sendFile(m.chat, play, 'error.mp4', txt, m)

    } catch (e) {
        console.log(e)
        m.reply('*❌ Ocurrió un error al intentar obtener la música. Inténtalo de nuevo más tarde.*')
    }
}

handler.help = ['tiktokmusic']
handler.tags = ['downloader']
handler.command = /^(tiktokmusic|ttmusic)$/i

export default handler
