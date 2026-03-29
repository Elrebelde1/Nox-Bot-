import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*⚠️ ¡Falta el enlace!* \n\nUso correcto:\n*${usedPrefix + command}* https://www.mediafire.com/file/xxxx`, m);
  }

  if (!text.match(/mediafire\.com\//i)) {
    return conn.reply(m.chat, `*❌ El enlace no es de MediaFire.*`, m);
  }

  await m.react('⏳');
  
  try {
    const apiUrl = `https://api.delirius.store/download/mediafire?url=${encodeURIComponent(text)}`;
    const { data: res } = await axios.get(apiUrl);

    if (!res.status || !res.data) {
      throw new Error();
    }

    const files = Array.isArray(res.data) ? res.data : [res.data];

    for (let file of files) {
      const downloadUrl = file.link;
      if (!downloadUrl) continue;

      let mimeType = file.mime || 'application/octet-stream';
      
      if (file.filename.endsWith('.zip')) mimeType = 'application/zip';
      if (file.filename.endsWith('.jpg') || file.filename.endsWith('.jpeg')) mimeType = 'image/jpeg';
      if (file.filename.endsWith('.png')) mimeType = 'image/png';
      if (file.filename.endsWith('.mp4')) mimeType = 'video/mp4';
      if (file.filename.endsWith('.pdf')) mimeType = 'application/pdf';

      let cap = `
┏━━━━━━━⬣ **MEDIAFIRE** ⬣━━━━━━━┓
┃ 📁 **Nombre:** ${file.filename}
┃ ⚖️ **Tamaño:** ${file.size}
┃ ⚙️ **Tipo:** ${mimeType}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Creador: Barboza Ofc`.trim();

      await conn.sendMessage(m.chat, {
        document: { url: downloadUrl },
        fileName: file.filename,
        mimetype: mimeType,
        caption: cap
      }, { quoted: m });
    }

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
