import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🚩 Ingresa lo que deseas buscar en TikTok.\n\nEjemplo:\n> *${usedPrefix + command} Matshuka*`,
      m
    );
  }

  await m.react('🔍');

  try {
    // Consulta a la API de Vreden
    const response = await axios.get(`https://api.vreden.my.id/api/tiktoksearch?query=${encodeURIComponent(text)}`);
    const data = response.data;

    if (data.status && data.result?.search_data?.length > 0) {
      
      // Tomamos los primeros 5 resultados para dar variedad informativa
      const resultados = data.result.search_data.slice(0, 5);
      
      for (let i = 0; i < resultados.length; i++) {
        const video = resultados[i];

        let txt = `✨ *RESULTADO ${i + 1}* ✨\n\n`;
        txt += `📝 *Título:* ${video.title || 'Sin descripción'}\n`;
        txt += `👤 *Autor:* ${video.author.nickname} (@${video.author.fullname})\n`;
        txt += `⏱️ *Duración:* ${video.duration}s\n`;
        txt += `📅 *Fecha:* ${video.taken_at}\n\n`;
        
        txt += `📊 *ESTADÍSTICAS*\n`;
        txt += `👀 *Vistas:* ${video.stats.views}\n`;
        txt += `❤️ *Likes:* ${video.stats.likes}\n`;
        txt += `💬 *Comentarios:* ${video.stats.comment}\n`;
        txt += `↪️ *Compartidos:* ${video.stats.share}\n`;
        txt += `📥 *Descargas:* ${video.stats.download}\n\n`;
        
        txt += `🎵 *MÚSICA:* ${video.music_info.title}\n`;
        txt += `🔗 *Link Video:* https://www.tiktok.com/@${video.author.nickname}/video/${video.video_id}\n\n`;
        txt += `> *Para descargar usa:* ${usedPrefix}tt ${video.video_id}`;

        // Enviamos la imagen de portada con la información
        await conn.sendMessage(m.chat, { 
          image: { url: video.cover }, 
          caption: txt 
        }, { quoted: m });
      }
      
      await m.react('✅');
    } else {
      await m.react('✖️');
      await conn.reply(m.chat, 'No se encontró información para esa búsqueda.', m);
    }
  } catch (error) {
    console.error('Error en TikTok Search Info:', error);
    await m.react('✖️');
    await conn.reply(m.chat, 'Hubo un error al obtener la información.', m);
  }
};

handler.tags = ['info'];
handler.help = ['tkinfo *<busqueda>*'];
handler.command = ['tkinfo', 'tiktokinfo', 'tsinfo'];

export default handler;
