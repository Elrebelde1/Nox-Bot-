import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  // Si no hay argumentos, no hacemos nada para evitar spam, o puedes mostrar el menú
  if (!args[0]) return m.reply(`⚠️ *Uso correcto:* ${usedPrefix + command} on/off`)

  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()
  
  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

  switch (type) {
    case 'welcome':
    case 'bienvenida':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.bienvenida = isEnable
      break

    case 'antilag':
      chat.antiLag = isEnable
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

    case 'nsfw':
    case 'antinopor':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.nsfw = isEnable
      break

    case 'audios':
      chat.audios = isEnable
      break

    case 'autoleer':
    case 'autoread':
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['autoread'] = isEnable
      break

    default:
      return // Si no coincide con ninguno, sale sin error
  }

  let statusTxt = `
┏━━━━━━━━━━━━━━━━━━┓
✨ *AJUSTE ACTUALIZADO* ✨
┠━━━━━━━━━━━━━━━━━━┫
⚙️ *Función:* ${type}
📊 *Estado:* ${isEnable ? 'Activado ✅' : 'Desactivado ❌'}
┗━━━━━━━━━━━━━━━━━━┛`.trim()

  await conn.sendMessage(m.chat, {
    text: statusTxt,
    contextInfo: {
      externalAdReply: {
        title: 'SASUKE BOT — CONFIG',
        body: 'Panel de Control Actualizado',
        thumbnail: catalogoImg,
        mediaType: 1,
        showAdAttribution: true
      }
    }
  }, { quoted: m })
}

handler.help = ['welcome on/off', 'antilag on/off', 'antilink on/off', 'antibot on/off', 'modoadmin on/off', 'subbots on/off']
handler.tags = ['config']

// Esta es la parte clave: debe reconocer cada palabra como un comando individual
handler.command = /^(welcome|bienvenida|antilag|subbots|serbot|antispam|antilink|antibot|modoadmin|nsfw|antinopor|audios|autoleer|autoread)$/i

export default handler
