import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply(`📸 Responde a una imagen con el comando *${usedPrefix}${command}* para mejorar la calidad.`);
    if (!mime.startsWith('image')) return m.reply(`⚠️ Solo se admiten imágenes.`);

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // 1. Descargar la imagen
    const media = await q.download();
    
    // 2. Subir a Telegra.ph (Función integrada para evitar errores de rutas)
    const urlMedia = await uploadToTelegraph(media);

    // 3. Llamada a la API de Sylphy
    const apiKey = "sylphy-6f150d";
    const scale = "2"; 
    const apiUrl = `https://sylphyy.xyz/tools/upscale?url=${encodeURIComponent(urlMedia)}&scale=${scale}&api_key=${apiKey}`;

    const { data } = await axios.get(apiUrl);

    if (data.status && data.result && data.result.url) {
      const caption = `✨ *Imagen Mejorada con Éxito*\n\n⚙️ *Escala:* ${scale}x\n🔥 *By Barboza x Sasuke*`;

      await conn.sendMessage(m.chat, {
        image: { url: data.result.url },
        caption
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(data.result?.message || "La API no devolvió una URL válida.");
    }

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await m.reply(`⚠️ *Error:* ${e.message || "No se pudo procesar la imagen."}`);
  }
};

/**
 * Función para subir imágenes a Telegra.ph sin depender de archivos externos
 */
async function uploadToTelegraph(buffer) {
  const { ext } = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  form.append('file', buffer, `tmp.${ext}`);
  
  const res = await axios.post('https://telegra.ph/upload', form, {
    headers: { ...form.getHeaders() }
  });
  
  return 'https://telegra.ph' + res.data[0].src;
}

handler.help = ['hd'];
handler.tags = ['ai'];
handler.command = /^(hd|upscale|remini)$/i;

export default handler;
