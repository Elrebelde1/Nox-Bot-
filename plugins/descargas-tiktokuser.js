import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  // Si no hay texto, usamos el ejemplo de la API que pasaste
  let user = text ? text.replace(/^@/, '') : 'dev_diego_ofc';

  await m.react('🔍');

  try {
    const url = `https://api.dorratz.com/v3/tiktok-stalk?username=${encodeURIComponent(user)}`;
    const response = await axios.get(url);
    const res = response.data;

    // Validamos que exista userInfo en la respuesta
    if (res && res.userInfo) {
      const i = res.userInfo;

      let txt = `✨ *TIKTOK STALK* ✨\n\n`;
      txt += `👤 *Nombre:* ${i.nombre || 'No disponible'}\n`;
      txt += `🆔 *Usuario:* @${i.username}\n`;
      txt += `📝 *Bio:* ${i.bio || 'Sin biografía'}\n`;
      txt += `✅ *Verificado:* ${i.verificado ? 'Sí' : 'No'}\n\n`;
      
      txt += `📊 *ESTADÍSTICAS*\n`;
      txt += `👥 *Seguidores:* ${i.seguidoresTotales}\n`;
      txt += `📍 *Siguiendo:* ${i.siguiendoTotal}\n`;
      txt += `❤️ *Likes:* ${i.meGustaTotales}\n`;
      txt += `🎥 *Videos:* ${i.videosTotales}\n`;
      txt += `🤝 *Amigos:* ${i.amigosTotales}\n\n`;
      
      txt += `🔗 *Link:* https://www.tiktok.com/@${i.username}\n\n`;
      txt += `*Creador: by Barboza*`;

      // Enviamos el avatar que da la API
      await conn.sendMessage(m.chat, { 
        image: { url: i.avatar }, 
        caption: txt 
      }, { quoted: m });
      
      await m.react('✅');
    } else {
      await m.react('✖️');
      await conn.reply(m.chat, `❌ No se encontró información para: ${user}`, m);
    }
  } catch (error) {
    console.error('Error en TikTok Stalk:', error.message);
    await m.react('✖️');
    await conn.reply(m.chat, '⚠️ Error al conectar con la API de Dorratz.', m);
  }
};

handler.tags = ['info'];
handler.help = ['tkstalk *<usuario>*'];
handler.command = ['tiktokuser', 'stalk', 'tiktokstalk'];

export default handler;
