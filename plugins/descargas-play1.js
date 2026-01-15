import yts from "yt-search";
import fetch from "node-fetch";

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text || !text.trim()) return; 

  const isVideo = /^(play2|video)$/i.test(command);
  const type = isVideo ? 'video' : 'audio';

  try {
    const isLink = text.includes('youtube.com') || text.includes('youtu.be');
    let video;

    if (isLink) {
      const videoId = text.split('v=')[1]?.split('&')[0] || text.split('/').pop();
      const search = await yts({ videoId });
      video = search;
    } else {
      const search = await yts(text);
      video = search.videos[0];
    }

    if (!video) return;

    // --- Diseño Uchiha ---
    const caption = `
╭─〔 ♆ *Uᴄʜɪʜᴀ Pʟᴀʏᴇʀ* ♆ 〕─╮
│
│ 🗡️ *Tɪᴛᴜʟᴏ:* ${video.title}
│ 👤 *Aᴜᴛᴏʀ:* ${video.author.name}
│ ⏳ *Dᴜʀᴀᴄɪᴏɴ:* ${video.timestamp}
│ 👁️ *Vɪsᴛᴀs:* ${video.views.toLocaleString()}
│
╰─────────────────────╯

🌑 *${isVideo ? 'Iɴᴠᴏᴄᴀɴᴅᴏ ᴠɪᴅᴇᴏ...' : 'Cᴀɴᴀʟɪᴢᴀɴᴅᴏ ᴀᴜᴅɪᴏ...'}*`.trim();

    await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption }, { quoted: m });
    await m.react("⏳");

    // --- Lógica de Descarga ---
    try {
      const apiURL = `https://optishield.uk/api/?type=youtubedl&apikey=c50919b9828c357cd81e753f03d4c000&url=${encodeURIComponent(video.url)}&video=${isVideo ? 1 : 0}`;
      const res = await fetch(apiURL);
      const json = await res.json();

      if (json?.result?.download) {
        await conn.sendMessage(m.chat, { 
          [isVideo ? 'video' : 'audio']: { url: json.result.download }, 
          mimetype: isVideo ? 'video/mp4' : 'audio/mpeg', 
          fileName: `${video.title}.${isVideo ? 'mp4' : 'mp3'}`
        }, { quoted: m });
        return await m.react("✅");
      }
      throw new Error();

    } catch (e) {
      // Fallback Vreden
      const vredenRes = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/${type}?url=${encodeURIComponent(video.url)}&quality=128`);
      const vJson = await vredenRes.json();
      const dlUrl = vJson.result?.download?.url || vJson.result?.url;

      if (dlUrl) {
        await conn.sendMessage(m.chat, { 
          [isVideo ? 'video' : 'audio']: { url: dlUrl }, 
          mimetype: isVideo ? 'video/mp4' : 'audio/mpeg', 
          fileName: `${video.title}` 
        }, { quoted: m });
        await m.react("✅");
      } else {
        await m.react("❌");
      }
    }

  } catch (error) {
    console.error(error);
  }
};

handler.help = ["play", "play2"];
handler.tags = ["descargas"];
handler.command = /^(play|play2|video|audio)$/i;

export default handler;
