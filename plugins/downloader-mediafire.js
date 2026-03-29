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
    if (text.includes('/folder/')) {
      const folderApi = `https://api.delirius.store/download/mediafire?url=${encodeURIComponent(text)}`;
      const { data: folderData } = await axios.get(folderApi);

      if (!folderData.status || !folderData.data) throw new Error();

      await m.reply(`📂 *Carpeta detectada:* Procesando ${folderData.data.length} archivos...`);

      for (let file of folderData.data) {
        // Obtenemos el link directo usando la API de Sylphy para cada link de la carpeta
        const { data: fileRes } = await axios.get(`https://sylphy.xyz/download/mediafire?url=${encodeURIComponent(file.link)}&api_key=sylphy-6f150d`);
        
        if (fileRes.status) {
          await conn.sendMessage(m.chat, {
            document: { url: fileRes.result.download },
            fileName: file.filename,
            mimetype: file.mime || 'application/octet-stream',
            caption: `📁 *Nombre:* ${file.filename}\n⚖️ *Tamaño:* ${file.size}\n\nCreador: Barboza Ofc`
          }, { quoted: m });
        }
      }
    } else {
      const fileApi = `https://sylphy.xyz/download/mediafire?url=${encodeURIComponent(text)}&api_key=sylphy-6f150d`;
      const { data } = await axios.get(fileApi);

      if (!data.status || !data.result) throw new Error();

      const { title, size, ext, download, mime } = data.result;

      let cap = `
┏━━━━━━━⬣ **MEDIAFIRE** ⬣━━━━━━━┓
┃ 📁 *Nombre:* ${title || 'Archivo'}
┃ ⚖️ *Tamaño:* ${size || 'Desconocido'}
┃ ⚙️ *Extensión:* ${ext || 'bin'}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Creador: Barboza Ofc`.trim();

      await conn.sendMessage(m.chat, {
        document: { url: download },
        fileName: title,
        mimetype: mime || `application/${ext || 'octet-stream'}`,
        caption: cap
      }, { quoted: m });
    }

    await m.react('✅');

  } catch (e) {
    await m.react('✖️');
    conn.reply(m.chat, `*❌ Error al procesar el archivo o carpeta.*`, m);
  }
};

handler.help = ['mediafire <url>'];
handler.tags = ['downloader'];
handler.command = /^(mediafire|mf|mfdl)$/i;

export default handler;
