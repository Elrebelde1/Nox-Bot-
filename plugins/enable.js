let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  
  // Si no hay argumentos (ej: .antilag solo), muestra cómo usarlo
  if (!args[0]) return m.reply(`
💠 *ＳＡＳＵＫＥ - ＣＯＮＴＲＯＬ*
──────────────────────
⚙️ _Configuración de: *${command.toUpperCase()}*_

📝 *Estado deseado:*
🔹 ${usedPrefix}${command} *on*  ⮕ _Activar_
🔹 ${usedPrefix}${command} *off* ⮕ _Desactivar_

🚀 _Ingresa una opción para cambiar el motor._
──────────────────────`.trim())

  let isEnable = /true|enable|(turn)?on|1/i.test(args[0]);
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};
  let type = command.toLowerCase();

  // Validaciones de seguridad (Admin/Owner)
  const adminFunctions = ['welcome', 'bienvenida', 'detect', 'audios', 'nsfw', 'antilink', 'antibot', 'modoadmin', 'antiarabes', 'antilag'];
  const ownerFunctions = ['autoleer', 'restrict', 'serbot', 'antispam', 'jadibotmd'];

  if (adminFunctions.includes(type)) {
    if (m.isGroup && !isAdmin && !isOwner) return global.dfail('admin', m, conn);
    if (!m.isGroup && !isOwner) return global.dfail('group', m, conn);
  }

  if (ownerFunctions.includes(type)) {
    if (!isOwner && !isROwner) return global.dfail('owner', m, conn);
  }

  // Lógica de encendido y apagado
  switch (type) {
    case 'welcome':
    case 'bienvenida':
      chat.bienvenida = isEnable;
      break;
    
    case 'antilag':
      chat.antiLag = isEnable;
      break;

    case 'autoleer':
      global.opts['autoread'] = isEnable;
      break;

    case 'antispam':
      bot.antiSpam = isEnable;
      break;

    case 'audios':
      chat.audios = isEnable;
      break;

    case 'detect':
    case 'avisos':
      chat.detect = isEnable;
      break;

    case 'serbot':
    case 'jadibotmd':
      bot.jadibotmd = isEnable;
      break;

    case 'restrict':
      bot.restrict = isEnable;
      break;

    case 'antilink':
      chat.antiLink = isEnable;
      break;

    case 'antibot':
      chat.antiBot = isEnable;
      break;

    case 'modoadmin':
      chat.modoadmin = isEnable;
      break;

    case 'nsfw':
      chat.nsfw = isEnable;
      break;

    case 'antiarabes':
      chat.onlyLatinos = isEnable;
      break;

    case 'document':
      user.useDocument = isEnable;
      break;

    default:
      return m.reply("❌ *Error:* Esta función no existe en el sistema.");
  }

  let statusText = isEnable ? 'ＡＣＴＩＶＡＤＯ ✅' : 'ＤＥＳＡＣＴＩＶＡＤＯ ❌';

  // Respuesta final con diseño mejorado
  m.reply(`
💠 *ＳＡＳＵＫＥ ＳＹＳＴＥＭ*
──────────────────────
⚙️ *FUNCIÓN:* ${type.toUpperCase()}
📡 *ESTADO:* ${statusText}

✨ _La configuración se aplicó con éxito._
──────────────────────`.trim())
}

// Lista de comandos que activan este archivo
handler.help = ['antilag on/off', 'antilink on/off', 'nsfw on/off', 'welcome on/off']
handler.tags = ['config']
handler.command = /^(antilag|welcome|bienvenida|autoleer|antispam|audios|detect|avisos|serbot|jadibotmd|restrict|antilink|antibot|modoadmin|nsfw|antiarabes|document)$/i

export default handler
