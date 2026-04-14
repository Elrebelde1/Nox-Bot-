import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()
  
  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

  // Validación de argumento on/off
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
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
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
      chat.antiBot = isEnable;
      break;

    case 'modoadmin':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.modoadmin = isEnable;
      break;

    case 'nsfw':
    case 'antinopor':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.nsfw = isEnable
      break

    case 'antiestados':
      chat.antiViewOnce = isEnable;
      break;

    case 'detect':
    case 'avisos':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.detect = isEnable
      break

    case 'audios':
      chat.audios = isEnable
      break

    case 'antiprivado':
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiPrivate = isEnable;
      break;

    case 'autoleer':
    case 'autoread':
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['autoread'] = isEnable
      break

    default:
      return
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

// Lista manual de ayuda tal cual tu captura
handler.help = [
  'welcome on/off',
  'antilag on/off',
  'antilink on/off',
  'antibot on/off',
  'modoadmin on/off',
  'subbots on/off'
]

handler.tags = ['config']

// Comandos individuales uno tras otro
handler.command = /^(welcome|bienvenida|antilag|subbots|serbot|antispam|antilink|antibot|modoadmin|antiestados|nsfw|antinopor|audios|detect|antiprivado|autoread)$/i

export default handler
