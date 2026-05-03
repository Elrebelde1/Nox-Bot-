import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Ingresa el nombre de la canción*\n\n> *Ejemplo:* ${usedPrefix + command} Provenza`, m)

    await m.react('⏳')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

        const searchRes = await axios.get(`https://api.evogb.org/search/spotify?query=${encodeURIComponent(query)}&key=${key}`)
        
        if (!searchRes.data.status || !searchRes.data.result.length) {
            await m.react('❌')
            return m.reply('⚠️ *No se encontraron resultados.*')
        }

        const track = searchRes.data.result[0]
        const trackUrl = `https://open.spotify.com/track/${track.id}`
        
        const dlRes = await axios.get(`https://api.evogb.org/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=${key}`)
        
        if (!dlRes.data.status) {
            await m.react('❌')
            return m.reply('⚠️ *Error al obtener el audio.*')
        }

        const data = dlRes.data.data
        let ui = `┏━━━━━━━━━━━━━━━━┓\n┃   🎵 *SPOTIFY DL* ┃\n┗━━━━━━━━━━━━━━━━┛\n\n`
        ui += `🎵 *TÍTULO:* ${data.name}\n`
        ui += `👤 *ARTISTA:* ${data.artist}\n`
        ui += `💿 *ALBUM:* ${data.album}\n`
        ui += `⏱️ *DURACIÓN:* ${data.duration}\n\n`
        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By: Barboza Developer*\n`
        ui += `🌐 *Zona Developers*`

        await conn.sendMessage(m.chat, { 
            image: { url: data.imageHD || data.image }, 
            caption: ui 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { 
            audio: { url: data.url }, 
            mimetype: 'audio/mpeg', 
            fileName: `${data.name}.mp3` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error en el proceso.*')
    }
}

handler.help = ['spotify2']
handler.tags = ['downloader']
handler.command = /^(spotify2|spotdl|spotifydl)$/i

export default handler
