import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
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

  let cleanUrl = text.split('?')[0];

  if (!cleanUrl.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) {
    return conn.reply(m.chat, '🤔 Parece que el enlace no es de TikTok válido.', m);
  }

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result || result.code !== 0 || !result.data) {
      return conn.reply(m.chat, '❌ No pude descargar el video.', m);
    }

    const data = result.data;
    const author = data.author?.nickname || 'Desconocido';
    const description = data.title || 'Sin descripción';
    
    const caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   ✅  *TIKTOK ENCONTRADO* 
╚════════════════════╝

👤 *Autor:* ${author}
📝 *Descripción:* ${description}

_Seleccione una opción abajo:_`.trim();

    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Video en HD 🎥",
          id: `${usedPrefix}tt_vid ${cleanUrl}`
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Extraer Audio 🎵",
          id: `${usedPrefix}tt_aud ${cleanUrl}`
        })
      }
    ];

    await conn.sendMessage(m.chat, {
      video: { url: data.play },
      caption: caption,
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '❌ Error de conexión.', m);
  }
};

handler.command = /^(tiktok|tt|tt_vid|tt_aud)$/i;

export default handler;
