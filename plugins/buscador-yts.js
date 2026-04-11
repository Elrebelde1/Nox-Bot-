import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <término de búsqueda>\n📍 *Ejemplo:* ${usedPrefix + command} Twice`);
  }

  const query = text.trim();
  // Nueva URL de la API de Delirius
  const url = `https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    // Verificación basada en la estructura de la API de Delirius (status y data)
    if (!json.status || !json.data || json.data.length === 0) {
      return m.reply("❌ No se encontraron resultados.");
    }

    // Tomamos los primeros 5 resultados
    const videos = json.data.slice(0, 5);

    for (const video of videos) {
      // Ajuste de variables según el JSON de Delirius
      const caption = `
╭─🎶 *Sasuke Bot - YouTube Search* 🎶─╮
│ 🎵 *Título:* ${video.title}
│ 👤 *Canal:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration}
│ 📅 *Publicado:* ${video.publishedAt}
│ 👁️ *Vistas:* ${video.views.toLocaleString()}
│ 🔗 *Enlace:* ${video.url}
│
│ 🎧 *Para descargar:*
│ ${usedPrefix}ytmp3 ${video.url}
│ ${usedPrefix}ytmp4 ${video.url}
╰──────────────────────────────────╯

> © Código Adaptado de Delirius API
`;

      await conn.sendMessage(
        m.chat,
        { 
          image: { url: video.image || video.thumbnail }, 
          caption 
        },
        { quoted: m }
      );
    }
  } catch (e) {
    console.error(e);
    m.reply("❌ Ocurrió un error al conectar con la API de Delirius.");
  }
};

handler.help = ["ytsearch", "yts <texto>"];
handler.tags = ["búsquedas"];
handler.command = ["ytsearch", "yts"];

export default handler;
