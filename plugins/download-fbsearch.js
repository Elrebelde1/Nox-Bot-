import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*¿Qué deseas buscar?* 🔍\n\nUso:\n1. *Descargar:* ${usedPrefix + command} <enlace>\n2. *Buscar videos:* ${usedPrefix + command} <nombre del video>`, m);
  }

  await m.react('🕒');

  // CASO 1: DESCARGA (Si el texto contiene un enlace de Facebook)
  if (text.match(/facebook\.com|fb\.watch/g)) {
    try {
      const apiDl = await fetch(`https://api.delirius.store/download/facebook?url=${encodeURIComponent(text)}`);
      const resDl = await apiDl.json();

      if (!resDl.status || !resDl.data) {
        await m.react('❌');
        return conn.reply(m.chat, '*`❌ Error: No se pudo obtener el video.`*', m);
      }

      // Intentar obtener HD, si no, SD
      const videoUrl = resDl.data.urls.find(v => v.hd)?.hd || resDl.data.urls[0].sd;
      
      await m.react('✅');
      return await conn.sendMessage(m.chat, { 
        video: { url: videoUrl }, 
        caption: `*🎬 VIDEO DESCARGADO*\n\n✅ *Calidad:* ${resDl.data.urls[0].hd ? 'Alta Definición (HD)' : 'Estándar (SD)'}`,
        fileName: 'video_fb.mp4' 
      }, { quoted: m });

    } catch (e) {
      await m.react('❌');
      return conn.reply(m.chat, '*`⚠️ Error al procesar la descarga del video.`*', m);
    }
  }

  // CASO 2: BÚSQUEDA DE 6 VIDEOS (Si el texto es una consulta)
  try {
    const apiSearch = await fetch(`https://api.delirius.store/search/facebooksearch?query=${encodeURIComponent(text)}`);
    const resSearch = await apiSearch.json();

    if (!resSearch.status || !resSearch.data || resSearch.data.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, '*`🚫 No encontré videos relacionados con tu búsqueda.`*', m);
    }

    let searchMsg = `*🎬 RESULTADOS DE BÚSQUEDA: ${text.toUpperCase()}*\n`;
    searchMsg += `_Mostrando los mejores 6 videos encontrados._\n\n---\n\n`;

    // Limitamos a 6 resultados
    const resultados = resSearch.data.slice(0, 6);

    resultados.forEach((item, index) => {
      searchMsg += `*${index + 1}. 📌 Título:* ${item.title || 'Video de Facebook'}\n`;
      searchMsg += `*🔗 Enlace:* ${item.url}\n`;
      searchMsg += `*📝 Descripción:* ${item.description ? item.description.substring(0, 100) + '...' : 'Sin descripción'}\n\n`;
    });

    searchMsg += `---\n💡 *Para descargar:* Copia el enlace de arriba y pégalo de nuevo en este chat.`;

    await m.react('✅');
    await conn.reply(m.chat, searchMsg, m);

  } catch (e) {
    await m.react('❌');
    conn.reply(m.chat, '*`⚠️ Hubo un error al realizar la búsqueda en los servidores.`*', m);
  }
};

handler.help = ['fbsearch <enlace/búsqueda>'];
handler.tags = ['downloader'];
handler.command = /^(fb|fbsearch|facebook)$/i; // Añadí alias comunes
handler.estrellas = 2;

export default handler;
