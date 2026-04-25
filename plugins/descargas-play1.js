import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text.trim()) return conn.reply(m.chat, `✨ *Por favor, ingresa el nombre o link de YouTube.*`, m)
        await m.react('🌸')

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
        const search = await yts(query)
        const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]

        if (!result) throw '🌈 No se encontraron resultados.'

        const { title, thumbnail, timestamp, views, url, author } = result
        
        // DISEÑO COLORIDO Y NUEVO TEXTO
        const info = `
🌸 *𝙻𝚎𝚘𝚗𝚎𝚕 𝚢 𝚂𝚞𝚖𝚒 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚛* 🌸
─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───

🌈 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}
📺 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}
⏳ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}
👁️ *𝚅𝙸𝚂𝚃𝙰𝚂:* ${views.toLocaleString()}
🔗 *𝙻𝙸𝙽𝙺:* ${url}

─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───
> ✨ *¡𝐏𝐫𝐨𝐜𝐞𝐬𝐚𝐧𝐝𝐨 𝐭𝐮 𝐚𝐫𝐜𝐡𝐢𝐯𝐨, 𝐞𝐬𝐩𝐞𝐫𝐚!*`.trim()

        const thumb = (await conn.getFile(thumbnail)).data
        await conn.sendMessage(m.chat, { 
            image: thumb, 
            caption: info,
            footer: "🌸 𝙻𝚎𝚘𝚗𝚎𝚕 𝚢 𝚂𝚞𝚖𝚒 🌸" 
        }, { quoted: m })

        const isAudio = /play|yta|ytmp3|playaudio/i.test(command)

        if (isAudio) {
            // API DELIRIUS MP3 V2 (success)
            const res = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(url)}`)
            const json = await res.json()

            if (!json.success || !json.data?.download) throw '⚠️ No se pudo obtener el audio de Delirius.'

            await conn.sendMessage(m.chat, { 
                audio: { url: json.data.download }, 
                fileName: `${title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m })

        } else {
            // API DELIRIUS MP4 (status)
            const res = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(url)}`)
            const json = await res.json()

            if (!json.status || !json.data?.download) throw '⚠️ No se pudo obtener el video de Delirius.'

            await conn.sendFile(m.chat, json.data.download, `${title}.mp4`, `🌸 *Aquí tienes tu video*\n> ✨ ${title}`, m)
        }

        await m.react('💖')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        return conn.reply(m.chat, `❌ *Error:* ${e}`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|ytmp4|playaudio|mp4)$/i
handler.group = false

export default handler
