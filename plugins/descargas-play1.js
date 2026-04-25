import fetch from "node-fetch"
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }
        let txt = `╭─〔 🌸 *𝚂𝚄𝙼𝙸 𝚂𝙰𝙺𝚄𝚆𝙰𝚁𝙰𝚉𝙰* 🌸 〕─╮\n│\n│ 🎬 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [nombre o link]\n│\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }, 
            caption: txt, 
            footer: "By Leonel ⚡"
        }, { quoted: m })
    }

    let isAudio = /^(yta|ytmp3)$/i.test(command) || text.toLowerCase().startsWith('audio ')
    let isVideo = /^(ytv|ytmp4)$/i.test(command) || text.toLowerCase().startsWith('video ')
    let query = text.replace(/^(audio|video) /i, '')

    if (isAudio || isVideo) {
        if (m.react) await m.react('📥')
        try {
            let search = await yts(query)
            if (!search.videos.length) return m.reply('❌ No se encontró nada.')
            let url = search.videos[0].url
            let title = search.videos[0].title

            if (isAudio) {
                let res = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(url)}`)
                let json = await res.json()
                if (json.success && json.data.download) {
                    await conn.sendMessage(m.chat, { 
                        audio: { url: json.data.download }, 
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`
                    }, { quoted: m })
                    if (m.react) await m.react('✅')
                } else throw 'Error'
            } else {
                let res = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(url)}`)
                let json = await res.json()
                if (json.status && json.data.download) {
                    await conn.sendMessage(m.chat, { 
                        video: { url: json.data.download }, 
                        caption: `✅ *Video:* ${title}`,
                        footer: "By Leonel ⚡"
                    }, { quoted: m })
                    if (m.react) await m.react('✅')
                } else throw 'Error'
            }
        } catch (e) {
            if (m.react) await m.react('❌')
            console.error(e)
        }
        return
    }

    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        const result = search.videos[0]
        if (!result) return

        let info = `「 🌸 𝚂𝚄𝙼𝙸 𝚂𝙰𝙺𝚄𝚆𝙰𝚁𝙰𝚉𝙰 🌸 」\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${result.author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${result.title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${result.timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${result.ago}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───`

        await conn.sendMessage(m.chat, { 
            image: { url: result.thumbnail }, 
            caption: info, 
            footer: "By Leonel ⚡"
        }, { quoted: m })
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|ytv|ytmp4)$/i
export default handler
