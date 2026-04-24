import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  // Manejador para el botón de Audio (Comando interno)
  if (command === 'tt_aud') {
    const res = await fetch(`https://www.tikwm.com/api/?url=${text}`);
    const json = await res.json();
    return await conn.sendMessage(m.chat, { 
      audio: { url: json.data.music }, 
      mimetype: 'audio/mp4', 
      fileName: 'tiktok.mp3' 
    }, { quoted: m });
  }

  if (!text) {
    return conn.reply(m.chat, '❌ ¡Necesito un enlace de TikTok!', m);
  }

  if (!text.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) {
    return conn.reply(m.chat, '🤔 Por favor, envía un enlace válido de TikTok.', m);
  }

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result || result.code !== 0 || !result.data) {
      return conn.reply(m.chat, '❌ No pude descargar el video.', m);
    }

    const data = result.data;
    // Envía HD por defecto
    const videoUrl = data.hdplay || data.play;
    
    const author = data.author?.nickname || 'Desconocido';
    const description = data.title || 'Sin descripción';
    const duration = data.duration ? formatDuration(data.duration) : '0:00';
    const size = data.hd_size ? `${(data.hd_size / (1024 * 1024)).toFixed(2)} MB` : `${(data.size / (1024 * 1024)).toFixed(2)} MB`;

    const caption = `
✅ *TikTok Encontrado (Alta Calidad)*

👤 *Autor:* ${author}
📝 *Descripción:* ${description}
⏳ *Duración:* ${duration}
📏 *Tamaño:* ${size}

_¿Quieres solo el audio? Usa el botón de abajo:_`.trim();

    const buttons = [
      { buttonId: `${usedPrefix}tt_aud ${text}`, buttonText: { displayText: '🎵 Extraer Audio' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: caption,
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (error) {
    console.error('Error:', error);
    conn.reply(m.chat, '❌ Error al procesar el video.', m);
  }
};

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// AQUÍ ESTABA EL ERROR: Faltaba tt_aud en la lista de comandos
handler.command = /^(tiktok|tt|tt_aud)$/i;

export default handler;
