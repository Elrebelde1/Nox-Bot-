const handler = async (m, { isOwner, isAdmin, conn, participants, args }) => {
  try {
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      return;
    }

    const prefijo = args[0];
    if (!prefijo) {
      return conn.reply(m.chat, '💥 *Sasuke Bot* 💥\n⚠️ Debes indicar un prefijo. Ejemplo: `.tagnum 57`', m);
    }

    // Unir el resto de los argumentos para el mensaje personalizado
    const customMessage = args.slice(1).join(' ') || 'Convocatoria por prefijo';
    const groupName = m.isGroup ? await conn.getName(m.chat) : 'Grupo';

    // Lista de banderas (Ordenadas por longitud de prefijo para evitar falsos positivos)
    const countryFlags = [
      { prefijo: '502', bandera: '🇬🇹' }, { prefijo: '503', bandera: '🇸🇻' },
      { prefijo: '504', bandera: '🇭🇳' }, { prefijo: '505', bandera: '🇳🇮' },
      { prefijo: '506', bandera: '🇨🇷' }, { prefijo: '507', bandera: '🇵🇦' },
      { prefijo: '591', bandera: '🇧🇴' }, { prefijo: '592', bandera: '🇬🇾' },
      { prefijo: '593', bandera: '🇪🇨' }, { prefijo: '595', bandera: '🇵🇾' },
      { prefijo: '598', bandera: '🇺🇾' }, { prefijo: '58',  bandera: '🇻🇪' },
      { prefijo: '52',  bandera: '🇲🇽' }, { prefijo: '54',  bandera: '🇦🇷' },
      { prefijo: '57',  bandera: '🇨🇴' }, { prefijo: '51',  bandera: '🇵🇪' },
      { prefijo: '56',  bandera: '🇨🇱' }, { prefijo: '55',  bandera: '🇧🇷' },
      { prefijo: '34',  bandera: '🇪🇸' }, { prefijo: '44',  bandera: '🇬🇧' },
      { prefijo: '33',  bandera: '🇫🇷' }, { prefijo: '49',  bandera: '🇩🇪' },
      { prefijo: '39',  bandera: '🇮🇹' }, { prefijo: '81',  bandera: '🇯🇵' },
      { prefijo: '82',  bandera: '🇰🇷' }, { prefijo: '86',  bandera: '🇨🇳' },
      { prefijo: '91',  bandera: '🇮🇳' }, { prefijo: '61',  bandera: '🇦🇺' },
      { prefijo: '64',  bandera: '🇳🇿' }, { prefijo: '1',   bandera: '🇺🇸' },
      { prefijo: '7',   bandera: '🇷🇺' }
    ];

    const getCountryFlag = (numero) => {
      const match = countryFlags.find(c => numero.startsWith(c.prefijo));
      return match ? match.bandera : '🏴‍☠️';
    };

    // Filtrar participantes por el prefijo solicitado
    const filtrados = participants.filter(mem => {
      const numero = (mem.id || mem.jid || '').split('@')[0];
      return numero.startsWith(prefijo);
    });

    if (filtrados.length === 0) {
      return conn.reply(m.chat, `👁️‍🗨️ No encontré miembros con el prefijo *+${prefijo}* en este grupo.`, m);
    }

    // Construcción del diseño estético (Estilo Sasuke / Ninja)
    let messageText = `⚡ ───  *${groupName.toUpperCase()}*  ─── ⚡\n\n`;
    messageText += `👁️‍🗨️ *Invocación por Prefijo:* \`+${prefijo}\`\n`;
    messageText += `👥 *Cantidad:* ${filtrados.length} miembro(s)\n`;
    messageText += `💬 *Nota:* _${customMessage}_\n\n`;
    messageText += `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;

    for (const mem of filtrados) {
      const numero = (mem.id || mem.jid || '').split('@')[0];
      messageText += `┃ ➔ ${getCountryFlag(numero)} @${numero}\n`;
    }

    messageText += `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;
    messageText += `> 𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵 ⚡`;

    // Enviar mensaje con menciones activas
    await conn.sendMessage(m.chat, {
      text: messageText,
      mentions: filtrados.map(a => a.id || a.jid)
    }, { quoted: m });

  } catch (error) {
    console.error("[ERROR EN TAGNUM]:", error);
    conn.reply(m.chat, `❌ Ocurrió un error inesperado en las sombras.`, m);
  }
};

handler.help = ['tagnum <prefijo> <mensaje>'];
handler.tags = ['group'];
handler.command = /^tagnum$/i;
handler.admin = true;
handler.group = true;

export default handler;
