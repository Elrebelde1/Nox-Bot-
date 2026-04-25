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

    let linkSearch = text
    let forceAudio = /^(audio|mp3)$/i.test(text.split(' ')[0])
    let forceVideo = /^(video|mp4)$/i.test(text.split(' ')[0])

    if (forceAudio || forceVideo) {
        linkSearch = text.split(' ').slice(1).join(' ')
    }

    const isAudio = /^(yta|ytmp3)$/i.test(command) || forceAudio
    const isVideo = /^(ytv|ytmp4)$/i.test(command) || forceVideo

    if (isAudio || isVideo) {
        if (m.react) await m.react('📥')
        try {
            let search = await yts(linkSearch)
            if (!search.videos.length) return m.reply('No se encontró el video.')
            let targetUrl = search.videos[0].url
            let titulo = search.videos[0].title
            
            if (isAudio) {
                let res = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(targetUrl)}`)
                let json = await res.json()
                if (json.status && json.data?.download) {
                    await conn.sendMessage(m.chat, { 
                        audio: { url: json.data.download }, 
                        mimetype: 'audio/mpeg',
                        fileName: `${titulo}.mp3`
                    }, { quoted: m })
                } else {
                    throw 'Error en API'
                }
            } else if (isVideo) {
                let res = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(targetUrl)}`)
                let json = await res.json()
                if (json.status && json.data?.download) {
                    await conn.sendMessage(m.chat, { 
                        video: { url: json.data.download }, 
                        caption: `✅ *Video:* ${titulo}`, 
                        footer: "By Leonel ⚡" 
                    }, { quoted: m })
                } else {
                    throw 'Error en API'
                }
            }
            if (m.react) await m.react('✅')
        } catch (e) {
            console.error(e)
            if (m.react) await m.react('❌')
            m.reply('🛑 Error al enviar el archivo.')
        }
        return 
    }

    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        if (!search || !search.all.length) return
        
        const result = search.videos[0]
        const { title, thumbnail, timestamp, author, ago } = result

        let info = `「 🌸 𝚂𝚄𝙼𝙸 𝚂𝙰𝙺𝚄𝚆𝙰𝚁𝙰𝚉𝙰 🌸 」\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───`

        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info, 
            footer: "By Leonel ⚡"
        }, { quoted: m })

        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4)$/i
export default handler
