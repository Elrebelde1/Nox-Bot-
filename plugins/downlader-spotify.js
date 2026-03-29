import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*⚠️ Ingresa el nombre de la canción*\n\n*Ejemplo:*\n${usedPrefix + command} Twice`, m)

    try { 
        await m.react('⏳')
        
        const searchRes = await axios.get(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
        const searchData = searchRes.data

        if (!searchData.status || !searchData.data || searchData.data.length === 0) {
            throw new Error()
        }

        const track = searchData.data[0]
        const trackUrl = track.url

        const downloadRes = await axios.get(`https://api.delirius.store/download/spotify?url=${encodeURIComponent(trackUrl)}`)
        const dlData = downloadRes.data

        if (!dlData.status || !dlData.data) {
            throw new Error()
        }

        const res = dlData.data
        const img = res.image

        const info = `
┏━━━━━━━⬣ **SPOTIFY** ⬣━━━━━━━┓
┃ 🎶 **Título:** ${res.title}
┃ 👤 **Artista:** ${res.author}
┃ ⏱️ **Duración:** ${track.duration || 'N/A'}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Creador: Barboza Ofc`.trim()

        await conn.sendMessage(m.chat, { image: { url: img }, caption: info }, { quoted: m })

        await conn.sendMessage(m.chat, { 
            audio: { url: res.download }, 
            fileName: `${res.title}.mp3`, 
            mimetype: 'audio/mpeg' 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('✖️')
        conn.reply(m.chat, `*❌ No se pudo encontrar o descargar la canción.*`, m)
    }
}

handler.help = ['spotify <nombre>']
handler.tags = ['descargas']
handler.command = /^(spotify|spoti|play2)$/i

export default handler
