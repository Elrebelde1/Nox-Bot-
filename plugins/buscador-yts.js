import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.trim()) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <término de búsqueda>\n📍 *Ejemplo:* ${usedPrefix + command} Messi goles`);
  }

  const query = text.trim();
  const url = `https://api.dorratz.com/v3/yt-search?query=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.status || !json.data || json.data.length === 0) {
      return m.reply("❌ No se encontraron resultados.");
    }

    const videos = json.data.slice(0, 5);

    for (const video of videos) {
      const caption = `
╭─🎶 *Sasuke Bot - Audio YouTube* 🎶─╮
│ 🎵 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration}
│ 📅 *Publicado:* ${video.publishedAt}
│ 👁️ *Vistas:* ${video.views}
│ 🔗 *Enlace:* ${video.url}
│
│ 🎧 *Para descargar:*
│ .ytmp3 ${video.url}
│ .ytmp4 ${video.url}
╰──────────────────────────────────╯

> © Código Oficial de Barboza MD™
`;

      await conn.sendMessage(
        m.chat,
        { image: { url: video.thumbnail }, caption },
        { quoted: m }
      );
    }
  } catch (e) {
    m.reply("❌ Ocurrió un error.");
  }
};

handler.help = ["ytsearch", "yts <texto>"];
handler.tags = ["búsquedas"];
handler.command = ["ytsearch", "yts"];

export default handler;
