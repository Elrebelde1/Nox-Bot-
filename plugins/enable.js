import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()

  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

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
      break

    case 'subbots':
    case 'serbot':
      if (!isROwner) return global.dfail('rowner', m, conn)
      bot.jadibotmd = isEnable 
      break

    case 'antispam':
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiSpam = isEnable
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

    case 'antiestados':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiestados = isEnable
      break

    case 'nsfw':
    case 'antinopor':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.nsfw = isEnable
      break

    case 'audios':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.audios = isEnable
      break

    case 'detect':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.detect = isEnable
      break

    case 'antiprivado':
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiPrivate = isEnable
      break

    case 'autoread':
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['autoread'] = isEnable
      break

    default:
      return
  }

  let statusTxt = `┏━━━━━━━━━━━━━━━━━━━━━┓\n┃ ✨ *AJUSTE ACTUALIZADO* ✨\n┃━━━━━━━━━━━━━━━━━━━━━┃\n┃ ⚙️ *Función:* ${type}\n┃ 📊 *Estado:* ${isEnable ? 'Activado ✅' : 'Desactivado ❌'}\n┃ 🌎 *Ámbito:* ${['antilag', 'subbots', 'serbot', 'antispam', 'antiprivado'].includes(type) ? 'Global (Todo el Bot)' : 'Local (Este Chat)'}\n┗━━━━━━━━━━━━━━━━━━━━━┛`

  await conn.sendMessage(m.chat, {
    text: statusTxt,
    contextInfo: {
      externalAdReply: {
        title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Uᴘᴅᴀᴛᴇ',
        thumbnail: catalogoImg,
        mediaType: 1
      }
    }
  }, { quoted: m })
}

handler.help = ['welcome on/off', 'antilag on/off', 'antilink on/off', 'antibot on/off', 'modoadmin on/off', 'subbots on/off']
handler.tags = ['config']
handler.command = /^(welcome|bienvenida|antilag|subbots|serbot|antispam|antilink|antibot|modoadmin|antiestados|nsfw|antinopor|audios|detect|antiprivado|autoread)$/i

export default handler
