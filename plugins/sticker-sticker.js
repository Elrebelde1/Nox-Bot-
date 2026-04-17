import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false

  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg
  if (existsSync(pathImg)) {
    catalogoImg = readFileSync(pathImg)
  } else {
    catalogoImg = { url: 'https://files.catbox.moe/t7uytz.png' }
  }

  // --- FUNCIÓN PARA ENVIAR LOS CANALES ---
  // Se activa si el usuario escribe o presiona el botón que mande "ver_canales"
  if (m.text === 'ver_canales') {
    let txtCanales = `✨ *¡Hola! Me harías muy feliz si sigues nuestros canales oficiales.* 👤⚡\n\n`
    txtCanales += `📢 *Canal 1:* https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I\n\n`
    txtCanales += `🚀 *Canal 2:* https://whatsapp.com/channel/0029VbBbaFCAO7RL7UEhBD2F\n\n`
    txtCanales += `*By Barboza-Team* ⚡`
    return await conn.reply(m.chat, txtCanales, m)
  }

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

      stiker = await sticker(img, false, texto1, texto2)

      if (!stiker) {
        let out
        if (/webp/g.test(mime)) out = await webp2png(img)
        else if (/image/g.test(mime)) out = await uploadImage(img)
        else if (/video/g.test(mime)) out = await uploadFile(img)
        if (typeof out !== 'string') out = await uploadImage(img)
        stiker = await sticker(false, out, global.packsticker, global.packsticker2)
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
      let txt = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ sᴛɪᴄᴋᴇʀ* ♆ 〕─╮\n`
      txt += `│\n`
      txt += `│ 👁️ *ᴇɴᴠɪᴀ ᴜɴᴀ ɪᴍᴀɢᴇɴ ᴏ ᴠɪᴅᴇᴏ* \n`
      txt += `│      ᴘᴀʀᴀ ᴍᴏsᴛʀᴀʀ ᴛᴜ ᴘᴏᴅᴇʀ.\n`
      txt += `│\n`
      txt += `│ ⏳ *ᴛɪᴇᴍᴘᴏ ʟɪᴍɪᴛᴇ:* 15s\n`
      txt += `│\n`
      txt += `│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n`
      txt += `╰────────────────────────────╯`

      // --- BOTÓN QUE MANDA EL MENSAJE DE CANALES ---
      const botones = [
        { buttonId: `ver_canales`, buttonText: { displayText: "📢 Sigue mis Canales" }, type: 1 }
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

handler.help = ['stiker <img>', 'sticker <url>']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker', 'ver_canales'] // Añadimos 'ver_canales' a los comandos permitidos

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
