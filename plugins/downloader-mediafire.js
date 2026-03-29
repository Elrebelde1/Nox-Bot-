import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*⚠️ ¡Falta el enlace!* \n\nUso correcto:\n*${usedPrefix + command}* https://www.mediafire.com/file/xxxx`, m);
  }

  if (!text.match(/mediafire\.com\//i)) {
    return conn.reply(m.chat, `*❌ El enlace no parece ser de MediaFire.*`, m);
  }

  await m.react('⏳');
  
  try {
    const apiUrl = `https://sylphy.xyz/download/mediafire?url=${encodeURIComponent(text)}&api_key=sylphy-6f150d`;
    
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result) {
      throw new Error("No se pudo obtener una respuesta válida.");
    }

    const { title, size, ext, download } = data.result;

    let cap = `
┏━━━━━━━⬣ **MEDIAFIRE** ⬣━━━━━━━┓
┃ 📁 *Nombre:* ${title || 'Archivo'}
┃ ⚖️ *Tamaño:* ${size || 'Desconocido'}
┃ ⚙️ *Extensión:* ${ext || 'bin'}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Creador: Barboza Ofc`.trim();

    await conn.sendMessage(
      m.chat,
      {
        document: { url: download },
        fileName: title,
        mimetype: `application/${ext || 'octet-stream'}`,
        caption: cap
      },
      { quoted: m }
    );

    await m.react('✅');

  } catch (e) {
    await m.react('✖️');
    conn.reply(m.chat, `*❌ Error al procesar el archivo.*`, m);
  }
};

handler.help = ['mediafire <url>'];
handler.tags = ['downloader'];
handler.command = /^(mediafire|mf|mfdl)$/i;

export default handler;
