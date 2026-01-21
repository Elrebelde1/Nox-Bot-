let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command);
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};
  let type = (args[0] || '').toLowerCase();
  let isAll = false, isUser = false;

  switch (type) {
    case 'welcome':
    case 'bv':
    case 'bienvenida':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      if (!m.isGroup && !isOwner) return global.dfail('owner', m, conn)
      chat.bienvenida = isEnable;
      break;

    case 'antiprivado2':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.antiPrivate2 = isEnable;
      break;

    case 'antilag':
      chat.antiLag = isEnable;
      break;

    case 'autoread':
    case 'autoleer':
      isAll = true;
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['autoread'] = isEnable;
      break;

    case 'antispam':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiSpam = isEnable;
      break;

    case 'antinopor':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn)
      chat.antiLinkxxx = isEnable;
      break;

    case 'audios':
    case 'audiosbot':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.audios = isEnable;
      break;

    case 'detect':
    case 'avisos':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.detect = isEnable;
      break;

    case 'subbots':
    case 'serbot':
      isAll = true;
      if (!isROwner) return global.dfail('rowner', m, conn)
      bot.jadibotmd = isEnable;
      break;

    case 'restrict':
      isAll = true;
      if (!isROwner) return global.dfail('rowner', m, conn)
      bot.restrict = isEnable;
      break;

    case 'document':
      isUser = true;
      user.useDocument = isEnable;
      break;

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiLink = isEnable;
      break;

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiBot = isEnable;
      break;

    case 'modoadmin':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.modoadmin = isEnable;
      break;

    case 'antiprivado':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn)
      bot.antiPrivate = isEnable;
      break;

    case 'nsfw':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.nsfw = isEnable;
      break;

    case 'antiarabes':
    case 'antifakes':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.onlyLatinos = isEnable;
      break;

    default:
      if (!/[01]/.test(command)) return m.reply(`
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ ⚙️ *INTERFACE DE AJUSTES* ⚙️
┗━━━━━━━━━━━━━━━━━━━━━┃
┃ 🟢 *Usar:* ${usedPrefix + command} <opción>
┃━━━━━━━━━━━━━━━━━━━━━┃
┃ 💻 *SISTEMA*
┃ ◦ _autoread_
┃ ◦ _subbots_
┃ ◦ _restrict_
┃ ◦ _antispam_
┃ ◦ _antiprivado_
┃
┃ 🛡️ *SEGURIDAD GRUPOS*
┃ ◦ _welcome_
┃ ◦ _antilink_
┃ ◦ _antibot_
┃ ◦ _detect_
┃ ◦ _antiarabes_
┃ ◦ _antilag_
┃
┃ 🔞 *CONTENIDO & MÁS*
┃ ◦ _nsfw_
┃ ◦ _antinopor_
┃ ◦ _audios_
┃ ◦ _modoadmin_
┃ ◦ _document_
┗━━━━━━━━━━━━━━━━━━━━━┛`.trim())
      throw false
  }

  let statusTxt = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ *AJUSTE ACTUALIZADO* ✨
┃━━━━━━━━━━━━━━━━━━━━━┃
┃ ⚙️ *Opción:* ${type}
┃ 📊 *Estado:* ${isEnable ? 'Activado ✅' : 'Desactivado ❌'}
┃ 📍 *Ámbito:* ${isAll ? 'Global 🌐' : isUser ? 'Usuario 👥' : 'Chat Actual 💬'}
┗━━━━━━━━━━━━━━━━━━━━━┛`.trim()

  await m.reply(statusTxt)
}

handler.help = ['enable', 'disable', 'on', 'off']
handler.tags = ['nable']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler
