import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `_*[ ⚠️ ] Ingresa el nombre de la canción*_\n\n_Ejemplo:_\n${usedPrefix + command} Lupita`

    try { 
        const searchRes = await axios.get(`https://sylphy.xyz/search/spotify?q=${encodeURIComponent(text)}&api_key=sylphy-6f150d`)
        const searchData = searchRes.data

        if (!searchData.status || !searchData.result || searchData.result.length === 0) {
            throw `_*[ ⚠️ ] No se encontraron resultados para: "${text}"*_`
        }

        const trackUrl = searchData.result[0].url

        const downloadRes = await fetch(`https://sylphy.xyz/download/spotify?url=${encodeURIComponent(trackUrl)}&api_key=sylphy-6f150d`)
        const dlData = await downloadRes.json()

        if (!dlData.status) {
            throw `_*[ ❌ ] Error al procesar la descarga de la API.*_`
        }

        const res = dlData.result
        const img = res.album.images[0].url
        const artistas = res.artists.map(a => a.name).join(', ')

        const info = `
⧁ 𝙏𝙄𝙏𝙐𝙇𝙊
» ${res.name}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼
» ${artistas}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁ 𝘼𝙇𝘽𝙐𝙈
» ${res.album.name || 'N/A'}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁ 𝙀𝙉𝙇𝘼𝘾𝙀
» ${trackUrl}

_*🎶 Enviando audio...*_`.trim()

        await conn.sendFile(m.chat, img, 'thumbnail.jpg', info, m)

        await conn.sendMessage(m.chat, { 
            audio: { url: res.download_url }, 
            fileName: `${res.name}.mp3`, 
            mimetype: 'audio/mpeg' 
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        await conn.reply(m.chat, `❌ _*Ocurrió un error con la API de Sylphy. Revisa la consola.*_`, m)
    }
}

handler.tags = ['descargas']
handler.command = ['spoti', 'spotify', 'play2']

export default handler