/**
 * 📂 COMANDO: play / play2 / yta / ytv / ytmp3 / ytmp4 / ytmp3doc / ytmp4doc
 * 📝 DESCRIPCIÓN: Sistema híbrido. Audio por Sylphyy API v2 y Video por Scraper Local (yt-dlp) con cookies.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * ¡Ahora los códigos son mejores!
 */

import fetch from "node-fetch"
import { existsSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import yts from 'yt-search'
import YTDlpWrapPackage from 'yt-dlp-wrap'

// Corrección para evitar el error "YTDlpWrap is not a constructor" en módulos ESM
const YTDlpWrap = YTDlpWrapPackage.default || YTDlpWrapPackage

const apiKey = 'sylphy-6f150d'
const ytDlpPath = './yt-dlp'
const cookiesPath = join(process.cwd(), 'youtube-cookies.txt')
let ytDlp = null

// Inicialización asíncrona segura del ejecutable local para videos
async function initYtdlp() {
  if (!existsSync(ytDlpPath)) {
    try {
      await YTDlpWrap.downloadFromGithub(ytDlpPath)
    } catch (err) {
      console.error("-> [Error binario]:", err)
    }
  }
  ytDlp = new YTDlpWrap(ytDlpPath)
}
initYtdlp()

// Función del Scraper local para procesar el Video sin fallar
async function downloadVideoWithScraper(url, output) {
  return new Promise((resolve, reject) => {
    if (!ytDlp) return reject(new Error('El componente de video se está inicializando. Reintenta en un momento.'))

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
    args.push('-f', 'b[ext=mp4]/best[ext=mp4]/best') // Formato directo compatible

    ytDlp.exec(args)
    .on('close', () => {
      if (!existsSync(output)) {
        reject(new Error('El Scraper local no pudo procesar el archivo de video.'))
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

    // 2. LÓGICA DE PROCESAMIENTO NATIVA
    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4|mp4)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    if (isAudio || isVideo || isDocMp3 || isDocMp4) {
        if (m.react) await m.react('📥')

        let queryTarget = text.trim()
        let titulo = 'Multimedia'

        // Convertir texto plano a enlace si es necesario
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

        // --- CASO A: AUDIOS (USANDO LA API V2 DE SYLPHYY) ---
        if (isAudio || isDocMp3) {
            try {
                let res = await fetch(`https://sylphyy.xyz/download/v2/ytmp3?url=${encodeURIComponent(queryTarget)}&api_key=${apiKey}`)
                let json = await res.json()

                if (json.status && json.result && json.result.dl_url) {
                    let dlUrl = json.result.dl_url
                    let audioTitle = json.result.title || titulo

                    if (isAudio) {
                        await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
                    } else {
                        await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${audioTitle}` }, { quoted: m })
                    }
                    if (m.react) await m.react('🔥')
                    return
                } else {
                    throw new Error('La API de Sylphyy falló con el audio.')
                }
            } catch (err) {
                console.error("-> [Fallo API Audio]:", err)
                if (m.react) await m.react('❌')
                return conn.reply(m.chat, `🛑 *Error en el servidor de audio.*\n💬 *Detalle:* ${err.message}`, m)
            }
        }

        // --- CASO B: VIDEOS (USANDO EL SCRAPER LOCAL CON COOKIES) ---
        if (isVideo || isDocMp4) {
            const tempFile = join(tmpdir(), `uchiha_video_${Date.now()}.mp4`)
            try {
                await downloadVideoWithScraper(queryTarget, tempFile)

                if (!existsSync(tempFile)) throw new Error('No se pudo generar el archivo de video local.')
                const buffer = readFileSync(tempFile)

                if (isVideo) {
                    await conn.sendMessage(m.chat, { video: buffer, caption: `✅ *Video:* ${titulo}`, footer: "By Barboza-Team ⚡", mimetype: 'video/mp4' }, { quoted: m })
                } else {
                    await conn.sendMessage(m.chat, { document: buffer, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
                }

                unlinkSync(tempFile)
                if (m.react) await m.react('🔥')
            } catch (err) {
                console.error("-> [Fallo Scraper Video]:", err)
                if (existsSync(tempFile)) unlinkSync(tempFile)
                if (m.react) await m.react('❌')
                return conn.reply(m.chat, `🛑 *Error local al procesar el video.*\n💬 *Detalle:* ${err.message}`, m)
            }
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
        console.error("-> [Error Buscador]:", e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
