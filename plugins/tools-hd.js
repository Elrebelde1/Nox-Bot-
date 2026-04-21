import axios from 'axios';

let handler = async (m, { conn, prefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply(`📸 Responde a una imagen con el comando *${prefix}${command}* para mejorar su calidad.`);
    if (!mime.startsWith('image')) return m.reply(`⚠️ Solo se admiten imágenes.`);

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // 1. Descargar la imagen y subirla a un servidor temporal (qu.ax)
    // Nota: La API de Sylphy pide una URL, no el archivo directo.
    const media = await q.download();
    const { uploadFile } = await import('./lib/uploadFile.js'); // Asegúrate de tener este helper
    const urlMedia = await uploadFile(media);

    // 2. Llamada a la API de Sylphy
    const apiKey = "sylphy-6f150d";
    const scale = "2"; // Puedes cambiarlo a 4 si la API lo soporta
    const apiUrl = `https://sylphyy.xyz/tools/upscale?url=${encodeURIComponent(urlMedia)}&scale=${scale}&api_key=${apiKey}`;

    const response = await axios.get(apiUrl);
    const result = response.data;

    if (result.status && result.result.url) {
      const enhancedUrl = result.result.url;
      const caption = `✨ *Imagen Mejorada* ✨\n\n⚙️ *Escala:* ${scale}x\n🔥 *By Barboza x Sasuke*`;

      await conn.sendMessage(m.chat, {
        image: { url: enhancedUrl },
        caption
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(result.result.message || "Error desconocido");
    }

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await m.reply(`⚠️ *Error:* ${e.message || "No se pudo procesar la imagen."}`);
  }
};

handler.help = ['hd'];
handler.tags = ['ai', 'tools'];
handler.command = ['hd', 'upscale', 'remini'];

export default handler;
