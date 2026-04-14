let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  
  // 1. Verificación básica: Si no hay argumentos (.antilag)
  if (args.length === 0) {
    return conn.reply(m.chat, `
💠 *ＳＡＳＵＫＥ - ＣＯＮＴＲＯＬ*
──────────────────────
⚙️ _Configuración de: *${command.toUpperCase()}*_

📝 *Uso correcto:*
🔹 ${usedPrefix}${command} *on*
🔹 ${usedPrefix}${command} *off*
──────────────────────`.trim(), m)
  }

  let isEnable = /true|enable|(turn)?on|1/i.test(args[0]);
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};
  let type = command.toLowerCase();

  // 2. Validación de Permisos (Crucial para que responda en grupos)
  if (m.isGroup) {
    if (!(isAdmin || isOwner)) {
      return conn.reply(m.chat, `❌ *ERROR:* Solo los *Administradores* pueden usar este comando en el grupo.`, m)
    }
  }

  // 3. Ejecución de la configuración
  try {
    switch (type) {
      case 'welcome':
      case 'bienvenida':
        chat.bienvenida = isEnable;
        break;
      
      case 'antilag':
        chat.antiLag = isEnable;
        break;

      case 'antilink':
        chat.antiLink = isEnable;
        break;

      case 'antibot':
        chat.antiBot = isEnable;
        break;

      case 'nsfw':
        chat.nsfw = isEnable;
        break;

      case 'audios':
        chat.audios = isEnable;
        break;

      case 'modoadmin':
        chat.modoadmin = isEnable;
        break;

      case 'detect':
        chat.detect = isEnable;
        break;

      case 'antiarabes':
        chat.onlyLatinos = isEnable;
        break;

      // Comandos solo para el Dueño (Owner)
      case 'autoleer':
      case 'antispam':
      case 'restrict':
      case 'serbot':
        if (!isOwner) return conn.reply(m.chat, `❌ Este ajuste es solo para el *Owner*.`, m)
        if (type === 'autoleer') global.opts['autoread'] = isEnable;
        if (type === 'antispam') bot.antiSpam = isEnable;
        if (type === 'restrict') bot.restrict = isEnable;
        if (type === 'serbot') bot.jadibotmd = isEnable;
        break;

      default:
        return conn.reply(m.chat, "❌ Función no reconocida.", m);
    }

    let statusText = isEnable ? 'ＡＣＴＩＶＡＤＯ ✅' : 'ＤＥＳＡＣＴＩＶＡＤＯ ❌';

    // 4. Respuesta de confirmación
    await conn.reply(m.chat, `
💠 *ＳＡＳＵＫＥ ＳＹＳＴＥＭ*
──────────────────────
⚙️ *FUNCIÓN:* ${type.toUpperCase()}
📡 *ESTADO:* ${statusText}

✨ _Cambios aplicados en este chat._
──────────────────────`.trim(), m)

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, `❌ Ocurrió un error interno al configurar ${type}`, m)
  }
}

handler.help = ['antilag on/off', 'antilink on/off', 'welcome on/off']
handler.tags = ['config']
handler.command = /^(antilag|welcome|bienvenida|autoleer|antispam|audios|detect|serbot|restrict|antilink|antibot|modoadmin|nsfw|antiarabes)$/i

// IMPORTANTE: Esto permite que el comando funcione en grupos
handler.group = true 

export default handler
