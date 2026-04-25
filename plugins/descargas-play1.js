import fetch from "node-fetch"
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. SI NO HAY TEXTO (MENÚ INICIAL)
    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }
        let txt = `╭─〔 🌸 *𝚂𝚄𝙼𝙸 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* 🌸 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ ✨ "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }, 
            caption: txt, 
            footer: "By Leonel ⚡"
        }, { quoted: m })
    }

    // 2. LÓGICA DE DESCARGA DIRECTA
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
                let res = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(text)}`)
                let json = await res.json()
                if (json.success && json.data) {
                    dlUrl = json.data.download
                    titulo = json.data.title || 'Audio'
                }
            } else if (isVideo || isDocMp4) {
                let res = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(text)}`)
                let json = await res.json()
                if (json.status && json.data) {
                    dlUrl = json.data.download
                    titulo = json.data.title || 'Video'
                }
            }

            if (!dlUrl) throw 'Error'

            if (isAudio) {
                return await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            }
            if (isVideo) {
                return await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *Video:* ${titulo}`, footer: "By Leonel ⚡" }, { quoted: m })
            }
            if (isDocMp3) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
            }
            if (isDocMp4) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
            }

        } catch (e) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al descargar el archivo.`, m)
        }
        return 
    }

    // 3. BUSCADOR (COMANDO PLAY)
    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        if (!search || !search.all.length) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron resultados.', m)
        }

        const result = search.videos[0]
        const { title, thumbnail, timestamp, videoId, author, ago } = result
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

        let info = `「 🌸 𝚂𝚄𝙼𝙸 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 🌸 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago || 'Reciente'}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*Escribe el comando para descargar:* \n\n`
        info += `🎵 *Audio:* ${usedPrefix}yta ${videoUrl}\n`
        info += `🎥 *Video:* ${usedPrefix}ytv ${videoUrl}\n`
        info += `📁 *Doc MP3:* ${usedPrefix}ytmp3doc ${videoUrl}\n`
        info += `📁 *Doc MP4:* ${usedPrefix}ytmp4doc ${videoUrl}`

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

handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
