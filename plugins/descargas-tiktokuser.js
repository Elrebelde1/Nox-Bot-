import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🚩 *¿Qué deseas buscar en TikTok?*\n\nIngresa un término de búsqueda.\n\n*Ejemplo:*\n> *${usedPrefix + command} @sebastin.barboza2*`,
      m
    );
  }

  await m.react('🔍');

  try {
    // URL actualizada a la versión v1 que pasaste
    const url = `https://api.vreden.my.id/api/v1/search/tiktok?query=${encodeURIComponent(text)}`;
    const response = await axios.get(url);
    const res = response.data;

    // Ajuste según la estructura del JSON: result -> search_data
    if (res.status && res.result?.search_data?.length > 0) {
      
      const video = res.result.search_data[0];

      let txt = `✨ *TIKTOK INFO* ✨\n\n`;
      txt += `📝 *Título:* ${video.title || 'Sin descripción'}\n`;
      txt += `👤 *Autor:* ${video.author.nickname} (@${video.author.fullname})\n`;
      txt += `⏱️ *Duración:* ${video.duration}s\n`;
      txt += `📅 *Subido:* ${video.taken_at}\n\n`;
      
      txt += `📊 *ESTADÍSTICAS*\n`;
      txt += `👀 *Vistas:* ${video.stats.views}\n`;
      txt += `❤️ *Likes:* ${video.stats.likes}\n`;
      txt += `💬 *Comentarios:* ${video.stats.comment}\n`;
      txt += `↪️ *Compartidos:* ${video.stats.share}\n`;
      txt += `📥 *Descargas:* ${video.stats.download}\n\n`;
      
      txt += `🎵 *Audio:* ${video.music_info.title}\n`;
      txt += `🔗 *Link:* https://www.tiktok.com/@${video.author.nickname}/video/${video.video_id}\n\n`;
      txt += `> *Para descargar usa:* ${usedPrefix}tt ${video.video_id}`;

      // Enviamos la miniatura del video
      await conn.sendMessage(m.chat, { 
        image: { url: video.cover }, 
        caption: txt 
      }, { quoted: m });
      
      await m.react('✅');
    } else {
      await m.react('✖️');
      await conn.reply(m.chat, 'No se encontró información. Intenta con otra palabra clave.', m);
    }
  } catch (error) {
    console.error('Error en TikTok Search:', error);
    await m.react('✖️');
    await conn.reply(m.chat, 'Hubo un error al conectar con la API.', m);
  }
};

handler.tags = ['info'];
handler.help = ['tkinfo *<búsqueda>*'];
handler.command = ['tkinfo', 'tiktokinfo', 'tsinfo'];

export default handler;
