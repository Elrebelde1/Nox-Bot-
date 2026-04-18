import fetch from "node-fetch"
import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'
import { readFileSync, existsSync, createWriteStream, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// --- FUNCIÓN SCRAPER (Integrada) ---
async function ytScraper(query, isAudio = true) {
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return null;

    const path = join(tmpdir(), `${video.videoId}.${isAudio ? 'mp3' : 'mp4'}`);
    const stream = ytdl(video.url, { 
        filter: isAudio ? 'audioonly' : 'audioandvideo',
        quality: isAudio ? 'highestaudio' : 'highest',
        // Optimización para evitar bloqueos
        requestOptions: {
            headers: {
                cookie: 'TU_COOKIE_AQUI' // Opcional: ayuda si YouTube bloquea la IP
            }
        }
    });

    return new Promise((resolve, reject) => {
        const file = createWriteStream(path);
        stream.pipe(file);
        file.on('finish', () => resolve({ 
            title: video.title, 
            path, 
            thumbnail: video.thumbnail, 
            timestamp: video.timestamp,
            url: video.url 
        }));
        file.on('error', (err) => {
            if (existsSync(path)) unlinkSync(path);
            reject(err);
        });
    });
}

// --- HANDLER PRINCIPAL ---
const handler = async (m, { conn, text, usedPrefix, command }) => {
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

        let txt = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
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

    try {
        if (m.react) await m.react('⏳')

        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        
        // Llamada al Scraper
        const result = await ytScraper(text, isAudio)

        if (!result) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs.', m)
        }

        const { title, thumbnail, timestamp, path } = result

        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
        info += `│\n`
        info += `│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n`
        info += `│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n`
        info += `│ 📡 *sᴇʀᴠɪᴅᴏʀ:* Local Scraper 🛠️\n`
        info += `│\n`
        info += `│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n`
        info += `╰────────────────────────────╯`

        // Enviar Miniatura e Info
        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info,
            footer: "By Barboza-Team ⚡",
            buttons: botonesCanal,
            headerType: 4
        }, { quoted: m })

        // Enviar Archivo Descargado
        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: readFileSync(path), 
                mimetype: 'audio/mpeg', 
                fileName: `${title}.mp3` 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: readFileSync(path), 
                mimetype: 'video/mp4', 
                caption: `✅ *ʀᴇᴘʀᴏᴅᴜᴄᴄɪᴏ́ɴ ʟɪsᴛᴀ*\n🎬 ${title}`,
                footer: "By Barboza-Team ⚡"
            }, { quoted: m })
        }

        // Limpiar archivo temporal para no llenar el VPS/Hosting
        if (existsSync(path)) unlinkSync(path)
        
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, `🛑 ᴇʀʀᴏʀ ɪɴᴛᴇʀɴᴏ: ${e.message}`, m)
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|playaudio|mp4|ytmp4)$/i
export default handler
