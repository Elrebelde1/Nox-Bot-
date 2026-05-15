/**
 * 📂 COMANDO: Uchiha YouTube Downloader (Scraper Nativo Puro)
 * 📝 DESCRIPCIÓN: Descargador e instalador automático de yt-dlp-wrap sin APIs externas.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import YTDlpWrap from "yt-dlp-wrap"
import yts from 'yt-search'
import { readFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'

const binFolder = "./src/bin"
const binPath = `${binFolder}/yt-dlp`
if (!existsSync(binFolder)) mkdirSync(binFolder, { recursive: true })

if (!existsSync(binPath)) {
    YTDlpWrap.default.downloadFromGithub(binPath).catch(() => {})
}

const ytDlpWrap = new YTDlpWrap.default(binPath)

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ⚡"
    const chn = "𝒁𝒐𝒏𝒂 𝑫𝒆𝒗𝒔 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍"

    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }
        let intro = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }, 
            caption: intro, 
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
            let link = text.trim()
            let titulo = 'Media_File'
            let videoId = Date.now()

            if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
                let searchUrl = await yts(text)
                if (searchUrl && searchUrl.videos[0]) {
                    link = searchUrl.videos[0].url
                    titulo = searchUrl.videos[0].title
                    videoId = searchUrl.videos[0].videoId
                } else {
                    throw 'No encontrado'
                }
            } else {
                let searchInfo = await yts(link)
                if (searchInfo && searchInfo.videos[0]) {
                    titulo = searchInfo.videos[0].title
                    videoId = searchInfo.videos[0].videoId
                }
            }

            if (isAudio || isDocMp3) {
                const outputAudio = `./${videoId}.mp3`
                
                await ytDlpWrap.execPromise([
                    link,
                    "-x",
                    "--audio-format", "mp3",
                    "--audio-quality", "0",
                    "-o", outputAudio
                ])

                if (isDocMp3) {
                    await conn.sendMessage(m.chat, { document: { url: outputAudio }, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
                } else {
                    let infoAudio = `🎧 *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝚄𝙳𝙸𝙾 𝙿𝙻𝙰𝚈𝙴𝚁*\n` +
                                    `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n\n` +
                                    `📌 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${titulo}\n` +
                                    `📦 *𝙵𝙾𝚁𝙼𝙰𝚃𝙾:* MP3\n` +
                                    `✅ *𝙴𝚂𝚃𝙰𝙳𝙾:* Enviando...\n\n` +
                                    `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n` +
                                    `🛠️ ${dev}\n` +
                                    `📡 ${chn}`
                    await conn.reply(m.chat, infoAudio, m)
                    await conn.sendMessage(m.chat, { audio: { url: outputAudio }, mimetype: 'audio/mpeg' }, { quoted: m })
                }
                
                if (existsSync(outputAudio)) unlinkSync(outputAudio)
            } else if (isVideo || isDocMp4) {
                const outputVideo = `./${videoId}.mp4`

                await ytDlpWrap.execPromise([
                    link,
                    "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]",
                    "-o", outputVideo
                ])

                if (isDocMp4) {
                    await conn.sendMessage(m.chat, { document: { url: outputVideo }, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
                } else {
                    await conn.sendMessage(m.chat, { video: { url: outputVideo }, caption: `✅ *Video:* ${titulo}\n\n${dev}` }, { quoted: m })
                }

                if (existsSync(outputVideo)) unlinkSync(outputVideo)
            }

            if (m.react) await m.react('🔥')

        } catch (e) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al procesar el scraper nativo.`, m)
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
        const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`

        const buttons = [
            { buttonId: `${usedPrefix}yta ${videoUrl}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${usedPrefix}ytv ${videoUrl}`, buttonText: { displayText: "🎥 Video" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp3doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP3" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp4doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP4" }, type: 1 },
            { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
        ]

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n` +
                   `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${result.author.name}\n` +
                   `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${result.title}\n` +
                   `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${result.timestamp}\n` +
                   `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${result.ago || 'Reciente'}\n` +
                   `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n` +
                   `🛠️ *${dev}*\n` +
                   `📡 *${chn}*`

        await conn.sendMessage(m.chat, { 
            image: { url: result.thumbnail }, 
            caption: info, 
            footer: "Seleccione una opción para descargar:", 
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
