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

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"
    
    const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
    const a = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3Jn")
    const k = b("c2FzdWtl")

    if (!text.trim()) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: { url: 'https://files.catbox.moe/t7uytz.png' }, 
            caption: txt, 
            footer: "By Barboza-Team ⚡"
        }, { quoted: m })
    }

    const isAudio = /^(yta|ytmp3|ytmp3doc)$/i.test(command)
    const isVideo = /^(ytv|ytmp4|ytmp4doc)$/i.test(command)

    if (isAudio || isVideo) {
        if (m.react) await m.react('📥')
        try {
            const type = isAudio ? 'ytmp3' : 'ytmp4'
            let res = await fetch(`${a}/dl/${type}?url=${encodeURIComponent(text)}&key=${k}`)
            let json = await res.json()

            if (!json.status || !json.data.dl) throw 'Error'

            const dlUrl = json.data.dl
            const titulo = json.data.title || 'Uchiha-DL'

            if (command.includes('doc')) {
                const mime = isAudio ? 'audio/mpeg' : 'video/mp4'
                const ext = isAudio ? 'mp3' : 'mp4'
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: mime, fileName: `${titulo}.${ext}` }, { quoted: m })
            }

            if (isAudio) {
                return await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            } else {
                return await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *Video:* ${titulo}` }, { quoted: m })
            }

        } catch (e) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al procesar descarga.`, m)
        }
    }

    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        if (!search || !search.all.length) return conn.reply(m.chat, '❌ No hay resultados.', m)

        const v = search.videos[0]
        const videoUrl = v.url

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${v.author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${v.title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${v.timestamp}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*Seleccione una opción para descargar:*\n\n`
        info += `> *${usedPrefix}yta* (Audio)\n`
        info += `> *${usedPrefix}ytv* (Video)\n`
        info += `> *${usedPrefix}ytmp3doc* (Doc MP3)\n`
        info += `> *${usedPrefix}ytmp4doc* (Doc MP4)`

        await conn.sendMessage(m.chat, { 
            image: { url: v.thumbnail }, 
            caption: info, 
            footer: "By Barboza-Team ⚡"
        }, { quoted: m })

        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|ytv|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
