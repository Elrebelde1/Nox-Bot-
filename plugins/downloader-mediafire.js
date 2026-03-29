import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*⚠️ ¡Falta el enlace!* \n\nUso correcto:\n*${usedPrefix + command}* https://www.mediafire.com/file/xxxx`, m);
  }

  if (!text.match(/mediafire\.com\//i)) {
    return conn.reply(m.chat, `*❌ El enlace no es válido de MediaFire.*`, m);
  }

  await m.react('⏳');
  
  try {
    const apiUrl = `https://api.delirius.store/download/mediafire?url=${encodeURIComponent(text)}`;
    const { data: res } = await axios.get(apiUrl);

    if (!res.status || !res.data) {
      throw new Error("No se obtuvo respuesta de la API.");
    }

    // La API de Delirius devuelve un array en 'data' tanto para archivos como para carpetas
    const files = Array.isArray(res.data) ? res.data : [res.data];

    for (let file of files) {
      // Usamos 'link' que es la URL de descarga directa que devuelve Delirius
      const downloadUrl = file.link;
      
      if (!downloadUrl) continue;

      let cap = `
┏━━━━━━━⬣ **MEDIAFIRE** ⬣━━━━━━━┓
┃ 📁 *Nombre:* ${file.filename}
┃ ⚖️ *Tamaño:* ${file.size}
┃ ⚙️ *Tipo:* ${file.mime}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Creador: Barboza Ofc`.trim();

      await conn.sendMessage(m.chat, {
        document: { url: downloadUrl },
        fileName: file.filename,
        mimetype: file.mime || 'application/octet-stream',
        caption: cap
      }, { quoted: m });
    }

    await m.react('✅');

  } catch (e) {
    await m.react('✖️');
    conn.reply(m.chat, `*❌ Error al procesar con Delirius API.*`, m);
  }
};

handler.help = ['mediafire <url>'];
handler.tags = ['downloader'];
handler.command = /^(mediafire|mf|mfdl)$/i;

export default handler;
