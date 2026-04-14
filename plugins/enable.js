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
💠 *ＳＡＳＵＫＥ - ＣＯＮＴＲＯＬ*
──────────────────────
⚙️ _*Ajustes de Sasuke Bot*_

🔹 *[welcome]* ⮕ _Bienvenida_
🔹 *[nsfw]* ⮕ _Modo Hot_
🔹 *[antilink]* ⮕ _Anti-Links_
🔹 *[antilag]* ⮕ _Limpieza_
🔹 *[antiarabes]* ⮕ _Filtro Pais_
🔹 *[autoleer]* ⮕ _Auto Read_
🔹 *[restrict]* ⮕ _Restringir_
🔹 *[document]* ⮕ _Documentos_
🔹 *[modoadmin]* ⮕ _Staff Only_
🔹 *[audios]* ⮕ _Audios Bot_
🔹 *[subbots]* ⮕ _SerBot_
🔹 *[antibot]* ⮕ _Anti-Bots_
🔹 *[detect]* ⮕ _Avisos_

📝 *𝚄𝚜𝚘:* ${usedPrefix + command} [𝚏𝚞𝚗𝚌𝚒ó𝚗]
──────────────────────`.trim())
      throw false
  }

  let statusText = isEnable ? 'Ｏｎ ✅' : 'Ｏｆｆ ❌';

  // Formato correcto: .subbots On ✅
  m.reply(`
💠 *ＳＡＳＵＫＥ ＢＯＴ*
──────────────────────
✨ *${usedPrefix}${type} ${statusText}*

🚀 _El motor se ha configurado con éxito._
──────────────────────`.trim())
}

handler.help = ['enable', 'disable', 'on', 'off']
handler.tags = ['config']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler
