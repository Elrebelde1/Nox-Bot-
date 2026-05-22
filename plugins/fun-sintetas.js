import fetch from 'node-fetch';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🎮';
  const emoji2 = '⚠️';

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji2} Debes proporcionar un nombre de usuario de Roblox.\n\nEjemplo:\n*${usedPrefix}${command} Barboza_147*`, m);
  }

  const username = args[0].trim();
  let info = '';
  let profilePicture = '';

  try {
    // Método Principal: API de Perfil Completo
    const apiRes = await fetch(`https://api.lolhuman.xyz/api/roblox/${encodeURIComponent(username)}`);
    const json = await apiRes.json();

    if (json.status === 200 && json.result) {
      const res = json.result;
      const creationDate = res.created ? res.created.split('T')[0] : 'No disponible';

      info = `${emoji} *𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴 𝚁𝙾𝙱𝙻𝙾𝚇*\n\n`;
      info += `👤 *𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${res.username || username}\n`;
      info += `📝 *𝙽𝙾𝙼𝙱𝚁𝙴 𝙿𝙰𝚁𝙰 𝙼𝙾𝚂𝚃𝚁𝙰𝚁:* ${res.display_name || 'No disponible'}\n`;
      info += `🆔 *𝙸𝙳 𝙳𝙴 𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${res.id || 'No disponible'}\n`;
      info += `📅 *𝙵𝙴𝙲𝙷𝙰 𝙳𝙴 𝙲𝚁𝙴𝙰𝙲𝙸𝙾́𝙽:* ${creationDate}\n`;
      info += `📄 *𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸𝙾́𝙽:*\n${res.description || 'Sin descripción'}\n\n`;
      info += `👥 *𝙰𝙼𝙸𝙶𝙾𝚂:* ${res.friends || 0}\n`;
      info += `👣 *𝚂𝙴𝙶𝚄𝙸𝙳𝙾𝚁𝙴𝚂:* ${res.followers || 0}\n`;
      info += `➡️ *𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝙳𝙾:* ${res.following || 0}\n`;
      info += `💎 *𝙿𝚁𝙴𝙼𝙸𝚄𝙼:* ${res.is_premium ? 'Sí 👑' : 'No'}\n`;
      
      profilePicture = `https://thumbnails.roblox.com/v1/users/avatar?userIds=${res.id}&size=720x720&format=Png&isCircular=false`;
    }
  } catch (e) {
    console.log("API Principal caída o saturada, activando Fallback Oficial...");
  }

  // Método de Emergencia (Directo de los servidores oficiales de Roblox si la API falla)
  if (!info) {
    try {
      const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
      });
      const userData = await userRes.json();

      if (userData.data && userData.data.length > 0) {
        const userId = userData.data[0].id;
        const detailRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
        const detailData = await detailRes.json();
        const creationDate = detailData.created ? detailData.created.split('T')[0] : 'No disponible';

        info = `${emoji} *𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴 𝚁𝙾𝙱𝙻𝙾𝚇 (𝚁𝙴𝚂𝙿𝙰𝙻𝙳𝙾)*\n\n`;
        info += `👤 *𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${detailData.name}\n`;
        info += `📝 *𝙽𝙾𝙼𝙱𝚁𝙴 𝙿𝙰𝚁𝙰 𝙼𝙾𝚂𝚃𝚁𝙰𝚁:* ${detailData.displayName}\n`;
        info += `🆔 *𝙸𝙳 𝙳𝙴 𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${userId}\n`;
        info += `📅 *𝙵𝙴𝙲𝙷𝙰 𝙳𝙴 𝙲𝚁𝙴𝙰𝙲𝙸𝙾́𝙽:* ${creationDate}\n`;
        info += `🚫 *¿𝙴𝚂𝚃𝙰́ 𝙱𝙰𝙽𝙴𝙰𝙳𝙾?:* ${detailData.isBanned ? 'Sí ❌' : 'No ✅'}\n`;
        info += `📄 *𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸𝙾́𝙽:*\n${detailData.description || 'Sin descripción.'}\n\n`;
        info += `⚠️ _Nota: Algunas estadísticas avanzadas no están disponibles temporalmente._`;

        profilePicture = `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Si ambos métodos fallaron y no hay información
  if (!info) {
    return conn.reply(m.chat, `${emoji2} No se pudo obtener información de *${username}* en ninguna fuente. Verifica el nombre o intenta más tarde.`, m);
  }

  try {
    // Validar si la miniatura responde bien, si no usa una por defecto
    const thumbCheck = await fetch(profilePicture);
    const thumbJson = await thumbCheck.json();
    const finalImg = thumbJson.data?.[0]?.imageUrl || 'https://tr.rbxcdn.com/30d25c053ccda7031139ed240b333777/420/420/Avatar/Png';

    await conn.sendFile(m.chat, finalImg, 'roblox.png', info, m);
  } catch (e) {
    // Si falla el render de la imagen, envía al menos el texto para que no quede colgado
    await conn.reply(m.chat, info, m);
  }
};

handler.help = ['robloxinfo <usuario>'];
handler.tags = ['utilidad'];
handler.command = ['robloxinfo', 'roblox'];
handler.group = false;

export default handler;
