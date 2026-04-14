import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let type = command.toLowerCase()
  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let isAll = false, isUser = false

  // Imagen de catálogo de Sasuke Bot
  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

  // Validar que se pase on/off
  if (!args[0] || !/on|off|enable|disable|1|0/i.test(args[0])) {
    throw `⚠️ *Formato incorrecto*\n\n📌 Uso: *${usedPrefix + command} on* o *${usedPrefix + command} off*`
  }

  switch (type) {
    case 'welcome':
    case 'bienvenida':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.bienvenida = isEnable
      break

    case 'antilag':
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiLag = isEnable 
      isAll = true
      break

    case 'antispam':
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiSpam = isEnable
      isAll = true
      break

    case 'autoread':
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['autoread'] = isEnable
      isAll = true
      break

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiLink = isEnable
      break

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiBot = isEnable
      break

    case 'modoadmin':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.modoadmin = isEnable
      break

    case 'nsfw':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.nsfw = isEnable
      break

    case 'audios':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.audios = isEnable
      break

    case 'antiprivado':
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiPrivate = isEnable
      isAll = true
      break

    case 'serbot':
    case 'subbots':
      if (!isROwner) return global.dfail('rowner', m, conn)
      bot.jadibotmd = isEnable
      isAll = true
      break

    default:
      return
  }

  // Guardar en la base de datos
  global.db.data.settings[conn.user.jid] = bot

  let statusIcon = isEnable ? '✅ *Activado*' : '❌ *Desactivado*'
  let scopeTxt = isAll ? '🌐 Global' : isUser ? '👤 Usuario' : '🏘️ Chat Actual'

  let statusTxt = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ *ＳＡＳＵＫＥ ＢＯＴ* ✨
┃━━━━━━━━━━━━━━━━━━━━━┃
┃ ⚙️ *AJUSTE ACTUALIZADO*
┃
┃ ➤ *FUNCIÓN:* ${type}
┃ ➤ *ESTADO:* ${statusIcon}
┃ ➤ *ÁMBITO:* ${scopeTxt}
┗━━━━━━━━━━━━━━━━━━━━━┛`.trim()

  await conn.sendMessage(m.chat, {
    text: statusTxt,
    contextInfo: {
      externalAdReply: {
        title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Uᴘᴅᴀᴛᴇ',
        body: 'Control de Sistema',
        thumbnail: catalogoImg,
        mediaType: 1,
        showAdAttribution: true
      }
    }
  }, { quoted: m })
}

handler.help = ['antilag on/off', 'welcome on/off', 'nsfw on/off']
handler.tags = ['config']
handler.command = /^(welcome|bienvenida|antilag|antispam|antilink|antibot|modoadmin|nsfw|audios|antiprivado|serbot|subbots|autoread)$/i

export default handler
