import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `⚠️ ¡Ingresa el nombre o el link!\n\nEjemplo:\n*${usedPrefix + command}* Antifragile`

    if (m.react) await m.react('⏳')

    try {
        // BUSCADOR
        const search = await yts(text)
        const video = search.videos[0]
        if (!video) throw '❌ No se encontraron resultados.'
        
        const url = video.url
        const { title, thumbnail, timestamp, author } = video

        // 1. PRIMERO YTMP3 (Audio)
        let resMp3 = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(url)}`)
        let jsonMp3 = await resMp3.json()

        // 2. DESPUÉS YTMP4 (Video)
        let resMp4 = await fetch(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(url)}`)
        let jsonMp4 = await resMp4.json()

        // VALIDACIÓN DE DATOS
        if (!jsonMp3.success || !jsonMp4.status) throw 'Error al obtener enlaces de descarga'

        const dl_mp3 = jsonMp3.data.download
        const dl_mp4 = jsonMp4.data.download

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n> *Enviando Audio y Video...*`

        // ENVIAR INFO CON MINIATURA
        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info, 
            footer: "By Barboza-Team ⚡" 
        }, { quoted: m })

        // ENVIAR AUDIO
        await conn.sendMessage(m.chat, { 
            audio: { url: dl_mp3 }, 
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m })

        // ENVIAR VIDEO
        await conn.sendMessage(m.chat, { 
            video: { url: dl_mp4 }, 
            caption: `✅ *Video:* ${title}`,
            footer: "By Barboza-Team ⚡"
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        m.reply(`🛑 Error: No se pudo completar la descarga.`)
    }
}

handler.command = /^(play)$/i
export default handler
