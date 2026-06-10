const handler = async (m, { isOwner, isAdmin, conn, participants, args }) => {
  try {
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      return;
    }

    const prefijo = args[0];
    if (!prefijo) {
      return conn.reply(m.chat, '🏮 *𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵* 🏮\n⚠️ _Debes indicar un prefijo._\nEjemplo: `.tagnum 57`', m);
    }

    const customMessage = args.slice(1).join(' ') || 'Convocatoria ninja por prefijo';
    const groupName = m.isGroup ? await conn.getName(m.chat) : 'Grupo';

    // Lista de banderas optimizada
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
      let numLimpio = numero;
      if (numero.startsWith('589')) {
        numLimpio = '58' + numero.substring(3);
      }
      const match = countryFlags.find(c => numLimpio.startsWith(c.prefijo));
      return match ? match.bandera : '⛩️';
    };

    // FILTRO PRO: Usando 'jid' para tumbar el LID de Meta
    const filtrados = participants.filter(mem => {
      const jidReal = mem.jid || mem.id || '';
      const numero = jidReal.split('@')[0];
      
      if (prefijo === '58') {
        return numero.startsWith('58') || numero.startsWith('589');
      }
      return numero.startsWith(prefijo);
    });

    if (filtrados.length === 0) {
      return conn.reply(m.chat, `👁️‍🗨️ _No encontré ninjas con el prefijo_ *+${prefijo}* _en este clan._`, m);
    }

    // DISEÑO UCHIHA REFINADO
    let messageText = `⚡ ───  *${groupName.toUpperCase()}*  ─── ⚡\n\n`;
    messageText += `👁️‍🗨️ *𝘚𝘩𝘢𝘳𝘪𝘯𝘨𝘢𝘯 𝘍𝘪𝘭𝘵𝘦𝘳:* \`+${prefijo}\`\n`;
    messageText += `👥 *𝘐𝘯𝘵𝘦𝘨𝘳𝘢𝘯𝘵𝘦𝘴:* ${filtrados.length}\n`;
    messageText += `💬 *𝘔𝘦𝘯𝘴𝘢𝘫𝘦:* _${customMessage}_\n\n`;
    messageText += `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;

    for (const mem of filtrados) {
      const jidReal = mem.jid || mem.id || '';
      const numero = jidReal.split('@')[0];
      messageText += `┃ ➔ ${getCountryFlag(numero)} @${numero}\n`;
    }

    messageText += `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n`;
    messageText += `> 𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵 🏮`;

    // Envío con menciones limpias basadas en JID real
    await conn.sendMessage(m.chat, {
      text: messageText,
      mentions: filtrados.map(a => a.jid || a.id)
    }, { quoted: m });

  } catch (error) {
    console.error("[ERROR EN TAGNUM UCHIHA]:", error);
    conn.reply(m.chat, `❌ El Jutsu falló en las sombras.`, m);
  }
};

handler.help = ['tagnum'];
handler.tags = ['gc'];
handler.command = /^tagnum$/i;
handler.admin = true;
handler.group = true;

export default handler;
