import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  // Manejadores para los botones
  if (command === 'tt_vid' || command === 'tt_aud') {
    const res = await fetch(`https://www.tikwm.com/api/?url=${text}`);
    const json = await res.json();
    
    if (command === 'tt_vid') {
      // AQUÍ SE CAMBIÓ: Prioriza hdplay para la mejor calidad
      const videoHd = json.data.hdplay || json.data.play; 
      return await conn.sendMessage(m.chat, { 
        video: { url: videoHd }, 
        caption: `✅ *Video en Alta Calidad extraído*` 
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
    return conn.reply(m.chat, '❌ ¡Necesito un enlace de TikTok! Por favor, proporciona uno después del comando.', m);
  }

  if (!text.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) {
    return conn.reply(m.chat, '🤔 Parece que el enlace no es de TikTok. Por favor, asegúrate de enviar un enlace válido.', m);
  }

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result || result.code !== 0 || !result.data || !result.data.play) {
      let errorMessage = '❌ No pude descargar el video.';
      if (result && result.msg) errorMessage += `\nDetalles: ${result.msg}`;
      return conn.reply(m.chat, errorMessage, m);
    }

    const data = result.data;
    const author = data.author?.nickname || 'Desconocido';
    const description = data.title || 'Sin descripción';
    const duration = data.duration ? formatDuration(data.duration) : 'N/A';
    const size = data.size ? `${(data.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A';

    const caption = `
✅ *TikTok Encontrado*

👤 *Autor:* ${author}
📝 *Descripción:* ${description}
⏳ *Duración:* ${duration}
📏 *Tamaño:* ${size}

_Si deseas el archivo en HD o solo el audio, usa los botones de abajo:_`.trim();

    const buttons = [
      { buttonId: `${usedPrefix}tt_vid ${text}`, buttonText: { displayText: 'Video en HD' }, type: 1 },
      { buttonId: `${usedPrefix}tt_aud ${text}`, buttonText: { displayText: 'Extraer Audio' }, type: 1 }
    ];

    // Se envía el video normal primero con los botones
    await conn.sendMessage(m.chat, {
      video: { url: data.play },
      caption: caption,
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (error) {
    console.error('Error al descargar TikTok:', error);
    conn.reply(m.chat, '❌ ¡Oops! Algo salió mal al intentar descargar el video.', m);
  }
};

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

handler.command = /^(tiktok|tt|tt_vid|tt_aud)$/i;

export default handler;
