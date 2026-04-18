import fetch from "node-fetch"
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

        let txt = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
        txt += `│\n`
        txt += `│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n`
        txt += `│ ${usedPrefix + command} [nombre o link]\n`
        txt += `│\n`
        txt += `│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n`
        txt += `╰────────────────────────────╯`

        return await conn.sendMessage(m.chat, {
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url },
            caption: txt,
            footer: "By Barboza-Team ⚡",
            buttons: botonesCanal,
            headerType: 4
        }, { quoted: m })
    }

    try {
        if (m.react) await m.react('⏳')

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

        if (isAudio) {
            const res = await fetch(`https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(videoUrl)}`)
            const json = await res.json()
            if (json.status) downloadUrl = json.data.download
        } else {
            const apiKey = 'sylphy-6f150d'
            const res = await fetch(`https://sylphyy.xyz/download/v2/ytmp4?url=${encodeURIComponent(videoUrl)}&api_key=${apiKey}`)
            const json = await res.json()
            if (json.status) downloadUrl = json.result.dl_url
        }

        if (!downloadUrl) return conn.reply(m.chat, `🛑 ᴇʀʀᴏʀ ᴀʟ ᴏʙᴛᴇɴᴇʀ ᴅᴇsᴄᴀʀɢᴀ.`, m)

        // --- 1. ENVIAR INFORMACIÓN CON EL BOTÓN ---
        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n│\n│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n│\n│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n╰────────────────────────────╯`

        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info,
            footer: "By Barboza-Team ⚡",
            buttons: botonesCanal,
            headerType: 4
        }, { quoted: m })

        // --- 2. ENVIAR EL AUDIO PURO (O VIDEO) ---
        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg', 
                ptt: true // Esto lo hace "Audio Puro" (nota de voz/onda)
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                mimetype: 'video/mp4', 
                caption: `✅ *ᴠɪᴅᴇᴏ ʟɪsᴛᴏ*` 
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
