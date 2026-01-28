import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre o link de YouTube.`, m)
        
        await m.react('🕒')

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? `https://youtu.be/${videoMatch[1]}` : text
        
        const search = await yts(query)
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]

        if (!result) throw 'ꕥ No se encontraron resultados.'

        const { title, thumbnail, timestamp, views, url, author } = result
        const info = `「✦」Descargando *<${title}>*\n\n> ❑ Canal » *${author.name}*\n> ♡ Vistas » *${views.toLocaleString()}*\n> ✧︎ Duración » *${timestamp}*\n> ➪ Link » ${url}`

        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

        const res = await fetch(`https://api-adonix.ultraplus.click/download/ytvideo?apikey=AdonixKeyvr85v01953&url=${encodeURIComponent(url)}`)
        const json = await res.json()

        if (!json.status || !json.data?.url) throw '⚠ No se pudo obtener el archivo del servidor.'

        await conn.sendFile(m.chat, json.data.url, `${title}.mp4`, `> ❀ ${title}`, m)
        await m.react('✔️')

    } catch (e) {
        await m.react('✖️')
        return conn.reply(m.chat, `⚠︎ Error: ${e}`, m)
    }
}

handler.command = ['play2', 'mp4']
handler.help = ['play2 <texto>', 'mp4 <texto>']
handler.tags = ['media']
handler.group = false

export default handler