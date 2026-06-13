import fetch from "node-fetch"
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sylphy-6f150d'
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }, 
            caption: txt, 
            footer: "By Barboza-Team ⚡", 
            buttons: botonesCanal, 
            headerType: 4 
        }, { quoted: m })
    }

    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo || isDocMp3 || isDocMp4) {
        if (m.react) await m.react('📥')
        try {
            let dlUrl = ''
            let titulo = ''

            if (isAudio || isDocMp3) {
                try {
                    // Primera Opción: api.evogb.org (Corregida)
                    let res = await fetch(`https://api.evogb.org/dl/ytmp3?url=${encodeURIComponent(text)}&key=sasuke`)
                    let json = await res.json()
                    if (json.status && json.data) {
                        dlUrl = json.data.dl
                        titulo = json.data.title || 'Audio'
                    }
                } catch {
                    // Segunda Opción: sylphyy.xyz
                    let res = await fetch(`https://sylphyy.xyz/download/v2/ytmp3?url=${encodeURIComponent(text)}&api_key=${apiKey}`)
                    let json = await res.json()
                    if (json.status && json.result) {
                        dlUrl = json.result.dl_url
                        titulo = json.result.title || 'Audio'
                    }
                }
            } else if (isVideo || isDocMp4) {
                try {
                    // Primera Opción: api.evogb.org (Corregida con quality=auto)
                    let res = await fetch(`https://api.evogb.org/dl/ytmp4?url=${encodeURIComponent(text)}&quality=auto&key=sasuke`)
                    let json = await res.json()
                    if (json.status && json.data) {
                        dlUrl = json.data.dl
                        titulo = json.data.title || 'Video'
                    }
                } catch {
                    // Segunda Opción: api.delirius.store
                    let res = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(text)}`)
                    let json = await res.json()
                    if (json.status && json.data) {
                        dlUrl = json.data.download
                        titulo = json.data.title || 'Video'
                    }
                }
            }

            if (!dlUrl) throw 'No se pudo obtener el enlace de descarga'

            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            } else if (isVideo) {
                await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *Video:* ${titulo}`, footer: "By Barboza-Team ⚡" }, { quoted: m })
            } else if (isDocMp3) {
                await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
            } else if (isDocMp4) {
                await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
            }

            if (m.react) await m.react('🔥')

        } catch (e) {
            console.error(e)
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al descargar el archivo.`, m)
        }
        return 
    }

    try {
        if (m.react) await m.react('⏳')

        let index = 0
        let querySearch = text
        const matchIndex = command.match(/^play(\d+)$/i)

        if (matchIndex) {
            index = parseInt(matchIndex[1]) - 1
        }

        const search = await yts(querySearch)
        if (!search || !search.videos.length || !search.videos[index]) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron más resultados para esta búsqueda.', m)
        }

        const result = search.videos[index]
        const { title, thumbnail, timestamp, videoId, author, ago } = result
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
        const nextCommand = `${usedPrefix}play${index + 2}`

        const buttons = [
            { buttonId: `${usedPrefix}yta ${videoUrl}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${usedPrefix}ytv ${videoUrl}`, buttonText: { displayText: "🎥 Video" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp3doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP3" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp4doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP4" }, type: 1 },
            { buttonId: `${nextCommand} ${querySearch}`, buttonText: { displayText: "🔄 Ver más Resultados" }, type: 1 }
        ]

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago || 'Reciente'}\n`
        info += `│ 📊 *𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾:* #${index + 1}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*Seleccione una opción para descargar:*`

        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info, 
            footer: "By Barboza-Team ⚡", 
            buttons: buttons, 
            headerType: 4 
        }, { quoted: m })

        if (m.react) await m.react('✅')
    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
