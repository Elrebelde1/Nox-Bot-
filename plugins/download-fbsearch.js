import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*¿Qué video buscas?* 🎥\n\nEscribe el nombre del video que quieres encontrar.`, m);
  }

  await m.react('🕒');

  try {
    // Añadimos "video español" a la búsqueda para forzar mejores resultados
    const query = encodeURIComponent(text + " video español");
    const apiSearch = await fetch(`https://api.delirius.store/search/facebooksearch?query=${query}`);
    const resSearch = await apiSearch.json();

    if (!resSearch.status || !resSearch.data || resSearch.data.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, '*`🚫 No encontré videos con ese nombre.`*', m);
    }

    // Filtrar para ignorar perfiles/grupos y priorizar links de video
    const soloVideos = resSearch.data.filter(item => 
      item.url.includes('video') || 
      item.url.includes('watch') || 
      item.url.includes('reel') ||
      item.url.includes('posts')
    );

    let searchMsg = `*🎬 VIDEOS ENCONTRADOS: ${text.toUpperCase()}*\n`;
    searchMsg += `_Resultados en español (Top 6)_\n\n---\n\n`;

    // Tomamos los primeros 6 resultados del filtro
    const seleccion = soloVideos.slice(0, 6);

    seleccion.forEach((item, index) => {
      // Limpiamos palabras en inglés comunes en los títulos de Facebook
      let titulo = item.title
        .replace(/\| Facebook/gi, '')
        .replace(/Log into Facebook/gi, 'Video de Facebook')
        .replace(/others named/gi, 'otros llamados')
        .trim();

      // Traducimos términos comunes de la descripción
      let desc = item.description || ''
        .replace(/likes/gi, 'me gusta')
        .replace(/talking about this/gi, 'personas hablando de esto')
        .replace(/views/gi, 'reproducciones');

      searchMsg += `*${index + 1}. 🎥 Título:* ${titulo}\n`;
      searchMsg += `*🔗 Enlace:* ${item.url}\n`;
      searchMsg += `*📝 Info:* ${desc.substring(0, 100)}...\n\n`;
    });

    searchMsg += `---\n💡 *Para descargar:* Copia el link y pégalo aquí.`;

    await m.react('✅');
    await conn.reply(m.chat, searchMsg, m);

  } catch (e) {
    await m.react('❌');
    conn.reply(m.chat, '*`⚠️ Error en la búsqueda de videos.`*', m);
  }
};

handler.help = ['fbsearch <búsqueda>'];
handler.tags = ['downloader'];
handler.command = ['fbsearch','fb']
handler.estrellas = 2;

export default handler;
