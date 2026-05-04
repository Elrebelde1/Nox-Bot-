/**
 * 📂 COMANDO: Uchiha YouTube Pro
 * 📝 DESCRIPCIÓN: Sistema avanzado de búsqueda y descarga de YouTube (720p Fix).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const _0x4a1b = 'ZWt1c2Fz' 
    const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

    if (!text.trim()) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: { url: 'https://files.catbox.moe/t7uytz.png' }, 
            caption: txt, 
            footer: "By Barboza-Team ⚡"
        }, { quoted: m })
    }

    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4|mp4)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo || isDocMp3 || isDocMp4) {
        if (m.react) await m.react('📥')
        try {
            let type = (isAudio || isDocMp3) ? 'audio' : 'video'
            let quality = (isVideo || isDocMp4) ? '720' : 'auto'
            let res = await fetch(`https://api.evogb.org/dl/youtubeplay?query=${encodeURIComponent(text)}&type=${type}&quality=${quality}&key=${key}`)
            let json = await res.json()

            if (!json.status || !json.data) throw 'Error en la descarga'

            const { title, download } = json.data
            const dlUrl = download.url

            if (isAudio) {
                return await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            }
            if (isVideo) {
                return await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *Video (720p):* ${title}`, footer: "By Barboza-Team ⚡" }, { quoted: m })
            }
            if (isDocMp3) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
            }
            if (isDocMp4) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'video/mp4', fileName: `${title}.mp4` }, { quoted: m })
            }

        } catch (e) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al procesar la descarga.`, m)
        }
        return 
    }

    try {
        if (m.react) await m.react('⏳')
        let res = await fetch(`https://api.evogb.org/dl/youtubeplay?query=${encodeURIComponent(text)}&type=audio&quality=auto&key=${key}`)
        let json = await res.json()

        if (!json.status || !json.data) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron resultados.', m)
        }

        const data = json.data
        const buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${data.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${usedPrefix}ytv ${data.url}`, buttonText: { displayText: "🎥 Video 720p" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp3doc ${data.url}`, buttonText: { displayText: "📁 Doc MP3" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp4doc ${data.url}`, buttonText: { displayText: "📁 Doc MP4" }, type: 1 },
            { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
        ]

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${data.author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${data.title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${data.duration.timestamp}\n`
        info += `│ 👁️ *𝚅𝙸𝚂𝚃𝙰𝚂:* ${data.views.toLocaleString()}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${data.ago}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n*Seleccione una opción para descargar:*`

        await conn.sendMessage(m.chat, { 
            image: { url: data.image }, 
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

handler.help = ['play', 'ytmp3', 'ytmp4']
handler.tags = ['downloader']
handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i

export default handler
