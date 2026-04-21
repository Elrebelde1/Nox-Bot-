import axios from 'axios';
// Intentamos importar desde la ruta correcta (un nivel arriba de plugins)
import { uploadFile } from '../lib/uploadFile.js'; 

let handler = async (m, { conn, prefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply(`📸 Responde a una imagen con el comando *${prefix}${command}* para mejorar su calidad.`);
    if (!mime.startsWith('image')) return m.reply(`⚠️ Solo se admiten imágenes.`);

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // Descargamos el buffer de la imagen
    const media = await q.download();

    // Subimos la imagen para obtener una URL (necesaria para la API)
    let urlMedia;
    try {
        urlMedia = await uploadFile(media);
    } catch (err) {
        // Si falla uploadFile, intentamos con otro método común en estos bots
        const { uploadImage } = await import('../lib/uploadImage.js');
        urlMedia = await uploadImage(media);
    }

    // Configuración de la API Sylphy
    const apiKey = "sylphy-6f150d";
    const scale = "2"; 
    const apiUrl = `https://sylphyy.xyz/tools/upscale?url=${encodeURIComponent(urlMedia)}&scale=${scale}&api_key=${apiKey}`;

    const response = await axios.get(apiUrl);
    const result = response.data;

    if (result.status && result.result && result.result.url) {
      const enhancedUrl = result.result.url;
      const caption = `✨ *Imagen Mejorada* ✨\n\n⚙️ *Escala:* ${scale}x\n🔥 *By Barboza x Sasuke*`;

      await conn.sendMessage(m.chat, {
        image: { url: enhancedUrl },
        caption
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      // Manejo del error 500 o fallos de la API
      const msgError = result.result?.message || "El servidor de la API no pudo procesar la imagen.";
      throw new Error(msgError);
    }

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await m.reply(`⚠️ *Error:* ${e.message}`);
  }
};

handler.help = ['hd'];
handler.tags = ['ai', 'tools'];
handler.command = ['hd', 'upscale', 'remini'];

export default handler;
