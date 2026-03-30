import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🚩 *¿A quién quieres investigar?*\n\nPor favor, ingresa el nombre de usuario de TikTok.\n\n*Ejemplo:*\n> *${usedPrefix + command} sebastin.barboza2*`,
      m
    );
  }

  await m.react('👤');

  try {
    // Limpiamos el texto por si el usuario pone @
    const user = text.replace(/^@/, '');
    const url = `https://api.dorratz.com/v3/tiktok-stalk?username=${encodeURIComponent(user)}`;
    
    const response = await axios.get(url);
    const res = response.data;

    if (res.status && res.userInfo) {
      const i = res.userInfo;

      let txt = `✨ *TIKTOK STALK - PERFIL* ✨\n\n`;
      txt += `👤 *Nombre:* ${i.nombre}\n`;
      txt += `🆔 *User:* @${i.username}\n`;
      txt += `📝 *Bio:* ${i.bio || 'Sin biografía'}\n`;
      txt += `✅ *Verificado:* ${i.verificado ? 'Sí' : 'No'}\n\n`;
      
      txt += `📊 *ESTADÍSTICAS*\n`;
      txt += `👥 *Seguidores:* ${i.seguidoresTotales}\n`;
      txt += `📍 *Siguiendo:* ${i.siguiendoTotal}\n`;
      txt += `❤️ *Likes:* ${i.meGustaTotales}\n`;
      txt += `🎥 *Videos:* ${i.videosTotales}\n`;
      txt += `🤝 *Amigos:* ${i.amigosTotales}\n\n`;
      
      txt += `🔗 *Enlace:* https://www.tiktok.com/@${i.username}\n\n`;
      txt += `*Creador: by Barboza*`;

      // Enviamos el Avatar del usuario como imagen principal
      await conn.sendMessage(m.chat, { 
        image: { url: i.avatar }, 
        caption: txt 
      }, { quoted: m });
      
      await m.react('✅');
    } else {
      await m.react('✖️');
      await conn.reply(m.chat, 'No se pudo encontrar información de ese usuario.', m);
    }
  } catch (error) {
    console.error('Error en TikTok Stalk:', error);
    await m.react('✖️');
    await conn.reply(m.chat, 'Error al conectar con el servidor de Stalk.', m);
  }
};

handler.tags = ['info'];
handler.help = ['tkstalk *<usuario>*'];
handler.command = ['tkstalk', 'tiktokuser', 'stalk'];

export default handler;
