/**
 * 📂 COMANDO: Uchiha Sticker Engine (Multiformatos)
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false

  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
        return m.reply(`⚡ *ʟɪᴍɪᴛᴇ ᴇxᴄᴇᴅɪᴅᴏ...*\n\nɴᴏ ᴛᴇɴɢᴏ ᴛɪᴇᴍᴘᴏ ᴘᴀʀᴀ ᴠɪᴅᴇᴏs ʟᴀʀɢᴏs. ᴍᴀxɪᴍᴏ 15 sᴇɢᴜɴᴅᴏs.`)
      }

      let img = await q.download?.()
      if (!img) throw 'ᴇʀʀᴏʀ ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ ᴍᴇᴅɪᴀ'

      let userId = m.sender
      let packstickers = global.db.data.users[userId] || {}
      let texto1 = packstickers.text1 || global.packsticker
      let texto2 = packstickers.text2 || global.packsticker2

      // --- LÓGICA DE FORMATOS (CROP) ---
      let filter = ''
      if (command.includes('1:1')) filter = `crop=w='min(iw,ih)':h='min(iw,ih)'`
      if (command.includes('4:3')) filter = `crop=w='min(iw,ih*4/3)':h='min(ih,iw*3/4)'`
      if (command.includes('16:9')) filter = `crop=w='min(iw,ih*16/9)':h='min(ih,iw*9/16)'`

      // Intentar crear sticker con el filtro
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
      conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    } else {
      let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁* ♆ 〕─╮\n`
      txt += `│\n`
      txt += `│ 💠 *ғᴏʀᴍᴀᴛᴏs ᴅɪsᴘᴏɴɪʙʟᴇs:* \n`
      txt += `│ » ${usedPrefix}s1:1 (Cuadrado)\n`
      txt += `│ » ${usedPrefix}s4:3 (Estándar)\n`
      txt += `│ » ${usedPrefix}s16:9 (Alargado)\n`
      txt += `│\n`
      txt += `│ 👁️ *ᴇɴᴠɪᴀ ᴜɴᴀ ɪᴍᴀɢᴇɴ ᴏ ᴠɪᴅᴇᴏ* \n`
      txt += `│ ⏳ *ᴛɪᴇᴍᴘᴏ ʟɪᴍɪᴛᴇ:* 15s\n`
      txt += `│\n`
      txt += `│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n`
      txt += `╰────────────────────────────╯`

      const botones = [
        { buttonId: `${usedPrefix}s1:1`, buttonText: { displayText: "📐 Formato 1:1" }, type: 1 },
        { buttonId: `${usedPrefix}s16:9`, buttonText: { displayText: "📐 Formato 16:9" }, type: 1 },
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
      ]

      await conn.sendMessage(m.chat, {
        image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url },
        caption: txt,
        footer: "By Barboza-Team ⚡",
        buttons: botones,
        headerType: 4
      }, { quoted: m })
    }
  }
}

handler.help = ['stiker', 's1:1', 's16:9']
handler.tags = ['sticker']
// Registramos los comandos de formato para que el handler los reconozca
handler.command = /^(s|sticker|stiker|s1:1|s4:3|s16:9)$/i
export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
