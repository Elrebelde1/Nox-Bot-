import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (command === 'tt_vid' || command === 'tt_aud') {
    const res = await fetch(`https://www.tikwm.com/api/?url=${text}`);
    const json = await res.json();

    if (command === 'tt_vid') {
      const videoHd = json.data.hdplay || json.data.play; 
      return await conn.sendMessage(m.chat, { video: { url: videoHd }, caption: `✅ *TIKTOK HD LISTO*` }, { quoted: m });
    } else {
      return await conn.sendMessage(m.chat, { audio: { url: json.data.music }, mimetype: 'audio/mp4', fileName: 'tiktok.mp3' }, { quoted: m });
    }
  }

  if (!text) return conn.reply(m.chat, '❌ ¡Necesito un enlace de TikTok!', m);

  let cleanUrl = text.split('?')[0];
  if (!cleanUrl.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) return conn.reply(m.chat, '🤔 Enlace no válido.', m);

  try {
    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
    const result = await response.json();

    if (!result || result.code !== 0 || !result.data) return conn.reply(m.chat, '❌ Error al descargar.', m);

    const data = result.data;
    const caption = `👤 *Autor:* ${data.author.nickname}\n📝 *Descripción:* ${data.title}\n\n_Usa los botones abajo:_`.trim();

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
    conn.reply(m.chat, '❌ Error de conexión.', m);
  }
};

handler.command = /^(tiktok|tt|tt_vid|tt_aud)$/i;
export default handler;
