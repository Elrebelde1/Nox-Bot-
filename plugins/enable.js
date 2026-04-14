import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false

  // Imagen de catálogo de Barboza
  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

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
      if (!/[01]/.test(command)) return m.reply(`
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ *ＢＡＲＢＯＺＡ ＢＯＴ* ✨
┃━━━━━━━━━━━━━━━━━━━━━┃
┃ ⚙️ *PANEL DE CONFIGURACIÓN*
┃
┃ ➤ *welcome*
┃ ➤ *antilag*
┃ ➤ *antilink*
┃ ➤ *antispam*
┃ ➤ *antibot*
┃ ➤ *modoadmin*
┃ ➤ *nsfw*
┃ ➤ *audios*
┃ ➤ *antiprivado*
┃ ➤ *subbots*
┃
┃ 💡 *Uso:* \`${usedPrefix + command} [función]\`
┗━━━━━━━━━━━━━━━━━━━━━┛`.trim())
      throw false
  }

  // Guardar configuración
  global.db.data.settings[conn.user.jid] = bot

  let statusIcon = isEnable ? '『 ACTIVADO ✅ 』' : '『 DESACTIVADO ❌ 』'
  let scopeTxt = isAll ? '🌐 Global' : isUser ? '👤 Usuario' : '🏘️ Chat Actual'

  let statusTxt = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ *ＢＡＲＢＯＺＡ ＢＯＴ* ✨
┃━━━━━━━━━━━━━━━━━━━━━┃
┃ ⚙️ *AJUSTE ACTUALIZADO*
┃
┃ ➤ *MÓDULO:* \`${type}\`
┃ ➤ *ESTADO:* ${statusIcon}
┃ ➤ *ÁMBITO:* ${scopeTxt}
┗━━━━━━━━━━━━━━━━━━━━━┛`.trim()

  await conn.sendMessage(m.chat, {
    text: statusTxt,
    contextInfo: {
      externalAdReply: {
        title: 'Bᴀʀʙᴏᴢᴀ ─ Sʏsᴛᴇᴍ',
        body: 'Control de Sasuke Bot',
        thumbnail: catalogoImg,
        mediaType: 1,
        showAdAttribution: true
      }
    }
  }, { quoted: m })
}

handler.help = ['on', 'off']
handler.tags = ['config']
handler.command = /^(on|off|enable|disable|1|0)$/i

export default handler
