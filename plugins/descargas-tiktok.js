import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  // Manejadores para los botones
  if (command === 'tt_vid' || command === 'tt_aud') {
    const res = await fetch(`https://www.tikwm.com/api/?url=${text}`);
    const json = await res.json();

    if (command === 'tt_vid') {
      const videoHd = json.data.hdplay || json.data.play; 
      return await conn.sendMessage(m.chat, { 
        video: { url: videoHd }, 
        caption: `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ✅  *TIKTOK HD LISTO* \n╚════════════════════╝` 
      }, { quoted: m });
    } else {
      return await conn.sendMessage(m.chat, { 
        audio: { url: json.data.music }, 
        mimetype: 'audio/mp4', 
        fileName: 'tiktok.mp3' 
      }, { quoted: m });
    }
  }

  if (!text) {
    return conn.reply(m.chat, '╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ❌  *ERROR DE ENLACE* \n╚════════════════════╝\n\n¡Necesito un enlace de TikTok!', m);
  }

  // Limpieza automática del link largo que pasaste
  let cleanUrl = text.split('?')[0];

  if (!cleanUrl.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) {
    return conn.reply(m.chat, '🤔 Parece que el enlace no es de TikTok válido.', m);
  }

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result || result.code !== 0 || !result.data || !result.data.play) {
      return conn.reply(m.chat, '❌ No pude descargar el video. El enlace podría estar roto.', m);
    }

    const data = result.data;
    const author = data.author?.nickname || 'Desconocido';
    const description = data.title || 'Sin descripción';
    const duration = data.duration ? formatDuration(data.duration) : 'N/A';
    const size = data.size ? `${(data.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A';

    const caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   ✅  *TIKTOK ENCONTRADO* ╚════════════════════╝

👤 *Autor:* ${author}
📝 *Descripción:* ${description}
⏳ *Duración:* ${duration}
📏 *Tamaño:* ${size}

_Usa los botones para HD o Audio:_`.trim();

    const buttons = [
      { buttonId: `${usedPrefix}tt_vid ${cleanUrl}`, buttonText: { displayText: 'Video en HD 🎥' }, type: 1 },
      { buttonId: `${usedPrefix}tt_aud ${cleanUrl}`, buttonText: { displayText: 'Extraer Audio 🎵' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      video: { url: data.play },
      caption: caption,
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (error) {
    console.error('Error al descargar TikTok:', error);
    conn.reply(m.chat, '❌ ¡Oops! Algo salió mal con la conexión.', m);
  }
};

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

handler.command = /^(tiktok|tt|tt_vid|tt_aud)$/i;

export default handler;
