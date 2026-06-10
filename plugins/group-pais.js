const handler = async (m, { isOwner, isAdmin, conn, participants, args }) => {
  try {
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      return;
    }

    const prefijo = args[0];
    if (!prefijo) {
      return conn.reply(m.chat, '⚠️ Debes indicar un prefijo. Ejemplo: .tagnum 57', m);
    }

    const customMessage = args.slice(1).join(' ') || 'Convocatoria por prefijo';
    const groupName = m.isGroup ? await conn.getName(m.chat) : 'Grupo';

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
      return match ? match.bandera : '🏴‍☠️';
    };

    // FILTRO CORREGIDO: Prioriza 'jid' para evitar el LID interno de Meta
    const filtrados = participants.filter(mem => {
      const jidReal = mem.jid || mem.id || '';
      const numero = jidReal.split('@')[0];
      
      if (prefijo === '58') {
        return numero.startsWith('58') || numero.startsWith('589');
      }
      return numero.startsWith(prefijo);
    });

    if (filtrados.length === 0) {
      return conn.reply(m.chat, `⚠️ No encontré miembros con el prefijo +${prefijo}`, m);
    }

    let messageText = `*${groupName}*\n\nIntegrantes con +${prefijo}: ${filtrados.length}\nMensaje: ${customMessage}\n\n`;

    for (const mem of filtrados) {
      const jidReal = mem.jid || mem.id || '';
      const numero = jidReal.split('@')[0];
      messageText += `${getCountryFlag(numero)} @${numero}\n`;
    }

    // Mapeo de menciones usando también el JID real corregido
    await conn.sendMessage(m.chat, {
      text: messageText,
      mentions: filtrados.map(a => a.jid || a.id)
    }, { quoted: m });

  } catch (error) {
    console.error("[ERROR EN TAGNUM]:", error);
    conn.reply(m.chat, `❌ Ocurrió un error al ejecutar el comando.`, m);
  }
};

handler.help = ['tagnum'];
handler.tags = ['gc'];
handler.command = /^tagnum$/i;
handler.admin = true;
handler.group = true;

export default handler;
