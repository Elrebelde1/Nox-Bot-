import fetch from "node-fetch"
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Botón de canales (el que querías mantener)
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    // 1. SI NO HAY TEXTO: ENVIAR MENÚ DE AYUDA/CATÁLOGO
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

    // 2. LÓGICA DE ENVÍO DE ARCHIVOS (Cuando se pulsan los botones)
    // Detectamos si el comando es de descarga directa
    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4)$/i.test(command)
    const isDocAudio = /^(ytmp3doc)$/i.test(command)
    const isDocVideo = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo || isDocAudio || isDocVideo) {
        if (m.react) await m.react('📥')
        
        try {
            // AQUÍ VA TU LÓGICA DE DESCARGA REAL
            // Para el ejemplo uso una descarga directa, ajusta según tus plugins de descarga
            if (isAudio) {
                return await conn.sendMessage(m.chat, { audio: { url: text }, mimetype: 'audio/mpeg' }, { quoted: m })
            }
            if (isVideo) {
                return await conn.sendMessage(m.chat, { video: { url: text }, caption: '✅ Video listo' }, { quoted: m })
            }
            if (isDocAudio) {
                return await conn.sendMessage(m.chat, { document: { url: text }, mimetype: 'audio/mpeg', fileName: `audio.mp3` }, { quoted: m })
            }
            if (isDocVideo) {
                return await conn.sendMessage(m.chat, { document: { url: text }, mimetype: 'video/mp4', fileName: `video.mp4` }, { quoted: m })
            }
        } catch (e) {
            console.error(e)
            return conn.reply(m.chat, '❌ Error al procesar la descarga.', m)
        }
    }

    // 3. LÓGICA DE BÚSQUEDA (Comando play principal)
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
        
        // Re-armamos todos tus botones tal cual los tenías
        const buttons = [
            ...botonesCanal,
            { buttonId: `${usedPrefix}yta ${videoUrl}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${usedPrefix}ytv ${videoUrl}`, buttonText: { displayText: "🎥 Video" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp3doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP3" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp4doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP4" }, type: 1 }
        ]

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago || 'Reciente'}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*Audio:* Si quieren audio le dan al botón\n`
        info += `*Video:* Igual\n`
        info += `*Documento mp3:* igual\n`
        info += `*Documento mp4:* igual`

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

handler.command = /^(play|yta|ytmp3|play2|ytv|playaudio|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
