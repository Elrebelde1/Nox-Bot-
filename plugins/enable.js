let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
  
  // 1. Si no hay argumentos, enviar ayuda visual
  if (!args[0]) {
    return conn.reply(m.chat, `*💠 CONTROL DE SISTEMA*\n\nUso: ${usedPrefix}${command} [on/off]\nEjemplo: *${usedPrefix}${command} on*`, m)
  }

  let isEnable = /true|enable|(turn)?on|1/i.test(args[0]);
  let chat = global.db.data.chats[m.chat];
  let type = command.toLowerCase();

  // 2. Validación manual de Administrador (para asegurar que responda en grupos)
  if (m.isGroup && !isAdmin && !isOwner) {
    return conn.reply(m.chat, `❌ *ERROR:* Solo los administradores pueden usar este comando.`, m)
  }

  // 3. Ejecución directa
  try {
    switch (type) {
      case 'welcome': chat.bienvenida = isEnable; break;
      case 'antilag': chat.antiLag = isEnable; break;
      case 'antilink': chat.antiLink = isEnable; break;
      case 'nsfw': chat.nsfw = isEnable; break;
      case 'detect': chat.detect = isEnable; break;
      case 'audios': chat.audios = isEnable; break;
      case 'antibot': chat.antiBot = isEnable; break;
      default:
        return conn.reply(m.chat, `❌ La función *${type}* no está registrada.`, m)
    }

    let status = isEnable ? 'ＡＣＴＩＶＡＤＯ ✅' : 'ＤＥＳＡＣＴＩＶＡＤＯ ❌';

    // 4. Mensaje de éxito con diseño Sasuke
    await conn.reply(m.chat, `
💠 *ＳＡＳＵＫＥ ＢＯＴ*
──────────────────────
⚙️ *COMANDO:* ${type.toUpperCase()}
📡 *ESTADO:* ${status}

🚀 _Configuración aplicada con éxito._
──────────────────────`.trim(), m)

  } catch (err) {
    // Si falla, el bot enviará el error al chat para que sepas qué pasó
    conn.reply(m.chat, `⚠️ *ERROR CRÍTICO:* ${err.message}`, m)
  }
}

handler.help = ['antilag on/off']
handler.tags = ['config']
// Aquí añadimos todos los comandos que quieras activar
handler.command = /^(antilag|welcome|antilink|nsfw|detect|audios|antibot)$/i

// Forzar que funcione en grupos y privados
handler.group = true
handler.private = true

export default handler
