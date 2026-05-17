/**
 * 📂 COMANDO: Uchiha YouTube Downloader (API-Scraper Híbrido)
 * 📝 DESCRIPCIÓN: Descarga música y video saltándose el bloqueo de IP de YouTube usando buffers directos.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import yts from 'yt-search'
import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "By Barboza Uchiha ⚡"
    const chn = "Zona Devs Official"

    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        let intro = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: { url: 'https://files.catbox.moe/t7uytz.png' }, 
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
        let result = null

        // Buscador integrado usando tu librería yt-search nativa
        if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
            let searchUrl = await yts(text)
            if (searchUrl && searchUrl.videos[0]) {
                result = searchUrl.videos[0]
                link = result.url
            } else {
                throw new Error('No se encontraron resultados.')
            }
        } else {
            let searchInfo = await yts(link)
            if (searchInfo && searchInfo.videos[0]) {
                result = searchInfo.videos[0]
            }
        }

        const titulo = result ? result.title : 'Uchiha_Media'

        // Si es el comando informativo principal (.play) manda la carátula primero
        if (isPlay && result) {
            let report = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝙰 𝖯𝖫𝙰𝖸* 🎵\n` +
                        `|═══════════════════\n` +
                        `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${result.title}\n` +
                        `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${result.timestamp}\n` +
                        `| 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* ✅ Bypass Activo\n` +
                        `|═══════════════════\n` +
                        `| 🛠️ *⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓*\n` +
                        `| ⛩️ *⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕*`

            await conn.sendMessage(m.chat, { 
                image: { url: result.thumbnail }, 
                caption: report
            }, { quoted: m })
            if (m.react) await m.react('⏳')
        }

        // Consultamos al backend bypass para obtener la descarga limpia
        const type = (isAudio || isDocMp3) ? 'mp3' : 'mp4'
        const apiRes = await fetch(`https://api.vreden.my.id/api/v1/download/youtube?url=${encodeURIComponent(link)}&type=${type}`)
        const json = await apiRes.json()

        if (!json.status || !json.result || !json.result.download) {
            throw new Error('El servidor de descargas rechazó la petición.')
        }

        const downloadUrl = json.result.download
        const mediaBuffer = await fetch(downloadUrl).then(res => res.buffer())

        // Filtrado de envíos según formato seleccionado
        if (isVideo || isDocMp4) {
            if (isDocMp4) {
                await conn.sendMessage(m.chat, { document: mediaBuffer, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: mediaBuffer, caption: `✅ *Video:* ${titulo}\n\n🛠️ ${dev}` }, { quoted: m })
            }
        } else if (isAudio || isDocMp3) {
            if (isDocMp3) {
                await conn.sendMessage(m.chat, { document: mediaBuffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
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
                await conn.sendMessage(m.chat, { audio: mediaBuffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
            }
        }

        if (m.react) await m.react('🔥')

    } catch (e) {
        console.error("-> [Error en Uchiha Player Bypass]:", e)
        if (m.react) await m.react('❌')
        return conn.reply(m.chat, `🛑 *Error General:* No se pudo descargar la pista musical.\n> Intenta de nuevo con otro término o verifica el enlace.`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play2|play3|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
