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
        return await conn.sendMessage(m.chat, { image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }, caption: txt, footer: "By Barboza-Team ⚡", buttons: botonesCanal, headerType: 4 }, { quoted: m })
    }

    // --- DETECCIÓN DE COMANDOS DE BOTONES ---
    const isAudio = /^(yta|ytmp3|playaudio)$/i.test(command)
    const isVideo = /^(ytv|ytmp4|mp4)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo || isDocMp3 || isDocMp4) {
        if (m.react) await m.react('📥')
        try {
            let dlUrl = ''
            let titulo = ''

            if (isAudio || isDocMp3) {
                // API DELIRIUS: La respuesta es { status: true, data: { download: 'url' } }
                let res = await fetch(`https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(text)}`)
                let json = await res.json()
                if (json.status && json.data) {
                    dlUrl = json.data.download
                    titulo = json.data.title || 'audio'
                }
            } else {
                // API SYLPHYY: La respuesta es { status: true, result: { dl_url: 'url' } }
                let res = await fetch(`https://sylphyy.xyz/download/v2/ytmp4?url=${encodeURIComponent(text)}&api_key=${apiKey}`)
                let json = await res.json()
                if (json.status && json.result) {
                    dlUrl = json.result.dl_url
                    titulo = json.result.title || 'video'
                }
            }

            if (!dlUrl) throw 'No se obtuvo el enlace de descarga'

            if (isAudio) {
                return await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            }
            if (isVideo) {
                return await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ ${titulo}` }, { quoted: m })
            }
            if (isDocMp3) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
            }
            if (isDocMp4) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
            }

        } catch (e) {
            console.error(e)
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al procesar la solicitud.`, m)
        }
        return // Detiene la ejecución aquí si fue un comando de descarga
    }

    // --- COMANDO PRINCIPAL (BÚSQUEDA Y MENÚ) ---
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

        const buttons = [
            ...botonesCanal,
            { buttonId: `${usedPrefix}yta ${videoUrl}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${usedPrefix}ytv ${videoUrl}`, buttonText: { displayText: "🎥 Video" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp3doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP3" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp4doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP4" }, type: 1 }
        ]

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago || 'Reciente'}\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*Audio:* Si quieren audio le dan al botón\n*Video:* Igual\n*Documento mp3:* igual\n*Documento mp4:* igual`

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
