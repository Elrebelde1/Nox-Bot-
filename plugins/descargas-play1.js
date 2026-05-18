/**
 * 📂 COMANDO: play / play2 / yta / ytv / ytmp3 / ytmp4 / ytmp3doc / ytmp4doc
 * 📝 DESCRIPCIÓN: Sistema interactivo puro con Scraper Local (yt-dlp) corregido y asíncrono.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * ¡Ahora los códigos son mejores!
 */

import { existsSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import yts from 'yt-search'
import YTDlpWrap from 'yt-dlp-wrap'

const ytDlpPath = './yt-dlp'
const cookiesPath = join(process.cwd(), 'youtube-cookies.txt')
let ytDlp = null

// Inicialización asíncrona segura del ejecutable
async function initYtdlp() {
  if (!existsSync(ytDlpPath)) {
    console.log("-> [Uchiha Bot]: Descargando binario yt-dlp indispensable...")
    try {
      await YTDlpWrap.downloadFromGithub(ytDlpPath)
      console.log("-> [Uchiha Bot]: Binario guardado con éxito.")
    } catch (err) {
      console.error("-> [Error Crítico]: No se pudo descargar yt-dlp desde GitHub:", err)
    }
  }
  ytDlp = new YTDlpWrap(ytDlpPath)
}
initYtdlp()

async function downloadWithScraper(url, output, isVideo = false) {
  return new Promise((resolve, reject) => {
    if (!ytDlp) return reject(new Error('El componente yt-dlp aún se está inicializando en el servidor. Reintenta en unos segundos.'))

    let args = [
      url,
      '--no-playlist',
      '--no-check-certificates',
      '--prefer-insecure',
      '-o',
      output
    ]

    if (existsSync(cookiesPath)) {
      args.push('--cookies', cookiesPath)
    }
    
    args.push('--extractor-args', 'youtube:player_client=android')

    if (isVideo) {
      args.push('-f', 'b[ext=mp4]/best[ext=mp4]/best')
    } else {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '128K')
    }

    ytDlp.exec(args)
    .on('close', () => {
      if (!existsSync(output)) {
        reject(new Error('El Scraper local no pudo generar el archivo multimedia.'))
      } else {
        resolve()
      }
    })
    .on('error', reject)
  })
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    // 1. SI NO HAY TEXTO (MENÚ INICIAL)
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

    // 2. LÓGICA DE PROCESAMIENTO NATIVA DEL SCRAPER
    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4|mp4)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo || isDocMp3 || isDocMp4) {
        if (m.react) await m.react('📥')

        let queryTarget = text.trim()
        let titulo = 'Multimedia'

        // Si pasan texto en vez de link directo a los botones de descarga, busca el link primero
        if (!queryTarget.includes('youtube.com') && !queryTarget.includes('youtu.be')) {
            try {
                const searchData = await yts(text)
                if (searchData.videos.length) {
                    queryTarget = searchData.videos[0].url
                    titulo = searchData.videos[0].title
                }
            } catch {}
        } else {
            try {
                const vInfo = await yts(queryTarget)
                if (vInfo.videos.length) titulo = vInfo.videos[0].title
            } catch {}
        }

        const needVideo = isVideo || isDocMp4
        const ext = needVideo ? 'mp4' : 'mp3'
        const tempFile = join(tmpdir(), `uchiha_scraper_${Date.now()}.${ext}`)

        try {
            await downloadWithScraper(queryTarget, tempFile, needVideo)

            if (!existsSync(tempFile)) throw new Error('Archivo temporal no encontrado o no generado.')
            const buffer = readFileSync(tempFile)

            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m })
            } else if (isVideo) {
                await conn.sendMessage(m.chat, { video: buffer, caption: `✅ *Video:* ${titulo}`, footer: "By Barboza-Team ⚡", mimetype: 'video/mp4' }, { quoted: m })
            } else if (isDocMp3) {
                await conn.sendMessage(m.chat, { document: buffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
            } else if (isDocMp4) {
                await conn.sendMessage(m.chat, { document: buffer, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
            }

            unlinkSync(tempFile)
            if (m.react) await m.react('🔥')

        } catch (e) {
            console.error("-> [Error Scraper Local]:", e)
            if (existsSync(tempFile)) unlinkSync(tempFile)
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 *Error en el Scraper local.*\n💬 *Detalle:* ${e.message || e}`, m)
        }
        return 
    }

    // 3. BUSCADOR PRINCIPAL (.PLAY / .PLAY2)
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
        console.error("-> [Error Buscador Scraper]:", e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
