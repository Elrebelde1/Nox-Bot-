import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text }) => {
    if (!text.trim()) return conn.reply(m.chat, `⚠️ ɪɴɢʀᴇsᴇ ᴇʟ ᴇɴʟᴀᴄᴇ ᴅᴇ ʏᴏᴜᴛᴜʙᴇ.`, m)

    try {
        if (m.react) await m.react('⏳')

        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const videoUrl = videoMatch ? 'https://www.youtube.com/watch?v=' + videoMatch[1] : text
        
        const search = await yts(videoUrl)
        const result = search.videos[0]
        if (!result) throw 'No se encontró el video.'

        // Llamada a la API de Delirius
        const apiRes = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(videoUrl)}&format=360`)
        const json = await apiRes.json()

        if (!json.status || !json.data || !json.data.download) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 ᴇʀʀᴏʀ: ʟᴀ ᴀᴘɪ ɴᴏ ᴅᴇᴠᴏʟᴠɪᴏ́ ᴜɴ ᴇɴʟᴀᴄᴇ ᴠᴀ́ʟɪᴅᴏ.', m)
        }

        const downloadUrl = json.data.download
        const { title, thumbnail, timestamp } = result

        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ᴠɪᴅᴇᴏ* ♆ 〕─╮\n`
        info += `│\n`
        info += `│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n`
        info += `│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n`
        info += `│ 📡 *sᴇʀᴠɪᴅᴏʀ:* ᴅᴇʟɪʀɪᴜs\n`
        info += `│\n`
        info += `╰────────────────────────────╯`

        // Enviar miniatura con información
        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        // Enviar el video con parámetros de compatibilidad
        await conn.sendMessage(m.chat, { 
            video: { url: downloadUrl }, 
            fileName: `${title}.mp4`,
            mimetype: 'video/mp4', 
            caption: `✅ *ᴀϙᴜɪ́ ᴛɪᴇɴᴇs ᴛᴜ ᴠɪᴅᴇᴏ*`,
            headerType: 4
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(ytmp4)$/i
export default handler
