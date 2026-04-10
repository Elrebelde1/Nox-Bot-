import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text }) => {
    if (!text.trim()) return conn.reply(m.chat, `⚠️ ɪɴɢʀᴇsᴇ ᴇʟ ᴇɴʟᴀᴄᴇ ᴅᴇ ʏᴏᴜᴛᴜʙᴇ.`, m)

    try {
        if (m.react) await m.react('⏳')

        // Buscador para obtener detalles del video
        const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
        const videoUrl = videoMatch ? 'https://www.youtube.com/watch?v=' + videoMatch[1] : text

        const search = await yts(videoUrl)
        const result = search.videos[0]
        if (!result) throw 'No se encontró el video.'

        // ϟ Configuración de la API Sylphy
        const apiKey = 'sylphy-6f150d'
        const apiUrl = `https://sylphyy.xyz/download/ytmp4?url=${encodeURIComponent(videoUrl)}&q=360p&api_key=${apiKey}`

        const apiRes = await fetch(apiUrl)
        const json = await apiRes.json()

        // Validación de la respuesta según tu JSON
        if (!json.status || !json.result || !json.result.dl_url) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 ᴇʀʀᴏʀ: ʟᴀ ᴀᴘɪ sʏʟᴘʜʏ ɴᴏ ᴅᴇᴠᴏʟᴠɪᴏ́ ᴜɴ ᴇɴʟᴀᴄᴇ ᴠᴀ́ʟɪᴅᴏ.', m)
        }

        const downloadUrl = json.result.dl_url
        const { title, thumbnail, timestamp } = result

        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
        info += `│\n`
        info += `│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n`
        info += `│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n`
        info += `│ 📡 *sᴇʀᴠɪᴅᴏʀ:* sʏʟᴘʜʏ\n`
        info += `│\n`
        info += `╰────────────────────────────╯`

        // Enviar miniatura con información
        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        // Enviar como VIDEO (reproducible)
        await conn.sendMessage(m.chat, { 
            video: { url: downloadUrl }, 
            mimetype: 'video/mp4',
            caption: `✅ *ʀᴇᴘʀᴏᴅᴜᴄᴄɪᴏ́ɴ ʟɪsᴛᴀ*`,
            fileName: `${title}.mp4`
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(ytmp4)$/i
export default handler