import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🚩 *¿Qué deseas buscar en TikTok?*\n\nPor favor, ingresa un término de búsqueda.\n\n*Ejemplo:*\n> *${usedPrefix + command} @sebastin.barboza2*`,
      m
    );
  }

  await m.react('🔍');

  try {
    // Consulta a la API de Vreden usando el texto del usuario
    const response = await axios.get(`https://api.vreden.my.id/api/tiktoksearch?query=${encodeURIComponent(text)}`);
    const data = response.data;

    if (data.status && data.result?.search_data?.length > 0) {
      
      // Tomamos el primer resultado (el más relevante)
      const video = data.result.search_data[0];

      let txt = `✨ *RESULTADO ENCONTRADO* ✨\n\n`;
      txt += `📝 *Título:* ${video.title || 'Sin descripción'}\n`;
      txt += `👤 *Autor:* ${video.author.nickname} (@${video.author.fullname})\n`;
      txt += `⏱️ *Duración:* ${video.duration}s\n`;
      txt += `📅 *Fecha:* ${video.taken_at}\n\n`;
      
      txt += `📊 *ESTADÍSTICAS*\n`;
      txt += `👀 *Vistas:* ${video.stats.views}\n`;
      txt += `❤️ *Likes:* ${video.stats.likes}\n`;
      txt += `💬 *Comentarios:* ${video.stats.comment}\n`;
      txt += `↪️ *Compartidos:* ${video.stats.share}\n\n`;
      
      txt += `🎵 *Música:* ${video.music_info.title}\n`;
      txt += `🔗 *Link:* https://www.tiktok.com/@${video.author.nickname}/video/${video.video_id}\n\n`;
      txt += `> *Para descargar el video usa:* ${usedPrefix}tt ${video.video_id}`;

      // Enviamos la imagen de portada con la info detallada
      await conn.sendMessage(m.chat, { 
        image: { url: video.cover }, 
        caption: txt 
      }, { quoted: m });
      
      await m.react('✅');
    } else {
      await m.react('✖️');
      await conn.reply(m.chat, 'No se encontró información para esa búsqueda.', m);
    }
  } catch (error) {
    console.error('Error en TikTok Search Info:', error);
    await m.react('✖️');
    await conn.reply(m.chat, 'Hubo un error al obtener la información. Intenta de nuevo.', m);
  }
};

handler.tags = ['info'];
handler.help = ['tkinfo *<búsqueda>*'];
handler.command = ['tkinfo', 'tiktokinfo', 'tsinfo'];

export default handler;
