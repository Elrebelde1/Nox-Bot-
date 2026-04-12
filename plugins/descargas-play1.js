import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text.trim()) return conn.reply(m.chat, `⚠️ ɪɴɢʀᴇsᴇ ᴇʟ ɴᴏᴍʙʀᴇ ᴏ ʟɪɴᴋ ᴅᴇ ʏᴏᴜᴛᴜʙᴇ.`, m)

    try {
        if (m.react) await m.react('⏳')

        // 🔍 Buscador de YouTube
        const search = await yts(text)
        if (!search || !search.all || search.all.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs.', m)
        }

        const result = search.videos[0]
        const { title, thumbnail, timestamp, videoId } = result
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        let downloadUrl = null
        let selectedServer = ""

        if (isAudio) {
            // 🎵 Intento 1: Delirius API v1
            try {
                const res = await fetch(`https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(videoUrl)}`)
                const json = await res.json()
                if (json.status && json.data?.download) {
                    downloadUrl = json.data.download
                    selectedServer = "Delirius V1"
                }
            } catch {
                console.log("Fallo Delirius v1, intentando v2...")
            }

            // 🎵 Intento 2: Delirius API v2 (Si el primero falló)
            if (!downloadUrl) {
                try {
                    const res = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(videoUrl)}`)
                    const json = await res.json()
                    if (json.success && json.data?.download) {
                        downloadUrl = json.data.download
                        selectedServer = "Delirius V2"
                    }
                } catch (e) {
                    console.error("Error en Delirius v2:", e)
                }
            }
        } else {
            // 📺 Petición a Sylphy v2 para Video
            try {
                const apiKey = 'sylphy-6f150d'
                const apiUrl = `https://sylphyy.xyz/download/v2/ytmp4?url=${encodeURIComponent(videoUrl)}&api_key=${apiKey}`
                const res = await fetch(apiUrl)
                const json = await res.json()
                if (json.status && json.result?.dl_url) {
                    downloadUrl = json.result.dl_url
                    selectedServer = "Sylphy V2"
                }
            } catch (e) {
                console.error("Error en Sylphy v2:", e)
            }
        }

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 ᴇʀʀᴏʀ: ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴇɴʟᴀᴄᴇ ᴅᴇ ᴅᴇsᴄᴀʀɢᴀ.`, m)
        }

        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
        info += `│\n`
        info += `│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n`
        info += `│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n`
        info += `│ 📡 *sᴇʀᴠɪᴅᴏʀ:* ${selectedServer}\n`
        info += `│\n`
        info += `│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n`
        info += `╰────────────────────────────╯`

        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg', 
                ptt: false, 
                fileName: `${title}.mp3` 
            }, { quoted: m })
        } else {
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
