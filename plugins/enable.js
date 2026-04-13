import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false

  const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
  let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

  switch (type) {
    case 'welcome':
    case 'bienvenida':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.bienvenida = isEnable
      break

    case 'antilag': // <--- Agregado
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.antiLag = isEnable
      break

    case 'subbots': // <--- Agregado
    case 'serbot':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      bot.jadibotmd = isEnable
      break

    case 'antispam': // <--- Agregado
      isAll = true
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiSpam = isEnable
      break

    case 'antinopor': // <--- Agregado
    case 'antinonopor':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.antiLinkxxx = isEnable
      break

    case 'detect':
    case 'avisos':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.detect = isEnable
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

    case 'antiarabes':
    case 'antifakes':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.onlyLatinos = isEnable
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
      isAll = true
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiPrivate = isEnable
      break

    case 'restrict':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      bot.restrict = isEnable
      break

    case 'autoread':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['autoread'] = isEnable
      break

    default:
      if (!/[01]/.test(command)) {
        let txt = `┏━━━━━━━━━━━━━━━━━━━━━┓\n┃ ⚙️ *INTERFACE DE AJUSTES* ⚙️\n┗━━━━━━━━━━━━━━━━━━━━━┃\n┃ 🟢 *Usar:* ${usedPrefix + command} <opción>\n┃ 💡 *Ejemplo:* ${usedPrefix}on antilag\n┃━━━━━━━━━━━━━━━━━━━━━┃\n┃ 🛡️ *SEGURIDAD*\n┃ ◦ _welcome_\n┃ ◦ _antilink_\n┃ ◦ _antibot_\n┃ ◦ _antilag_ ⚡\n┃ ◦ _antiestados_\n┃ ◦ _antiarabes_\n┃\n┃ 🔞 *CONTENIDO*\n┃ ◦ _nsfw_\n┃ ◦ _antinopor_\n┃ ◦ _audios_\n┃ ◦ _modoadmin_\n┃\n┃ 💻 *SISTEMA*\n┃ ◦ _subbots_ 🤖\n┃ ◦ _antispam_\n┃ ◦ _autoread_\n┃ ◦ _antiprivado_\n┗━━━━━━━━━━━━━━━━━━━━━┛`

        return conn.sendMessage(m.chat, {
          text: txt,
          contextInfo: {
            externalAdReply: {
              title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Cᴏɴғɪɢ',
              body: 'Panel de Control Actualizado',
              thumbnail: catalogoImg,
              mediaType: 1,
              showAdAttribution: true
            }
          }
        }, { quoted: m })
      }
      throw false
  }

  let statusTxt = `┏━━━━━━━━━━━━━━━━━━━━━┓\n┃ ✨ *AJUSTE ACTUALIZADO* ✨\n┃━━━━━━━━━━━━━━━━━━━━━┃\n┃ ⚙️ *Opción:* ${type}\n┃ 📊 *Estado:* ${isEnable ? 'Activado ✅' : 'Desactivado ❌'}\n┃ 📍 *Ámbito:* ${isAll ? 'Global 🌐' : 'Chat Actual 💬'}\n┗━━━━━━━━━━━━━━━━━━━━━┛`

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

handler.help = ['on', 'off'].map(v => v + ' <opción>')
handler.tags = ['config']
handler.command = /^(on|off|enable|disable)$/i

export default handler
