import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

global.emoji = '🍮';
global.emoji2 = '🍮';

let handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!/image/.test(mime)) return m.reply(`${emoji} Responde a una imagen con *setbanner*.`);

  let { key } = await conn.sendMessage(m.chat, { text: `${emoji} Subiendo...` }, { quoted: m });

  try {
    const media = await q.download();
    if (!media) throw new Error('Error al descargar');

    const filetype = await fileTypeFromBuffer(media);
    if (!filetype || !filetype.mime.startsWith('image/')) return m.reply(`${emoji2} No es una imagen válida.`);

    let url;
    try {
      url = await uploadToQuax(media);
    } catch (e1) {
      try {
        url = await uploadToTelegraph(media);
      } catch (e2) {
        throw new Error("Servidores caídos.");
      }
    }

    if (!global.db.data.settings) global.db.data.settings = {};
    if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {};

    global.db.data.settings[conn.user.jid].banner = url;

    await conn.sendMessage(m.chat, { 
      image: media, 
      caption: `${emoji} *Banner actualizado:*\n${url}`,
      edit: key
    });

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `🪐 Error: ${e.message}`, edit: key });
  }
};

handler.help = ['setbanner'];
handler.tags = ['herramientas'];
handler.command = ['setbanner'];

export default handler;

async function uploadToQuax(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' };
  const form = new FormData();
  form.set("files[]", new Blob([buffer], { type: mime }), `file.${ext}`);

  const resp = await fetch("https://qu.ax/upload.php", {
    method: "POST",
    body: form,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const resText = await resp.text();
  try {
    const json = JSON.parse(resText);
    if (json.success && json.files?.[0]?.url) return json.files[0].url;
    throw new Error();
  } catch {
    throw new Error();
  }
}

async function uploadToTelegraph(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' };
  const form = new FormData();
  form.set("file", new Blob([buffer], { type: mime }), `file.${ext}`);

  const resp = await fetch("https://telegra.ph/upload", {
    method: "POST",
    body: form
  });

  const resText = await resp.text();
  try {
    const json = JSON.parse(resText);
    if (json[0]?.src) return "https://telegra.ph" + json[0].src;
    throw new Error();
  } catch {
    throw new Error();
  }
}