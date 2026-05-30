import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = command.toLowerCase()

  if (!args[0]) return m.reply(`⚠️ *Formato incorrecto*\n\n📌 Uso: *${usedPrefix + command} on* o *${usedPrefix + command} off*`)

  let fail = false
  switch (type) {
    case 'welcome': case 'bienvenida':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
      chat.bienvenida = isEnable
      break
    case 'subbots': case 'serbot':
      if (!isROwner) { global.dfail('rowner', m, conn); fail = true; break }
      bot.jadibotmd = isEnable
      break
    case 'antispam':
      if (!isOwner) { global.dfail('owner', m, conn); fail = true; break }
      bot.antiSpam = isEnable
      break
    case 'antilink':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
      chat.antiLink = isEnable
      break
    case 'antibot':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
      chat.antiBot = isEnable
      break
    case 'modoadmin':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
      chat.modoadmin = isEnable
      break
    case 'nsfw': case 'antinopor':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
      chat.nsfw = isEnable
      break
    case 'audios':
      chat.audios = isEnable
      break
    case 'autoread': case 'autoleer':
      if (!isROwner) { global.dfail('rowner', m, conn); fail = true; break }
      global.opts['autoread'] = isEnable
      break
    case 'antiprivado':
      if (!isOwner) { global.dfail('owner', m, conn); fail = true; break }
      bot.antiPrivate = isEnable
      break
    default:
      return
  }

  if (fail) return

  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg
  if (existsSync(pathImg)) {
    catalogoImg = readFileSync(pathImg)
  } else {
    catalogoImg = { url: 'https://files.catbox.moe/t7uytz.png' }
  }

  let estadoTexto = isEnable ? 'Activado ✅' : 'Desactivado ❌'

  let statusTxt = `┏━━━━━━━━━━━━━━━━━━┓\n`
  statusTxt += `✨ *AJUSTE ACTUALIZADO* ✨\n`
  statusTxt += `┠━━━━━━━━━━━━━━━━━━┫\n`
  statusTxt += `⚙️ *Función:* ${type}\n`
  statusTxt += `📊 *Estado:* ${estadoTexto}\n`
  statusTxt += `┗━━━━━━━━━━━━━━━━━━┛`

  const botones = [
    { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url },
    caption: statusTxt,
    footer: "By Barboza-Team ⚡",
    buttons: botones,
    headerType: 4
  }, { quoted: m })
}

handler.help = ['welcome', 'antilink', 'antibot', 'modoadmin', 'subbots', 'nsfw', 'audios', 'antiprivado'].map(v => v + ' on/off')
handler.tags = ['config']
handler.command = ['welcome', 'bienvenida', 'subbots', 'serbot', 'antispam', 'antilink', 'antibot', 'modoadmin', 'nsfw', 'antinopor', 'audios', 'autoleer', 'autoread', 'antiprivado']

export default handler
