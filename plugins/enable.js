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
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      chat.bienvenida = isEnable;
      break;

    case 'antiprivado2':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
      chat.antiPrivate2 = isEnable;
      break;

    case 'antilag':
      chat.antiLag = isEnable;
      break;

    case 'autoread':
    case 'autoleer':
      isAll = true;
      if (!isROwner) return global.dfail('rowner', m, conn);
      global.opts['autoread'] = isEnable;
      break;

    case 'antispam':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn);
      bot.antiSpam = isEnable;
      break;

    case 'antinopor':
      isAll = true;
      if (!isOwner) return global.dfail('owner', m, conn);
      chat.antiLinkxxx = isEnable;
      break;

    case 'audios':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.audios = isEnable;
      break;

    case 'detect':
    case 'avisos':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn);
      chat.detect = isEnable;
      break;

    case 'jadibotmd':
    case 'serbot':
    case 'subbots':
      isAll = true;
      if (!isOwner) return global.dfail('rowner', m, conn);
      bot.jadibotmd = isEnable;
      break;

    case 'restrict':
      isAll = true;
      if (!isOwner) return global.dfail('rowner', m, conn);
      bot.restrict = isEnable;
      break;

    case 'document':
      isUser = true;
      user.useDocument = isEnable;
      break;

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.antiLink = isEnable;
      break;

    case 'antibot':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.antiBot = isEnable;
      break;

    case 'modoadmin':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.modoadmin = isEnable;
      break;

    case 'antiprivado':
      isAll = true;
      bot.antiPrivate = isEnable;
      break;

    case 'nsfw':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.nsfw = isEnable;
      break;

    case 'antiarabes':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn);
      chat.onlyLatinos = isEnable;
      break;

    default:
      if (!/[01]/.test(command)) return m.reply(`
- á´„á´É´á´›Ê€á´ÊŸ á´„á´‡É´á´›á´‡Ê€
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
*Ajustes de Velocidad y Seguridad*

ðŸ *[welcome]* â®• Bienvenida
ðŸ *[nsfw]* â®• Modo Adulto
ðŸ *[antilink]* â®• Bloqueo de Links
ðŸ *[antilag]* â®• Optimizar RAM
ðŸ *[antiarabes]* â®• Filtro Regional
ðŸ *[autoleer]* â®• Lectura Auto
ðŸ *[restrict]* â®• Restricciones
ðŸ *[document]* â®• Modo Documento
ðŸ *[modoadmin]* â®• Solo Staff
ðŸ *[audios]* â®• Notas de Voz
ðŸ *[subbots]* â®• Sistema JadiBot

ðŸ› ï¸ *Uso:* ${usedPrefix + command} welcome
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`.trim())
      throw false
  }

  let statusText = isEnable ? 'ï¼¥ï¼®ï¼£ï¼¥ï¼®ï¼¤ï¼©ï¼¤ï¼¯ âœ…' : 'ï¼¡ï¼°ï¼¡ï¼§ï¼¡ï¼¤ï¼¯ âŒ';
  let scopeText = isAll ? 'ï¼´ï¼¯ï¼¤ï¼¯ ï¼¥ï¼¬ ï¼¢ï¼¯ï¼´' : isUser ? 'ï¼µï¼³ï¼µï¼¡ï¼²ï¼©ï¼¯' : 'ï¼¥ï¼³ï¼´ï¼¥ ï¼£ï¼¨ï¼¡ï¼´';

  let confirm = `
ðŸš˜ 
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ðŸš¦ *ESTADO DE LA FUNCIÃ“N*

ðŸ› ï¸ *ParÃ¡metro:* \`${type}\`
âš¡ *Estado:* ${statusText}
ðŸ“ *Ruta:* ${scopeText}

ðŸ’¨ *Â¡Motor configurado correctamente!*
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`.trim()

  m.reply(confirm)
}

handler.help = ['enable', 'disable', 'on', 'off']
handler.tags = ['nable']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler