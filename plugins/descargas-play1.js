import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text.trim()) return conn.reply(m.chat, `⚠️ ɪɴɢʀᴇsᴇ ᴇʟ ɴᴏᴍʙʀᴇ ᴏ ʟɪɴᴋ ᴅᴇ ʏᴏᴜᴛᴜʙᴇ.`, m)

    try {
        if (m.react) await m.react('⏳')

        // 🔍 Buscador para obtener detalles y Video ID
        const search = await yts(text)
        if (!search || !search.all || search.all.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs.', m)
        }

        const result = search.videos[0]
        const { title, thumbnail, timestamp, videoId } = result
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

        // 🛠️ Configuración de Sylphy V2
        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        const format = isAudio ? 'ytmp3' : 'ytmp4'
        const apiKey = 'sylphy-6f150d'
        
        let downloadUrl = null

        // ϟ Petición a Sylphy v2 (MP3 primero, luego MP4 según el comando)
        try {
            const apiUrl = `https://sylphyy.xyz/download/v2/${format}?url=${encodeURIComponent(videoUrl)}&api_key=${apiKey}`
            const res = await fetch(apiUrl)
            const json = await res.json()
            
            if (json.status && json.result && json.result.dl_url) {
                downloadUrl = json.result.dl_url
            }
        } catch (e) {
            console.error("Error en Sylphy v2:", e)
        }

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 ᴇʀʀᴏʀ: ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴇɴʟᴀᴄᴇ ᴅᴇ sʏʟᴘʜʏ ᴠ2.`, m)
        }

        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
        info += `│\n`
        info += `│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n`
        info += `│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n`
        info += `│ 📡 *sᴇʀᴠɪᴅᴏʀ:* sʏʟᴘʜʏ ᴠ2\n`
        info += `│\n`
        info += `│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n`
        info += `╰────────────────────────────╯`

        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        if (isAudio) {
            // Envío de Audio MP3
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mp4', 
                ptt: false, 
                fileName: `${title}.mp3` 
            }, { quoted: m })
        } else {
            // Envío de Video MP4
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                mimetype: 'video/mp4', 
                caption: `✅ *ʀᴇᴘʀᴏᴅᴜᴄᴄɪᴏ́ɴ ʟɪsᴛᴀ*`,
                asDocument: false
            }, { quoted: m })
        }

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|playaudio|mp4|ytmp4)$/i
export default handler
