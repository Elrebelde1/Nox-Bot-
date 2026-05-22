import fetch from 'node-fetch';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🔫';
  const emoji2 = '⚠️';

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji2} Debes proporcionar el ID de jugador de Free Fire.\n\nEjemplo:\n*${usedPrefix}${command} 2473863027*`, m);
  }

  const uid = args[0].trim();
  
  if (m.react) await m.react("🔄");

  try {
    // Consulta a la nueva API estable de Free Fire
    const res = await fetch(`https://api.clover-bot.xyz/api/game/freefire?id=${uid}`);
    const json = await res.json();

    // Validar si la API arrojó un error o no trajo datos válidos
    if (!json || json.status === false || (!json.basicInfo && !json.data?.basicInfo)) {
      if (m.react) await m.react("❌");
      return conn.reply(m.chat, `${emoji2} No se pudo encontrar información para el ID *${uid}*. Verifica que el número sea correcto o intenta más tarde.`, m);
    }

    // Adaptar la estructura por si la API responde con los datos planos o dentro de "data"
    const ffData = json.basicInfo ? json : json.data;
    const basic = ffData.basicInfo || {};
    const clan = ffData.clanBasicInfo || {};
    const social = ffData.socialInfo || {};

    // Formatear las fechas de creación y último acceso
    const createTime = basic.createTime ? new Date(basic.createTime * 1000).toISOString().split('T')[0] : 'No disponible';
    const lastLogin = basic.lastLoginTime ? new Date(basic.lastLoginTime * 1000).toISOString().split('T')[0] : 'Reciente';

    let info = `${emoji} *𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴 𝙵𝚁𝙴𝙴 𝙵𝙸𝚁𝙴*\n\n`;
    info += `👤 *𝙽𝙸𝙲𝙺𝙽𝙰𝙼𝙴:* ${basic.nickname || 'No disponible'}\n`;
    info += `🆔 *𝙸𝙳 𝙳𝙴 𝙹𝚄𝙶𝙰𝙳𝙾𝚁:* ${basic.uid || uid}\n`;
    info += `📈 *𝙽𝙸𝚅𝙴𝙻:* ${basic.level || 'No disponible'}\n`;
    info += `👑 *𝙻𝙸𝙺𝙴𝚂:* ${Number(basic.likeNum || 0).toLocaleString()}\n`;
    info += `📅 *𝙲𝚁𝙴𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴 𝙲𝚄𝙴𝙽𝚃𝙰:* ${createTime}\n`;
    info += `🕒 *𝚄́𝙻𝚃𝙸𝙼𝙾 𝙰𝙲𝙲𝙴𝚂𝙾:* ${lastLogin}\n\n`;

    info += `🛡️ *𝙳𝙰𝚃𝙾𝚂 𝙳𝙴𝙻 𝙲𝙻𝙰𝙽*\n`;
    info += `⚜️ *𝙲𝙻𝙰𝙽:* ${clan.clanName || 'Sin Clan'}\n`;
    info += `🆔 *𝙸𝙳 𝙳𝙴𝙻 𝙲𝙻𝙰𝙽:* ${clan.clanId || 'No disponible'}\n`;
    info += `👥 *𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂:* ${clan.memberNum || 0}\n\n`;

    info += `📝 *𝙵𝙸𝚁𝙼𝙰 / 𝙱𝙸𝙾:*\n_${social.signature || 'Sin firma.'}_`;

    await conn.reply(m.chat, info, m);
    if (m.react) await m.react("✅");

  } catch (err) {
    console.error(err);
    if (m.react) await m.react("❌");
    return conn.reply(m.chat, `${emoji2} Ocurrió un error interno al conectar con el servidor de Free Fire. Intenta de nuevo.`, m);
  }
};

handler.help = ['ffinfo <id>'];
handler.tags = ['utilidad'];
handler.command = ['ffinfo', 'freefire', 'ff'];
handler.group = false;

export default handler;
