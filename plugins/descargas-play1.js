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
    
    // Configuración Base64
    const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
    const a = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3Jn")
    const k = b("c2FzdWtl")

    if (!text) return conn.reply(m.chat, `*🏮 [ SISTEMA UCHIHA ]*\n\n*Ingresa el nombre o link de YouTube.*\n*Ejemplo:* ${usedPrefix + command} Hay Lupita`, m)

    // Lógica de descarga directa
    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4)$/i.test(command)

    if (isAudio || isVideo) {
        if (m.react) await m.react('📥')
        try {
            const type = isAudio ? 'ytmp3' : 'ytmp4'
            const res = await fetch(`${a}/dl/${type}?url=${encodeURIComponent(text)}&key=${k}`)
            const json = await res.json()

            if (!json.status) throw new Error()

            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: { url: json.data.dl }, mimetype: 'audio/mpeg' }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: { url: json.data.dl }, caption: `✅ *Video:* ${json.data.title}` }, { quoted: m })
            }
            if (m.react) await m.react('✅')
        } catch (e) {
            if (m.react) await m.react('❌')
            return m.reply('🛑 Error en la extracción del video.')
        }
        return 
    }

    // Buscador principal (Play)
    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        if (!search || !search.all.length) return m.reply('❌ Sin resultados.')

        const v = search.videos[0]
        const url = v.url

        let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃   🏮  *UCHIHA YOUTUBE* 🏮\n`
        txt += `┣━━━━━━━━━━━━━━━━━━┛\n`
        txt += `┃\n`
        txt += `┃ 🎵 *Tɪ́ᴛᴜʟᴏ:* ${v.title}\n`
        txt += `┃ 👤 *Cᴀɴᴀʟ:* ${v.author.name}\n`
        txt += `┃ ⏱️ *Tɪᴇᴍᴘᴏ:* ${v.timestamp}\n`
        txt += `┃\n`
        txt += `┃ ⚙️ *Esᴛᴀᴅᴏ:* 🟢 Listo\n`
        txt += `┃\n`
        txt += `┣━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃ ⚡ *${dev}*\n`
        txt += `┃ 📡 *${chn}*\n`
        txt += `┗━━━━━━━━━━━━━━━━━━┛\n\n`
        txt += `> *Para descargar usa:*\n`
        txt += `> *${usedPrefix}yta* (Audio)\n`
        txt += `> *${usedPrefix}ytv* (Video)`

        await conn.sendMessage(m.chat, { image: { url: v.thumbnail }, caption: txt }, { quoted: m })
        if (m.react) await m.react('✨')
    } catch (e) {
        if (m.react) await m.react('❌')
    }
}

handler.help = ['play']
handler.tags = ['dl']
handler.command = /^(play|yta|ytmp3|ytv|ytmp4)$/i

export default handler
