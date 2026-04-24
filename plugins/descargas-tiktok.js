import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import fetch from "node-fetch";

// Cargamos tu imagen miniurl.jpg
const imgPath = join(process.cwd(), 'storage', 'img', 'miniurl.jpg');
let imgLocal;
try {
  imgLocal = existsSync(imgPath) ? readFileSync(imgPath) : Buffer.alloc(0);
} catch (e) {
  imgLocal = Buffer.alloc(0);
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Si el comando es una respuesta de botón (interna)
  if (command === 'tt_vid' || command === 'tt_aud') {
    const type = command === 'tt_vid' ? 'video' : 'audio';
    const res = await fetch(`https://www.tikwm.com/api/?url=${text}`);
    const json = await res.json();
    if (type === 'video') {
      return await conn.sendMessage(m.chat, { video: { url: json.data.hdplay || json.data.play }, caption: `✅ *Video HD descargado*` }, { quoted: m });
    } else {
      return await conn.sendMessage(m.chat, { audio: { url: json.data.music }, mimetype: 'audio/mp4', fileName: 'tiktok.mp3' }, { quoted: m });
    }
  }

  // Validación inicial
  if (!text) return conn.reply(m.chat, '❌ ¡Necesito un enlace de TikTok!', m);
  if (!text.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) return conn.reply(m.chat, '🤔 Enlace no válido.', m);

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result || result.code !== 0) return conn.reply(m.chat, '❌ No se pudo obtener el video.', m);

    const data = result.data;
    const caption = `
✅ *TikTok Encontrado*

👤 *Autor:* ${data.author.nickname}
📝 *Descripción:* ${data.title || 'Sin descripción'}
⏳ *Duración:* ${data.duration}s
📏 *Tamaño:* ${(data.size / (1024 * 1024)).toFixed(2)} MB

Elija una opción para descargar:`.trim();

    // Tu fkontak personalizado
    const fkontak = {
      key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "AlienMenu" },
      message: {
        locationMessage: {
          name: "*TikTok Downloader 🌀*",
          jpegThumbnail: imgLocal,
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Sasuke;;;\nFN:Sasuke Bot\nORG:Barboza Developers\nEND:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    };

    // Tus botones personalizados
    const buttons = [
      { buttonId: `${usedPrefix}tt_vid ${text}`, buttonText: { displayText: 'Video en HD' }, type: 1 },
      { buttonId: `${usedPrefix}tt_aud ${text}`, buttonText: { displayText: 'Extraer Audio' }, type: 1 }
    ];

    const buttonMessage = {
      image: imgLocal,
      caption: caption,
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4
    };

    await conn.sendMessage(m.chat, buttonMessage, { quoted: fkontak });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '❌ Ocurrió un error inesperado.', m);
  }
};

handler.command = /^(tiktok|tt|tt_vid|tt_aud)$/i;

export default handler;
