import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*¿Qué deseas hacer?* ❤️‍🔥\n\n1. *Descargar:* ${usedPrefix + command} <link>\n2. *Buscar:* ${usedPrefix + command} <nombre/texto>`, m);
  }

  await m.react('🕒');

  // CASO 1: DESCARGA (Si el texto contiene un link)
  if (text.match(/facebook\.com|fb\.watch/g)) {
    try {
      const apiDl = await fetch(`https://api.delirius.store/download/facebook?url=${text}`);
      const resDl = await apiDl.json();

      if (!resDl.status || !resDl.urls) {
        await m.react('❌');
        return conn.reply(m.chat, '*`❌ No se pudo descargar el video.`*', m);
      }

      const videoUrl = resDl.urls[0].hd || resDl.urls[1].sd;
      await m.react('✅');
      return await conn.sendMessage(m.chat, { 
        video: { url: videoUrl }, 
        caption: `*✨ Facebook Downloader*\n\n> ${dev}`,
        fileName: 'fb.mp4' 
      }, { quoted: m });

    } catch (e) {
      await m.react('❌');
      return conn.reply(m.chat, '*`Error al procesar la descarga.`*', m);
    }
  }

  // CASO 2: BÚSQUEDA (Si el texto NO es un link)
  try {
    const apiSearch = await fetch(`https://api.delirius.store/search/facebooksearch?query=${encodeURIComponent(text)}`);
    const resSearch = await apiSearch.json();

    if (!resSearch.status || resSearch.data.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, '*`No se encontraron resultados para tu búsqueda.`*', m);
    }

    let searchMsg = `*🔎 RESULTADOS DE: ${text.toUpperCase()}*\n\n`;
    
    // Listamos los primeros 5 resultados para no saturar
    resSearch.data.slice(0, 5).forEach((item, index) => {
      searchMsg += `*${index + 1}.* ${item.title}\n`;
      searchMsg += `🔗 *Link:* ${item.url}\n`;
      searchMsg += `📝 *Info:* ${item.description}\n\n`;
    });

    searchMsg += `> *Consejo:* Copia y pega el link de arriba para descargarlo.`;

    await m.react('✅');
    await conn.reply(m.chat, searchMsg, m);

  } catch (e) {
    await m.react('❌');
    conn.reply(m.chat, '*`Error al realizar la búsqueda.`*', m);
  }
};

handler.help = ['fb <link o búsqueda>'];
handler.tags = ['downloader'];
handler.command = /^(fbsearch)$/i;
handler.estrellas = 2;

export default handler;
