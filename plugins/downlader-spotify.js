import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validación de entrada (con tu estilo)
    if (!text) return m.reply(`> ✎ USO: ${usedPrefix + command} <nombre de la canción o URL>`)

    await m.react('🕓')

    try {
        // 2. Lógica de URL o Búsqueda (Copiada de tu amigo)
        const isUrl = text.match(/^(https?:\/\/)?(www\.)?(open\.spotify\.com|spotify\.link)\/.+$/gi)
        let track

        if (isUrl) {
            track = { url: text, title: 'Spotify Track' }
        } else {
            const searchRes = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
            const searchData = await searchRes.json()

            if (!searchData.status || !searchData.data.length) {
                await m.react('✖️')
                return m.reply('> ⚔ ERROR: No se encontraron resultados.')
            }

            track = searchData.data[0]

            // Mensaje de info (Caption)
            let txt = `\t\t\t\t*SPOTIFY DOWNLOAD*\n\n`
            txt += `> ▢ *TÍTULO:* ${track.title}\n`
            txt += `> ▢ *ARTISTA:* ${track.artist}\n`
            txt += `> ▢ *ÁLBUM:* ${track.album}\n`
            txt += `> ▢ *DURACIÓN:* ${track.duration}\n`
            txt += `> ▢ *PUBLICADO:* ${track.publish}\n\n`
            txt += `> _Procesando audio, espere un momento..._`

            await conn.sendMessage(m.chat, { 
                image: { url: track.image }, 
                caption: txt 
            }, { quoted: m })
        }

        // 3. Lógica de Descarga (API Delirius directa)
        const downloadRes = await fetch(`https://api.delirius.store/download/spotifydl?url=${track.url}`)
        const downloadData = await downloadRes.json()

        if (downloadData.status && downloadData.data.download) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadData.data.download }, 
                mimetype: 'audio/mpeg', 
                fileName: `${track.title}.mp3` 
            }, { quoted: m })
            await m.react('✅')
        } else {
            await m.react('✖️')
            m.reply('> ⚔ ERROR: No se pudo obtener el archivo de audio.')
        }

    } catch (e) {
        await m.react('✖️')
        console.error(e)
        m.reply(`> ⚔ ERROR CRÍTICO: ${e.message}`)
    }
}

// Configuración de Handler
handler.help = ['spotify']
handler.tags = ['download']
handler.command = ['spotify', 'spt', 'sp', 'music']

export default handler
