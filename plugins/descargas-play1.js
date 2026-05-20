import axios from 'axios'
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

async function getSavetubeData(url, type, quality) {
    const infoConfig = {
        method: 'post',
        url: 'https://cdn401.savetube.vip/v2/info',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Origin': 'https://savetube.vip',
            'Referer': 'https://savetube.vip/'
        },
        data: { url },
        timeout: 30000
    }
    
    const infoResponse = await axios(infoConfig)
    const encryptedData = infoResponse.data.data

    const downloadConfig = {
        method: 'post',
        url: `https://cdn400.savetube.vip/download`,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Origin': 'https://savetube.vip',
            'Referer': 'https://savetube.vip/'
        },
        data: {
            downloadType: type,
            quality: quality,
            key: encryptedData.key
        },
        timeout: 30000
    }

    const dlResponse = await axios(downloadConfig)
    return {
        title: encryptedData.title || 'Multimedia',
        link: dlResponse.data.data.url || dlResponse.data.url || dlResponse.data.data.downloadUrl
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }, 
            caption: txt, 
            footer: "By Barboza-Team ⚡", 
            buttons: botonesCanal, 
            headerType: 4 
        }, { quoted: m })
    }

    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo || isDocMp3 || isDocMp4) {
        if (m.react) await m.react('📥')
        try {
            let queryTarget = text.trim()
            if (!queryTarget.includes('youtube.com') && !queryTarget.includes('youtu.be')) {
                const searchData = await yts(text)
                if (searchData.videos.length) queryTarget = searchData.videos[0].url
            }

            const type = (isAudio || isDocMp3) ? 'audio' : 'video'
            const quality = type === 'audio' ? '128' : '720'
            
            const media = await getSavetubeData(queryTarget, type, quality)
            if (!media.link) throw 'No se obtuvo el enlace de descarga'

            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: { url: media.link }, mimetype: 'audio/mpeg' }, { quoted: m })
            } else if (isVideo) {
                await conn.sendMessage(m.chat, { video: { url: media.link }, caption: `✅ *Video:* ${media.title}`, footer: "By Barboza-Team ⚡" }, { quoted: m })
            } else if (isDocMp3) {
                await conn.sendMessage(m.chat, { document: { url: media.link }, mimetype: 'audio/mpeg', fileName: `${media.title}.mp3` }, { quoted: m })
            } else if (isDocMp4) {
                await conn.sendMessage(m.chat, { document: { url: media.link }, mimetype: 'video/mp4', fileName: `${media.title}.mp4` }, { quoted: m })
            }
            
            if (m.react) await m.react('🔥')

        } catch (e) {
            console.error(e)
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 Error al descargar el archivo.`, m)
        }
        return 
    }

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
            { buttonId: `${usedPrefix}yta ${videoUrl}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${usedPrefix}ytv ${videoUrl}`, buttonText: { displayText: "🎥 Video" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp3doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP3" }, type: 1 },
            { buttonId: `${usedPrefix}ytmp4doc ${videoUrl}`, buttonText: { displayText: "📁 Documento MP4" }, type: 1 },
            { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
        ]

        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 👤 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}\n`
        info += `│ 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        info += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}\n`
        info += `│ 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${ago || 'Reciente'}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*Seleccione una opción para descargar:*`

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

handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
