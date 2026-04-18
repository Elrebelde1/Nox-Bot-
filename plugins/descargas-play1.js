import { readFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { scraper } from '../lib/scraper.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const botonesCanal = [
    { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: '📢 Ver Canales' }, type: 1 }
  ]

  if (!text.trim()) {
    const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
    let catalogoImg = existsSync(pathImg)
      ? readFileSync(pathImg)
      : { url: 'https://files.catbox.moe/t7uytz.png' }

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
      footer: 'By Barboza-Team ⚡',
      buttons: botonesCanal,
      headerType: 4
    }, { quoted: m })
  }

  try {
    if (m.react) await m.react('⏳')

    const isAudio = /play$|yta|ytmp3|playaudio/.test(command)

    const result = await scraper(text, isAudio)
    if (!result) {
      if (m.react) await m.react('❌')
      return conn.reply(m.chat, '❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs.', m)
    }

    const { title, path, thumbnail, timestamp } = result

    let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
    info += `│\n`
    info += `│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n`
    info += `│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n`
    info += `│ 📡 *sᴇʀᴠɪᴅᴏʀ:* Scraper Local\n`
    info += `│\n`
    info += `│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n`
    info += `╰────────────────────────────╯`

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: info,
      footer: 'By Barboza-Team ⚡',
      buttons: botonesCanal,
      headerType: 4
    }, { quoted: m })

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
        footer: 'By Barboza-Team ⚡',
        buttons: botonesCanal,
        headerType: 4
      }, { quoted: m })
    }

    try {
      unlinkSync(path)
    } catch {}

    if (m.react) await m.react('✅')
  } catch (e) {
    console.error(e)
    if (m.react) await m.react('❌')
    await conn.reply(m.chat, '🛑 ᴇʀʀᴏʀ ᴀʟ ᴘʀᴏᴄᴇsᴀʀ ᴇʟ ᴠɪᴅᴇᴏ.', m)
  }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|playaudio|mp4|ytmp4)$/i
export default handler