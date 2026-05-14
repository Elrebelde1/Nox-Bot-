/**
 * 📂 COMANDO: Uchiha YouTube Downloader
 * 📝 DESCRIPCIÓN: Descargador de YouTube MP3/MP4 con motor de búsqueda.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org/dl/ytmp3
 */

import fetch from "node-fetch"
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const sigma = "𐏓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ⚡"
    const red = "𐋉 𝒁𝒐𝒏𝒂 𝑫𝒆𝒗𝒔 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍"

    const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
    const a = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3Jn")
    const k = b("c2FzdWtl")

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

    const isAudio = /^(yta|ytmp3|ytmp3doc)$/i.test(command)
    const isVideo = /^(ytv|ytmp4|ytmp4doc)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo) {
        if (m.react) await m.react('📥')
        try {
            let dlUrl = ''
            let titulo = ''
            let type = (isAudio || isDocMp3) ? 'ytmp3' : 'ytmp4'

            let res = await fetch(`${a}/dl/${type}?url=${encodeURIComponent(text)}&key=${k}`)
            let json = await res.json()
            
            if (json.status && json.data) {
                dlUrl = json.data.dl
                titulo = json.data.title || 'Audio'
            }

            if (!dlUrl) throw 'No se pudo obtener el enlace'

            if (command === 'yta' || command === 'ytmp3') {
                return await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            }
            if (command === 'ytv' || command === 'ytmp4') {
                return await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *Video:* ${titulo}`, footer: "By Barboza-Team ⚡" }, { quoted: m })
            }
            if (isDocMp3) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
            }
            if (isDocMp4) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
            }

        } catch (e) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al descargar.`, m)
        }
        return 
    }

    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        if (!search || !search.all.length) return conn.reply(m.chat, '❌ Sin resultados.', m)

        const result = search.videos[0]
        const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`

        const buttons = [
            { buttonId: `${usedPrefix}yta ${videoUrl}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${usedPrefix}ytv ${videoUrl}`, buttonText: { displayText: "🎥 Video" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp3doc ${videoUrl}`, buttonText: { displayText: "📁 Doc MP3" }, type: 1 },
            { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
        ]

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${result.author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${result.title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${result.timestamp}\n`
        info += `│ 💠 *𝙰𝚄𝚃𝙾𝚁:* GataDios\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `🛠️ *${sigma}* | 📡 *${red}*`

        await conn.sendMessage(m.chat, { 
            image: { url: result.thumbnail }, 
            caption: info, 
            footer: "By Barboza-Team ⚡", 
            buttons: buttons, 
            headerType: 4 
        }, { quoted: m })

        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
