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

        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n`
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
        const { title, thumbnail, timestamp, videoId, author, ago } = result
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        let downloadUrl = null
        let selectedServer = ""

        // LÓGICA DE APIS ORIGINAL
        if (isAudio) {
            try {
                let res = await fetch(`https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(videoUrl)}`)
                let json = await res.json()
                if (json.status && json.data?.download) {
                    downloadUrl = json.data.download
                    selectedServer = "Delirius V1"
                } else {
                    let res2 = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(videoUrl)}`)
                    let json2 = await res2.json()
                    if (json2.success && json2.data?.download) {
                        downloadUrl = json2.data.download
                        selectedServer = "Delirius V2"
                    }
                }
            } catch (e) { console.error("Error en Audio API") }
        } else {
            try {
                const apiKey = 'sylphy-6f150d'
                let res = await fetch(`https://sylphyy.xyz/download/v2/ytmp4?url=${encodeURIComponent(videoUrl)}&api_key=${apiKey}`)
                let json = await res.json()
                if (json.status && json.result?.dl_url) {
                    downloadUrl = json.result.dl_url
                    selectedServer = "Sylphy V2"
                }
            } catch (e) { console.error("Error en Video API") }
        }

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 ᴇʀʀᴏʀ ᴀʟ ᴏʙᴛᴇɴᴇʀ ᴅᴇsᴄᴀʀɢᴀ.`, m)
        }

        // DISEÑO DE INFORMACIÓN DE TU CAPTURA
        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ 📡 *𝚂𝙴𝚁𝚅𝙸𝙳𝙾𝚁:* ${selectedServer}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago || 'Reciente'}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `「 🐦‍⬛  *𝙸𝙽𝚅𝙾𝙲𝙰𝙽𝙳𝙾 𝙰𝚄𝙳𝙸𝙾...* 」`

        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info,
            footer: "By Barboza-Team ⚡",
            buttons: botonesCanal,
            headerType: 4
        }, { quoted: m })

        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg', 
                fileName: `${title}.mp3` 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                mimetype: 'video/mp4', 
                caption: `✅ *ʀᴇᴘʀᴏᴅᴜᴄᴄɪᴏ́ɴ ʟɪsᴛᴀ*\n🎬 ${title}`,
                footer: "By Barboza-Team ⚡",
                buttons: botonesCanal,
                headerType: 4
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
