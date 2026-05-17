/**
 * 📂 COMANDO: play / play2 / ytmp3 / ytmp4
 * 📝 DESCRIPCIÓN: Descarga música y video de YouTube usando la API de Sylphyy libre de baneos.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * ¡Ahora los códigos son mejores!
 */

import yts from 'yt-search'
import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    let textIntro = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚈𝙾𝚄𝚃𝚄𝙱𝙴* ♆ 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [nombre o link]\n│\n│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n╰────────────────────────────╯`
    return conn.reply(m.chat, textIntro, m)
  }

  const isPlay = /^(play|play2)$/i.test(command)
  const isVideo = /^(ytmp4|mp4)$/i.test(command)
  const query = args.join(' ')

  try {
    await m.react('🔍')

    // Buscador integrado nativo usando yt-search
    const search = await yts(query)
    if (!search.videos.length) {
      await m.react('❌')
      throw new Error('No se encontraron resultados.')
    }

    const video = search.videos[0]
    const url = video.url

    // Si ejecutan .play o .play2, envía primero la portada de Uchiha con la info
    if (isPlay) {
      let ui = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝙰 𝖯𝖫𝙰𝖸* 🎵\n` +
               `|═══════════════════\n` +
               `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${video.title}\n` +
               `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${video.timestamp}\n` +
               `| 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* ✅ Sylphyy API Activa\n` +
               `|═══════════════════\n` +
               `| 🛠️ *⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓*\n` +
               `| ⛩️ *⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕*`

      try {
        await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: ui }, { quoted: m })
      } catch {
        await conn.reply(m.chat, ui, m)
      }
    }

    await m.react('⏳')

    // Petición al endpoint de descargas de la API de Sylphyy
    const type = isVideo ? 'mp4' : 'mp3'
    const res = await fetch(`https://api.sylphyy.xyz/api/v1/download/youtube?url=${encodeURIComponent(url)}&type=${type}`)
    const json = await res.json()

    // Validación según la estructura de respuesta de Sylphyy API
    if (!json.status || !json.result || !json.result.download) {
      throw new Error('La API de Sylphyy no pudo procesar la solicitud en este momento.')
    }

    const downloadUrl = json.result.download
    const mediaBuffer = await fetch(downloadUrl).then(r => r.buffer())

    if (isVideo) {
      // Envío de Video (.ytmp4 / .mp4)
      await conn.sendMessage(
        m.chat,
        {
          video: mediaBuffer,
          caption: `✅ *Video:* ${video.title}\n\n🛠️ By Barboza Uchiha ⚡`,
          mimetype: 'video/mp4'
        },
        { quoted: m }
      )
    } else {
      // Envío de Audio (.play / .play2 / .ytmp3)
      if (!isPlay) {
        let infoAudio = `🎧 *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝚄𝙳𝙸𝙾 𝙿𝙻𝙰𝚈𝙴𝚁*\n` +
                        `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n\n` +
                        `📌 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${video.title}\n` +
                        `📦 *𝙵𝙾𝚁𝙼𝙰𝚃𝙾:* MP3\n` +
                        `✅ *𝙴𝚂𝚃𝙰𝙳𝙾:* Enviando...\n\n` +
                        `─━━━━━━⊱ 🪐 ⊰━━━━━━─\n` +
                        `🛠️ 𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑼𝒄𝚑𝒊𝒉𝒂 ⚡\n` +
                        `📡 𝒁𝒐𝚗𝒂 𝑫𝒆𝒗𝒔 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍`
        await conn.reply(m.chat, infoAudio, m)
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: mediaBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`,
          ptt: false
        },
        { quoted: m }
      )
    }

    await m.react('🔥')

  } catch (e) {
    console.error("-> [Error en Uchiha Sylphyy Downloader]:", e)
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
