import fetch from 'node-fetch';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🔫';
  const emoji2 = '⚠️';

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji2} Debes proporcionar el ID de jugador de Free Fire.\n\nEjemplo:\n*${usedPrefix}${command} 2473863027*`, m);
  }

  const uid = args[0].trim();
  
  if (m.react) await m.react("🔄");

  // Lista de regiones comunes para fuerza bruta en caso de que no se especifique
  const regiones = ['us', 'br', 'sg', 'ind', 'me', 'id'];
  let ffData = null;
  let regionActiva = 'US';

  try {
    // Sistema de escaneo por regiones directo al backend alternativo estable
    for (let reg of regiones) {
      try {
        const response = await fetch(`https://ff-api-001.vercel.app/api/player?id=${uid}&region=${reg}`, { timeout: 5000 });
        if (!response.ok) continue;
        
        const json = await response.json();
        if (json && (json.nickname || json.basicInfo?.nickname)) {
          ffData = json.basicInfo ? json : { basicInfo: json, clanBasicInfo: json.clanInfo, socialInfo: json.socialInfo };
          regionActiva = reg.toUpperCase();
          break;
        }
      } catch (err) {
        continue; // Si falla una región, salta a la siguiente sin romper el código
      }
    }

    // Fallback de emergencia 2: Scraper directo por Post si el primero falla
    if (!ffData) {
      const resEmergency = await fetch('https://freefireapi.com.br/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: uid })
      }).catch(() => null);

      if (resEmergency && resEmergency.ok) {
        const jsonEmergency = await resEmergency.json();
        if (jsonEmergency && jsonEmergency.name) {
          ffData = {
            basicInfo: {
              nickname: jsonEmergency.name,
              uid: uid,
              level: jsonEmergency.level,
              likeNum: jsonEmergency.likes,
              rankPoints: jsonEmergency.rank_points
            },
            clanBasicInfo: { clanName: jsonEmergency.clan_name },
            socialInfo: { signature: jsonEmergency.bio }
          };
          regionActiva = 'BR/US';
        }
      }
    }

    // Si después de los dos métodos no encuentra nada
    if (!ffData || !ffData.basicInfo?.nickname) {
      if (m.react) await m.react("❌");
      return conn.reply(m.chat, `${emoji2} No se pudo conectar con los servidores de Free Fire o el ID *${uid}* no existe. Intenta de nuevo.`, m);
    }

    const basic = ffData.basicInfo;
    const clan = ffData.clanBasicInfo || {};
    const social = ffData.socialInfo || {};

    let info = `${emoji} *𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴 𝙵𝚁𝙴𝙴 𝙵𝙸𝚁𝙴*\n\n`;
    info += `👤 *𝙽𝙸𝙲𝙺𝙽𝙰𝙼𝙴:* ${basic.nickname}\n`;
    info += `🆔 *𝙸𝙳 𝙳𝙴 𝙹𝚄𝙶𝙰𝙳𝙾𝚁:* ${basic.uid || uid}\n`;
    info += `📈 *𝙽𝙸𝚅𝙴𝙻:* ${basic.level || 'No disponible'}\n`;
    info += `👑 *𝙻𝙸𝙺𝙴𝚂:* ${Number(basic.likeNum || 0).toLocaleString()}\n`;
    info += `🌍 *𝚁𝙴𝙶𝙸𝙾́𝙽 𝙳𝙴𝚃𝙴𝙲𝚃𝙰𝙳𝙰:* ${regionActiva}\n`;
    if (basic.rankPoints) info += `🏆 *𝙿𝚄𝙽𝚃𝙾𝚂 𝙳𝙴 𝚁𝙰𝙽𝙺:* ${basic.rankPoints}\n`;
    info += `\n`;

    info += `🛡️ *𝙳𝙰𝚃𝙾𝚂 𝙳𝙴𝙻 𝙲𝙻𝙰𝙽*\n`;
    info += `⚜️ *𝙲𝙻𝙰𝙽:* ${clan.clanName || 'Sin Clan'}\n`;
    if (clan.clanId) info += `🆔 *𝙸𝙳 𝙳𝙴𝙻 𝙲𝙻𝙰𝙽:* ${clan.clanId}\n`;
    if (clan.memberNum) info += `👥 *𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂:* ${clan.memberNum}\n`;
    info += `\n`;

    if (social.signature || basic.signature) {
      info += `📝 *𝙵𝙸𝚁𝙼𝙰 / 𝙱𝙸𝙾:*\n_${social.signature || basic.signature || 'Sin firma.'}_`;
    }

    await conn.reply(m.chat, info, m);
    if (m.react) await m.react("✅");

  } catch (err) {
    console.error(err);
    if (m.react) await m.react("❌");
    return conn.reply(m.chat, `${emoji2} Ocurrió un error inesperado al procesar la consulta.`, m);
  }
};

handler.help = ['ffinfo <id>'];
handler.tags = ['utilidad'];
handler.command = ['ffinfo', 'freefire', 'ff'];
handler.group = false;

export default handler;
