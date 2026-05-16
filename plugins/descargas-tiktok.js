/**
 * 📂 COMANDO: Uchiha TikTok Downloader (Pure Scraper)
 * 📝 DESCRIPCIÓN: Descarga videos o audios de TikTok sin marcas de agua.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import YTDlpWrap from "yt-dlp-wrap"
import { existsSync, unlinkSync } from 'fs'

const binPath = "./src/bin/yt-dlp"
const ytDlpWrap = new YTDlpWrap.default(binPath)

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ⚡"
    const chn = "𝒁𝒐𝒏𝒂 𝑫𝒆𝒗𝒔 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍"

    if (!text) return conn.reply(m.chat, `⚔️ *SISTEMA UCHIHA*\n\n> 👤 *Pega el enlace de TikTok*\n> 🔗 *Ej:* ${usedPrefix + command} https://vm.tiktok.com/...`, m)

    const isAudio = /audio|mp3/i.test(command)
    if (m.react) await m.react('📥')

    try {
        let link = text.trim()
        const videoId = Date.now()

        if (isAudio) {
            const outputAudio = `./tt_${videoId}.mp3`
            
            await ytDlpWrap.execPromise([link, "-x", "--audio-format", "mp3", "--audio-quality", "0", "-o", outputAudio])
            
            await conn.sendMessage(m.chat, { 
                audio: { url: outputAudio }, 
                mimetype: 'audio/mpeg', 
                fileName: `TT_${videoId}.mp3` 
            }, { quoted: m })
            
            if (existsSync(outputAudio)) unlinkSync(outputAudio)
        } else {
            const outputVideo = `./tt_${videoId}.mp4`
            
            await ytDlpWrap.execPromise([link, "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]", "-o", outputVideo])
            
            await conn.sendMessage(m.chat, { 
                video: { url: outputVideo }, 
                caption: `✅ *TikTok Video*\n\n${dev}` 
            }, { quoted: m })
            
            if (existsSync(outputVideo)) unlinkSync(outputVideo)
        }

        if (m.react) await m.react('🔥')

    } catch (e) {
        if (m.react) await m.react('❌')
        return conn.reply(m.chat, `🛑 Error en el scraper de TikTok.`, m)
    }
}

handler.help = ['tiktok', 'ttaudio']
handler.tags = ['descargas']
handler.command = /^(tt|tiktok|ttaudio|ttmp3)$/i

export default handler
