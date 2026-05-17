/**
 * 📂 COMANDO: Uchiha YouTube Downloader (Scraper Nativo Puro)
 * 📝 DESCRIPCIÓN: Descarga e instala yt-dlp automáticamente. Envía info + foto + audio directo.
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
    const dev = "By Barboza Uchiha ⚡"
    const chn = "Zona Devs Official"

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

    const isPlay = /^(play|play2|play3)$/i.test(command)
    const isAudio = /^(yta|ytmp3|ytmp3doc)$/i.test(command) || isPlay
    const isVideo = /^(ytv|mp4|ytmp4|ytmp4doc)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (m.react) await m.react('📥')
    
    try {
        let link = text.trim()
        let titulo = 'Media_File'
        let videoId = Date.now()
        let result = null

        if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
            let searchUrl = await yts(text)
            if (searchUrl && searchUrl.videos[0]) {
                result = searchUrl.videos[0]
                link = result.url
                titulo = result.title
                videoId = result.videoId
            } else {
                throw 'No encontrado'
            }
        } else {
            let searchInfo = await yts(link)
            if (searchInfo && searchInfo.videos[0]) {
                result = searchInfo.videos[0]
                titulo = result.title
                videoId = result.videoId
            }
        }

        if (isPlay && result) {
            let report = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝙰 𝖯𝖫𝙰𝖸* 🎵\n` +
                        `|═══════════════════\n` +
                        `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${result.title}\n` +
                        `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${result.timestamp}\n` +
                        `| 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* ✅ Scraper Activo\n` +
                        `|═══════════════════\n` +
                        `| 🛠️ *⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓*\n` +
                        `| ⛩️ *⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕*`

            await conn.sendMessage(m.chat, { 
                image: { url: result.thumbnail }, 
                caption: report
            }, { quoted: m })
            if (m.react) await m.react('⏳')
        }

        if (isVideo || isDocMp4) {
            const outputVideo = `./${videoId}.mp4`

            await ytDlpWrap.execPromise([
                link,
                "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]",
                "-o", outputVideo
            ])

            if (existsSync(outputVideo)) {
                const videoBuffer = readFileSync(outputVideo)
                if (isDocMp4) {
                    await conn.sendMessage(m.chat, { document: videoBuffer, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
                } else {
                    await conn.sendMessage(m.chat, { video: videoBuffer, caption: `✅ *Video:* ${titulo}\n\n🛠️ ${dev}` }, { quoted: m })
                }
                unlinkSync(outputVideo)
            }
        } else if (isAudio || isDocMp3) {
            const outputAudio = `./${videoId}.mp3`

            await ytDlpWrap.execPromise([
                link,
                "-x",
                "--audio-format", "mp3",
                "--audio-quality", "0",
                "-o", outputAudio
            ])

            if (existsSync(outputAudio)) {
                const audioBuffer = readFileSync(outputAudio)
                if (isDocMp3) {
                    await conn.sendMessage(m.chat, { document: audioBuffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
                } else {
                    if (!isPlay) {
                        let infoAudio = `🎧 *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝚄𝙳𝙸𝙾 𝙿𝙻𝙰𝚈𝙴𝚁*\n` +
                                        `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n\n` +
                                        `📌 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${titulo}\n` +
                                        `📦 *𝙵𝙾𝚁𝙼𝙰𝚃𝙾:* MP3\n` +
                                        `✅ *𝙴𝚂𝚃𝙰𝙳𝙾:* Enviando...\n\n` +
                                        `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n` +
                                        `🛠️ 𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ⚡\n` +
                                        `📡 𝒁𝒐𝒏𝒂 𝑫𝒆𝒗𝒔 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍`
                        await conn.reply(m.chat, infoAudio, m)
                    }
                    await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
                }
                unlinkSync(outputAudio)
            }
        }

        if (m.react) await m.react('🔥')

    } catch (e) {
        if (m.react) await m.react('❌')
        return conn.reply(m.chat, `🛑 Error al procesar el scraper nativo.`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play2|play3|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
