import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🌙 INGRESE EL NOMBRE DE UNA CANCIÓN\n> *Ejemplo:* ${usedPrefix + command} Twice Strategy`)

    try {
        // 1. SEARCH - Delirius API
        let searchRes = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
        let searchJson = await searchRes.json()
        
        if (!searchJson.status || !searchJson.data.length) return m.reply("❌ Sin resultados.")

        let track = searchJson.data[0]
        let trackUrl = track.url

        // 2. DOWNLOAD - SpotifyDL (Buffer logic)
        let downloadRes = await fetch(`https://archive-ui.tanakadomp.biz.id/download/spotify?url=${trackUrl}`)
        let downloadJson = await downloadRes.json()

        if (!downloadJson.status) return m.reply("❌ Error en la descarga.")

        let force = downloadJson.result.data
        let audioBuffer = Buffer.from(downloadJson.result.buffer.data)

        let caption = `\`𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝚇 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰\`\n\n`
            + `☪︎ *Título:* ${force.title}\n`
            + `☪︎ *Artista:* ${force.artis || track.artist}\n`
            + `☪︎ *Duración:* ${force.durasi || track.duration}\n`
            + `───── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ─────`

        // 3. ENVIAR PORTADA Y AUDIO
        await conn.sendFile(m.chat, force.image || track.image, 'thumb.jpg', caption, m)

        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: "audio/mpeg", 
            fileName: `${force.title}.mp3` 
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply("⚠️ Servicio no disponible.")
    }
}

handler.help = ['play', 'spotify']
handler.tags = ['descargas']
handler.command = ['play', 'spotify', 'spdl']

export default handler
