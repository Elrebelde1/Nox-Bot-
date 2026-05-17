/**
 * 📂 COMANDO: play / play2 / ytmp3 / ytmp4
 * 📝 DESCRIPCIÓN: Descarga música y video de YouTube usando el extractor de Android contra bloqueos.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * ⚠️ IMPORTANTE: Funciona con yt-dlp y yt-search de la base.
 * ¡Ahora los códigos son mejores!
 */

import { existsSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import yts from 'yt-search'
import YTDlpWrap from 'yt-dlp-wrap'

const ytDlpPath = './yt-dlp'

if (!existsSync(ytDlpPath)) {
  YTDlpWrap.downloadFromGithub(ytDlpPath).catch(() => {})
}

const ytDlp = new YTDlpWrap(ytDlpPath)

// Función unificada para descargar Audio o Video
async function downloadMedia(url, output, isVideo = false) {
  return new Promise((resolve, reject) => {
    let args = [
      url,
      '--no-playlist',
      '--no-check-certificates',
      '--prefer-insecure',
      '--extractor-args',
      'youtube:player_client=android',
      '-o',
      output
    ]

    if (isVideo) {
      args.push('-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]')
    } else {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '128K')
    }

    ytDlp.exec(args)
    .on('close', () => {
      if (!existsSync(output)) {
        reject(new Error('No se pudo generar el archivo multimedia.'))
      } else {
        resolve()
      }
    })
    .on('error', reject)
  })
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    // Imagen corregida y funcional para el menú interactivo del comando vacío
    let menuImg = 'https://files.catbox.moe/gcl8y0.jpg'
    let textIntro = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
    
    try {
      return await conn.sendMessage(m.chat, { image: { url: menuImg }, caption: textIntro }, { quoted: m })
    } catch {
      return conn.reply(m.chat, textIntro, m)
    }
  }

  const isPlay = /^(play|play2)$/i.test(command)
  const isVideo = /^(ytmp4|mp4)$/i.test(command)
  
  const query = args.join(' ')
  const ext = isVideo ? 'mp4' : 'mp3'
  const tempFile = join(tmpdir(), `uchiha_${Date.now()}.${ext}`)

  try {
    await m.react('🔍')

    const search = await yts(query)

    if (!search.videos.length) {
      await m.react('❌')
      throw new Error('No se encontraron resultados.')
    }

    const video = search.videos[0]

    // Si es .play o .play2, manda primero la carátula con la info
    if (isPlay) {
      let ui = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝙰 𝖯𝖫𝙰𝖸* 🎵\n` +
               `|═══════════════════\n` +
               `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${video.title}\n` +
               `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${video.timestamp}\n` +
               `| 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* ✅ Scraper Android Activo\n` +
               `|═══════════════════\n` +
               `| 🛠️ *⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓*\n` +
               `| ⛩️ *⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕*`

      try {
        await conn.sendMessage(
          m.chat,
          { image: { url: video.thumbnail }, caption: ui },
          { quoted: m }
        )
      } catch {
        // Anticaídas por si falla el fetch de la miniatura de YouTube
        await conn.reply(m.chat, ui, m)
      }
    }

    await m.react('⏳')

    // Llama al descargador dependiendo de si el comando pide video o audio
    await downloadMedia(video.url, tempFile, isVideo)

    if (existsSync(tempFile)) {
      const buffer = readFileSync(tempFile)
      
      if (isVideo) {
        // Enviar Video
        await conn.sendMessage(
          m.chat,
          {
            video: buffer,
            caption: `✅ *Video:* ${video.title}\n\n🛠️ By Barboza Uchiha ⚡`,
            mimetype: 'video/mp4'
          },
          { quoted: m }
        )
      } else {
        // Enviar Audio
        if (!isPlay) {
          let infoAudio = `🎧 *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝚄𝙳𝙸𝙾 𝙿𝙻𝙰𝚈𝙴𝚁*\n` +
                          `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n\n` +
                          `📌 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${video.title}\n` +
                          `📦 *𝙵𝙾𝚁𝙼𝙰𝚃𝙾:* MP3\n` +
                          `✅ *𝙴𝚂𝚃𝙰𝙳𝙾:* Enviando...\n\n` +
                          `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n` +
                          `🛠️ 𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ⚡\n` +
                          `📡 𝒁𝒐𝒏𝒂 𝑫𝒆𝒗𝒔 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍`
          await conn.reply(m.chat, infoAudio, m)
        }
        
        await conn.sendMessage(
          m.chat,
          {
            audio: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false
          },
          { quoted: m }
        )
      }
      
      unlinkSync(tempFile)
    }

    await m.react('🔥')

  } catch (e) {
    if (existsSync(tempFile)) {
      unlinkSync(tempFile)
    }

    console.error("-> [Error en Uchiha Downloader]:", e)
    await m.react('❌')

    return conn.reply(
      m.chat,
      `🛑 *Error al procesar la descarga.*\n\n💬 *Detalle:* ${e.message || e}`,
      m
    )
  }
}

handler.help = ['play', 'play2', 'ytmp3', 'ytmp4']
handler.tags = ['descargas']
handler.command = /^(play|play2|ytmp3|ytmp4|mp4)$/i

export default handler
