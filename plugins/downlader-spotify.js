import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*⚠️ ¡Falta el nombre o link!* \n\nUso correcto:\n*${usedPrefix + command}* Twice - Moonlight`, m);

  await m.react('⏳');

  try {
    let trackUrl = text;

    // Si no es un link, buscamos la canción primero
    if (!text.match(/spotify\.com/i)) {
      const { data: search } = await axios.get(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`);
      
      if (!search.status || !search.data?.[0]) {
        await m.react('✖️');
        return conn.reply(m.chat, `*❌ No se encontró la canción.*`, m);
      }
      trackUrl = search.data[0].url;
    }

    // Descarga directa con la API de Delirius
    const { data: dl } = await axios.get(`https://api.delirius.store/download/spotify?url=${encodeURIComponent(trackUrl)}`);

    if (!dl.status || !dl.data) {
      await m.react('✖️');
      return conn.reply(m.chat, `*❌ Error al obtener el archivo de audio.*`, m);
    }

    const { title, author, image, download } = dl.data;

    let cap = `
┏━━━━━━━⬣ **SPOTIFY** ⬣━━━━━━━┓
┃ 🎶 **Título:** ${title}
┃ 👤 **Artista:** ${author}
┃ ⚙️ **Tipo:** Audio/Mp3
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Creador: Barboza Ofc`.trim();

    // Enviar imagen con info
    await conn.sendMessage(m.chat, { 
      image: { url: image }, 
      caption: cap 
    }, { quoted: m });

    // Enviar el audio
    await conn.sendMessage(m.chat, { 
      audio: { url: download }, 
      fileName: `${title}.mp3`, 
      mimetype: 'audio/mpeg' 
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    await m.react('✖️');
    conn.reply(m.chat, `*❌ Error crítico al procesar Spotify.*`, m);
  }
};

handler.help = ['spotify <nombre>'];
handler.tags = ['descargas'];
handler.command = /^(spotify|spt|sp|music)$/i;

export default handler;
