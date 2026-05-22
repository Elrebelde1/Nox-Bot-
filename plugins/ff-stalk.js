import fetch from 'node-fetch';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🔫';
  const emoji2 = '⚠️';

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji2} Debes proporcionar el ID de jugador de Free Fire y opcionalmente la región.\n\nEjemplo:\n*${usedPrefix}${command} 907719977*\n*${usedPrefix}${command} 1633864660 IND*`, m);
  }

  const uid = args[0].trim();
  // Regiones soportadas comunes: US (Norte/Suramérica), IND (India), BR (Brasil), SG (Singapur)
  let regionInput = args[1] ? args[1].toUpperCase().trim() : 'US'; 
  
  if (m.react) await m.react("🔄");

  let info = '';
  let data = null;
  const regionesABuscar = [regionInput, 'US', 'BR', 'IND']; // Lista de fallback automático por si no se especifica bien

  // Eliminar duplicados para no repetir peticiones innecesarias
  const regionesUnicas = [...new Set(regionesABuscar)];

  for (let region of regionesUnicas) {
    try {
      const res = await fetch(`https://free-ff-api-src-5plp.onrender.com/api/v1/account?region=${region}&uid=${uid}`);
      const json = await res.json();

      // Si la API responde con éxito y encuentra la cuenta
      if (json && json.basicInfo) {
        data = json;
        regionInput = region; // Guardar la región real donde se encontró
        break;
      }
    } catch (e) {
      console.log(`Fallo buscando en la región ${region}, intentando la siguiente...`);
    }
  }

  if (!data) {
    if (m.react) await m.react("❌");
    return conn.reply(m.chat, `${emoji2} No se pudo encontrar información para el ID *${uid}* en ninguna región disponible. Verifica que el ID sea correcto.`, m);
  }

  try {
    const basic = data.basicInfo;
    const clan = data.clanBasicInfo || {};
    const profile = data.socialInfo || {};

    // Formatear fechas si vienen en formato timestamp
    const lastLogin = basic.lastLoginTime ? new Date(basic.lastLoginTime * 1000).toISOString().split('T')[0] : 'Reciente';

    info = `${emoji} *𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴 𝙵𝚁𝙴𝙴 𝙵𝙸𝚁𝙴*\n\n`;
    info += `👤 *𝙽𝙸𝙲𝙺𝙽𝙰𝙼𝙴:* ${basic.nickname}\n`;
    info += `🆔 *𝙸𝙳 𝙳𝙴 𝙹𝚄𝙶𝙰𝙳𝙾𝚁:* ${basic.uid}\n`;
    info += `📈 *𝙽𝙸𝚅𝙴𝙻:* ${basic.level || 'No disponible'}\n`;
    info += `🌍 *𝚁𝙴𝙶𝙸𝙾́𝙽:* ${regionInput}\n`;
    info += `👑 *𝙻𝙸𝙺𝙴𝚂:* ${Number(basic.likeNum || 0).toLocaleString()}\n`;
    info += `🏆 *𝙿𝚄𝙽𝚃𝙾𝚂 𝙳𝙴 𝚁𝙰𝙽𝙺:* ${basic.rankPoints || 'No disponible'}\n`;
    info += `🕒 *𝚄́𝙻𝚃𝙸𝙼𝙾 𝙰𝙲𝙲𝙴𝚂𝙾:* ${lastLogin}\n\n`;

    info += `🛡️ *𝙳𝙰𝚃𝙾𝚂 𝙳𝙴𝙻 𝙲𝙻𝙰𝙽*\n`;
    info += `⚜️ *𝙲𝙻𝙰𝙽:* ${clan.clanName || 'Sin Clan'}\n`;
    info += `🆔 *𝙸𝙳 𝙳𝙴𝙻 𝙲𝙻𝙰𝙽:* ${clan.clanId || 'No disponible'}\n`;
    info += `👥 *𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂:* ${clan.memberNum || 0}\n\n`;

    info += `📝 *𝙵𝙸𝚁𝙼𝙰 / 𝙱𝙸𝙾:*\n_${profile.signature || 'Sin firma.'}_`;

    // Intentar enviar la tarjeta o la info directamente
    await conn.reply(m.chat, info, m);
    if (m.react) await m.react("✅");

  } catch (err) {
    console.error(err);
    if (m.react) await m.react("❌");
    return conn.reply(m.chat, `${emoji2} Ocurrió un error al procesar los datos del jugador.`, m);
  }
};

handler.help = ['ffinfo <id> <region>'];
handler.tags = ['utilidad'];
handler.command = ['ffinfo', 'freefire', 'ff'];
handler.group = false;

export default handler;
