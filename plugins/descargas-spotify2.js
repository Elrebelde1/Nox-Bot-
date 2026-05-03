import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Ingresa el nombre de la canción*\n\n> *Ejemplo:* ${usedPrefix + command} Provenza`, m)

    await m.react('🎧')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

        if (/spotify|spot$|spotify2/i.test(command)) {
            const { data } = await axios.get(`https://api.evogb.org/search/spotify?query=${encodeURIComponent(query)}&key=${key}`)
            
            if (!data.status || !data.result) {
                await m.react('❌')
                return m.reply('⚠️ *No se encontraron resultados.*')
            }

            let ui = `┏━━━━━━━━━━━━━━━━┓\n┃   🎵 *SPOTIFY SEARCH* ┃\n┗━━━━━━━━━━━━━━━━┛\n\n`
            data.result.slice(0, 5).forEach((track, i) => {
                ui += `*${i + 1}.* ${track.title}\n👤 *Artista:* ${track.artist}\n🆔 *ID:* ${track.id}\n\n`
            })
            ui += `━━━━━━━━━━━━━━━━━━━━\n⚡ *By: Barboza Developer*`

            await conn.sendMessage(m.chat, { image: { url: data.result[0].image }, caption: ui }, { quoted: m })
            await m.react('✅')

        } else if (/spotdl|spotifydl/i.test(command)) {
            const { data } = await axios.get(`https://api.evogb.org/dl/spotify?url=${encodeURIComponent(query)}&key=${key}`)
            
            if (!data.status) {
                await m.react('❌')
                return m.reply('⚠️ *Error al descargar la canción.*')
            }

            let ui = `┏━━━━━━━━━━━━━━━━┓\n┃   📥 *SPOTIFY DL* ┃\n┗━━━━━━━━━━━━━━━━┛\n\n`
            ui += `🎵 *TÍTULO:* ${data.data.name}\n`
            ui += `👤 *ARTISTA:* ${data.data.artist}\n`
            ui += `💿 *ALBUM:* ${data.data.album}\n`
            ui += `⏱️ *DURACIÓN:* ${data.data.duration}\n\n`
            ui += `━━━━━━━━━━━━━━━━━━━━\n`
            ui += `🔌 *API:* https://api.evogb.org\n`
            ui += `⚡ *By: Barboza Developer*\n`
            ui += `🌐 *Zona Developers*`

            await conn.sendMessage(m.chat, { 
                audio: { url: data.data.url }, 
                mimetype: 'audio/mpeg', 
                fileName: `${data.data.name}.mp3` 
            }, { quoted: m })
            
            await conn.sendMessage(m.chat, { image: { url: data.data.imageHD }, caption: ui }, { quoted: m })
            await m.react('✅')
        }

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error de conexión con Spotify.*')
    }
}

handler.help = ['spotify', 'spotify2', 'spotdl']
handler.tags = ['downloader']
handler.command = /^(spot|spotify2|spotdl|spotifydl)$/i

export default handler
