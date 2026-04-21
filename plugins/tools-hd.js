import axios from 'axios';
import { uploadFile } from '../lib/uploadFile.js';

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply(`📸 Responde a una imagen con el comando *${usedPrefix}${command}*`);
    if (!mime.startsWith('image')) return m.reply(`⚠️ Solo se admiten imágenes.`);

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const media = await q.download();
    
    // Subimos la imagen para obtener el enlace
    const urlMedia = await uploadFile(media);

    // Parámetros de la API
    const apiKey = "sylphy-6f150d";
    const scale = "2"; 
    
    // Construimos la URL de forma más segura
    const apiUrl = `https://sylphyy.xyz/tools/upscale?url=${encodeURIComponent(urlMedia)}&scale=${scale}&api_key=${apiKey}`;

    const response = await axios.get(apiUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    const data = response.data;

    if (data.status && data.result && data.result.url) {
      await conn.sendMessage(m.chat, {
        image: { url: data.result.url },
        caption: `✨ *Imagen Mejorada* ✨\n\n⚙️ *Escala:* ${scale}x\n🔥 *By Barboza x Sasuke*`
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(data.result?.message || "La API rechazó la imagen.");
    }

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    
    // Si da error 400, explicamos por qué puede ser
    if (e.response && e.response.status === 400) {
        return m.reply("⚠️ *Error 400:* La API no acepta esta imagen. Puede que el enlace generado sea privado o inválido.");
    }
    
    await m.reply(`⚠️ *Error:* ${e.message}`);
  }
};

handler.help = ['hd'];
handler.tags = ['ai'];
handler.command = /^(hd|upscale|remini)$/i;

export default handler;
