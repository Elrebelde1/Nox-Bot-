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

    const customMessage = args.slice(1).join(' ') || 'Etiqueta por prefijo';
    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({ subject: 'Grupo', participants: [] }));
    const groupName = groupMetadata.subject;

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
      return match ? match.bandera : '🚩';
    };


    const filtrados = participants.filter(mem => {
      const numero = (mem.jid || mem.id || '').split('@')[0];
      return numero.startsWith(prefijo);
    });

    if (filtrados.length === 0) {
      return conn.reply(m.chat, `❌ No encontré miembros con prefijo +${prefijo}`, m);
    }

    let messageText = `❗ *${groupName}* ❗\n\n*ᘏ Integrantes con +${prefijo}: ${filtrados.length}*\nᘏ Mensaje: ${customMessage}\n\n╭──╼ Mención filtrada ╾──╮\n`;

    for (const mem of filtrados) {
      const numero = (mem.jid || mem.id || '').split('@')[0];
      messageText += `│⌗${getCountryFlag(numero)} @${numero}\n`;
    }

    messageText += `╰────────╼╾────────╯\n> ${dev}`;

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