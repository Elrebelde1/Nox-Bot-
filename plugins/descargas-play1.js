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
    let forceAudio = false
    let forceVideo = false

    if (text.toLowerCase().startsWith('audio ')) {
        linkSearch = text.replace(/audio /i, '')
        forceAudio = true
    } else if (text.toLowerCase().startsWith('video ')) {
        linkSearch = text.replace(/video /i, '')
        forceVideo = true
    }

    const isAudio = /^(yta|ytmp3)$/i.test(command) || forceAudio
    const isVideo = /^(ytv|ytmp4)$/i.test(command) || forceVideo

    if (isAudio || isVideo) {
        if (m.react) await m.react('📥')
        try {
            let search = await yts(linkSearch)
            let targetUrl = search.videos[0].url
            let titulo = search.videos[0].title
            let dlUrl = ''

            if (isAudio) {
                let res = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(targetUrl)}`)
                let json = await res.json()
                if (json.success && json.data) {
                    dlUrl = json.data.download
                }
            } else if (isVideo) {
                let res = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(targetUrl)}`)
                let json = await res.json()
                if (json.status && json.data) {
                    dlUrl = json.data.download
                }
            }

            if (!dlUrl) throw 'Error'

            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            } else if (isVideo) {
                await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *Video:* ${titulo}`, footer: "By Leonel ⚡" }, { quoted: m })
            }
            if (m.react) await m.react('✅')

        } catch (e) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al procesar la descarga.`, m)
        }
        return 
    }

    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        if (!search || !search.all.length) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ Sin resultados.', m)
        }

        const result = search.videos[0]
        const { title, thumbnail, timestamp, author, ago } = result

        let info = `「 🌸 𝚂𝚄𝙼𝙸 𝚂𝙰𝙺𝚄𝚆𝙰𝚁𝙰𝚉𝙰 🌸 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago || 'Reciente'}\n`
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
