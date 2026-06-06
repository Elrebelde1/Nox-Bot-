import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const handler = async (m, { isOwner, isAdmin, conn, participants, args }) => {
  try {
    const chat = global.db.data?.chats?.[m.chat] || {};
    const emoji = chat.emojiTag || '🤖';

    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      return;
    }

    const customMessage = args.join(' ');
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

    const getCountryFlag = (mem) => {
      const rawJid = mem.jid || mem.id || '';
      const phoneNumber = rawJid.split('@')[0];

      const match3 = countryFlags.find(c => c.prefijo.length === 3 && phoneNumber.startsWith(c.prefijo));
      if (match3) return match3.bandera;

      const match2 = countryFlags.find(c => c.prefijo.length === 2 && phoneNumber.startsWith(c.prefijo));
      if (match2) return match2.bandera;

      const match1 = countryFlags.find(c => c.prefijo.length === 1 && phoneNumber.startsWith(c.prefijo));
      if (match1) return match1.bandera;

      return '🚩';
    };

    let messageText = `*${groupName}*\n\n*Integrantes: ${participants.length}*\n${customMessage}\n┌──⭓ *Despierten*\n`;

    for (const mem of participants) {
      const realJid = mem.jid || mem.id || '';
      const displayNumber = realJid.split('@')[0];
      messageText += `${emoji} ${getCountryFlag(mem)} @${displayNumber}\n`;
    }

    messageText += `└───────⭓\n\n𝘚𝘶𝘱𝘦𝘳 𝘉𝘰𝘵 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 🚩`;

    await conn.sendMessage(m.chat, {
      text: messageText,
      mentions: participants.map(a => a.jid || a.id)
    }, { quoted: m });

  } catch (error) {
    console.error("[ERROR CRÍTICO EN TAGALL]:", error);
    conn.reply(m.chat, `❌ Ocurrió un error al ejecutar el comando.`, m);
  }
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;