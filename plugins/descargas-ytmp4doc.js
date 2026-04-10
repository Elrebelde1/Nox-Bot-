import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, command }) => {
    if (!text.trim()) return conn.reply(m.chat, `⚠️ ɪɴɢʀᴇsᴇ ᴇʟ ᴇɴʟᴀᴄᴇ ᴅᴇ ʏᴏᴜᴛᴜʙᴇ ᴘᴀʀᴀ ᴅᴇsᴄᴀʀɢᴀʀ ᴠɪᴅᴇᴏ.`, m)

    try {
        if (m.react) await m.react('⏳')

        // Validación de link y búsqueda
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const url = videoMatch ? 'https://www.youtube.com/watch?v=' + videoMatch[1] : text
        
        const search = await yts(url)
        const result = search.videos[0]
        if (!result) throw 'No se encontró el video.'

        // Llamada a la API de Delirius para ytmp4
        const res = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(url)}&format=360`)
        const json = await res.json()

        if (!json.status || !json.data) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 ᴇʀʀᴏʀ: ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴠɪᴅᴇᴏ ᴅᴇ ʟᴀ ᴀᴘɪ.', m)
        }

        const downloadUrl = json.data.download
        const { title, thumbnail, timestamp } = result

        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ᴠɪᴅᴇᴏ* ♆ 〕─╮\n`
        info += `│\n`
        info += `│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n`
        info += `│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n`
        info += `│ 📦 *ғᴏʀᴍᴀᴛᴏ:* 360p\n`
        info += `│ 📡 *sᴇʀᴠɪᴅᴏʀ:* ᴅᴇʟɪʀɪᴜs\n`
        info += `│\n`
        info += `│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n`
        info += `╰────────────────────────────╯`

        // Enviar imagen con info
        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        // Enviar el video
        await conn.sendMessage(m.chat, { 
            video: { url: downloadUrl }, 
            mimetype: 'video/mp4', 
            caption: `✅ *${title}*`,
            asDocument: false
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, `❌ Ocurrió un error inesperado.`, m)
    }
}

handler.command = /^(ytmp4|ytv|video)$/i
export default handler
