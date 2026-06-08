import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''

  let ratio = args[0] || ''
  let filter = ''

  if (ratio === '1:1') {
    filter = `crop=w='min(iw,ih)':h='min(iw,ih)'`
  } else if (ratio === '16:9') {
    filter = `crop=w='min(iw,ih*16/9)':h='min(ih,iw*9/16)'`
  } else if (ratio === '4:3') {
    filter = `crop=w='min(iw,ih*4/3)':h='min(ih,iw*3/4)'`
  } else if (ratio === '3:2') {
    filter = `crop=w='min(iw,ih*3/2)':h='min(ih,iw*2/3)'`
  } else if (ratio === '2:3') {
    filter = `crop=w='min(iw,ih*2/3)':h='min(ih,iw*3/2)'`
  } else if (ratio === 'circle') {
    filter = `format=yuva444p,geq=lum='p(x,y)':a='if(gt(hypot(x-w/2,y-h/2),min(w,h)/2),0,255)'`
  }

  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

  try {
    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
        return m.reply(`⚡ *ʟɪᴍɪᴛᴇ ᴇxᴄᴇᴅɪᴅᴏ...*\n\nᴍᴀxɪᴍᴏ 15 sᴇɢᴜɴᴅᴏs.`)
      }

      let img = await q.download?.()
      if (!img) throw 'ᴇʀʀᴏʀ ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ ᴍᴇᴅɪᴀ'

      let userId = m.sender
      let packstickers = global.db.data.users[userId] || {}
      let texto1 = packstickers.text1 || global.packsticker
      let texto2 = packstickers.text2 || global.packsticker2

      stiker = await sticker(img, false, texto1, texto2, filter)

      if (!stiker) {
        let out
        if (/webp/g.test(mime)) out = await webp2png(img)
        else if (/image/g.test(mime)) out = await uploadImage(img)
        else if (/video/g.test(mime)) out = await uploadFile(img)
        if (typeof out !== 'string') out = await uploadImage(img)
        stiker = await sticker(false, out, texto1, texto2, filter)
      }
    } else if (args[0] && isUrl(args[0])) {
      stiker = await sticker(false, args[0], global.packsticker, global.packsticker2)
    }
  } catch (e) {
    console.error(e)
  } finally {
    if (stiker) {
      await conn.sendMessage(m.chat, { 
        sticker: stiker 
      }, { 
        quoted: m,
        contextInfo: {
          externalAdReply: {
            title: "Uchiha Bot",
            body: "✅ sticker creado con exito",
            previewType: "PHOTO",
            thumbnailUrl: "https://files.catbox.moe/t7uytz.png",
            sourceUrl: "https://whatsapp.com"
          }
        }
      })
    } else {
      const botones = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
      ]

      await conn.sendMessage(m.chat, {
        image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url },
        caption: `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁* ♆ 〕─╮\n│\n│ 💠 *ғᴏʀᴍᴀᴛᴏs ᴅɪsᴘᴏɴɪʙʟᴇs:* \n│ » ${usedPrefix + command} 1:1 (Cuadrado)\n│ » ${usedPrefix + command} 16:9 (Panorámico)\n│ » ${usedPrefix + command} 4:3 (Estándar TV)\n│ » ${usedPrefix + command} 3:2 (Foto Horizontal)\n│ » ${usedPrefix + command} 2:3 (Foto Vertical)\n│ » ${usedPrefix + command} circle (Círculo)\n│\n│ 👁️ *ᴇɴᴠɪᴀ ᴏ ʀᴇᴘᴏɴᴅᴇ ᴀ ᴜɴᴀ ɪᴍᴀɢᴇɴ*\n│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n╰────────────────────────────╯`,
        footer: "By Barboza-Team ⚡",
        buttons: botones,
        headerType: 4
      }, { quoted: m })
    }
  }
}

handler.help = ['s <formato>']
handler.tags = ['sticker']
handler.command = /^(s|sticker|stiker)$/i

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
