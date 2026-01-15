import yts from "yt-search";
import fetch from "node-fetch";

// Objeto para guardar la sesión de los usuarios (Chakra mental)
const estados = {};
const TIEMPO_ESPERA = 120000; // 2 minutos

const handler = async (m, { conn, text, command, usedPrefix }) => {
  // Si el usuario ya está en una sesión y escribe 1 o 2, lo maneja el handler.before
  // Pero si usa el comando de nuevo, reiniciamos la búsqueda.
  
  if (!text || !text.trim()) {
    return m.reply(`🦅 *¿Qᴜᴇ ʙᴜsᴄᴀs ᴇɴ ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ?*\n\nUsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:\n${usedPrefix + command} <ɴᴏᴍʙʀᴇ ᴏ URL>\n\nEx: ${usedPrefix + command} Ace of Base Happy Nation`);
  }

  await m.react("👁️");

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

    if (!video) {
      await m.react("❌");
      return m.reply("🌑 *Mis ojos no ven nada con ese nombre.*");
    }

    // Guardar estado del usuario
    estados[m.sender] = {
      video,
      timeout: setTimeout(() => {
        delete estados[m.sender];
      }, TIEMPO_ESPERA)
    };

    const caption = `
╭─〔 ♆ *Uᴄʜɪʜᴀ Pʟᴀʏᴇʀ* ♆ 〕─╮
│
│ 🗡️ *Tɪᴛᴜʟᴏ:* ${video.title}
│ 👤 *Aᴜᴛᴏʀ:* ${video.author.name}
│ ⏳ *Dᴜʀᴀᴄɪᴏɴ:* ${video.timestamp}
│ 👁️ *Vɪsᴛᴀs:* ${video.views.toLocaleString()}
│
╰─────────────────────╯

⛅ *¿Qᴜᴇ ᴅᴇsᴇᴀs ʜᴀᴄᴇʀ?*
Responde con:
1️⃣ *Para Audio (MP3)*
2️⃣ *Para Vídeo (MP4)*

🌑 *Eʟ ᴘᴏᴅᴇʀ sᴇ ᴇsᴛᴀ ᴄᴀɴᴀʟɪᴢᴀɴᴅᴏ...*`.trim();

    await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption }, { quoted: m });

  } catch (error) {
    console.error(error);
    await m.react("❌");
    m.reply(`⚠️ *💢 Mɪs ᴏᴊᴏs ʜᴀɴ sɪᴅᴏ ʙʟᴏϙᴜᴇᴀᴅᴏs.*`);
  }
};

// --- EL MANEJADOR DE RESPUESTAS (1 y 2) ---
handler.before = async (m, { conn }) => {
  const estado = estados[m.sender];
  if (!estado || !m.text) return false;

  const choice = m.text.trim();
  const isAudio = choice === '1' || choice === '1️⃣';
  const isVideo = choice === '2' || choice === '2️⃣';

  if (isAudio || isVideo) {
    clearTimeout(estado.timeout);
    const { video } = estado;
    const type = isAudio ? 'mp3' : 'mp4';
    
    await m.react("⏳");
    await m.reply(isAudio ? `🎧 *Canalizando audio...*` : `🎥 *Invocando video...*`);

    try {
      // API Principal (Optishield/Vreden mix)
      const apiURL = `https://optishield.uk/api/?type=youtubedl&apikey=c50919b9828c357cd81e753f03d4c000&url=${encodeURIComponent(video.url)}&video=${isAudio ? 0 : 1}`;
      
      const res = await fetch(apiURL);
      const json = await res.json();

      if (!json?.result?.download) throw new Error("Falla de chakra");

      const buffer = await (await fetch(json.result.download)).buffer();

      if (isAudio) {
        await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName: `${video.title}.mp4`, caption: `⚡ *Destino cumplido.*` }, { quoted: m });
      }
      
      await m.react("✅");
    } catch (e) {
      // Fallback a API Vreden
      try {
        const vredenType = isAudio ? "audio" : "video";
        const vredenRes = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/${vredenType}?url=${encodeURIComponent(video.url)}&quality=128`);
        const vJson = await vredenRes.json();
        const dlUrl = vJson.result?.download?.url || vJson.result?.url;

        if (dlUrl) {
           await conn.sendMessage(m.chat, { [isAudio ? 'audio' : 'video']: { url: dlUrl }, mimetype: isAudio ? 'audio/mpeg' : 'video/mp4', fileName: `${video.title}.${type}` }, { quoted: m });
           await m.react("✅");
        } else {
          throw new Error();
        }
      } catch (err) {
        await m.reply("❌ *El Genjutsu ha fallado. No se pudo descargar el archivo.*");
      }
    }

    delete estados[m.sender];
    return true;
  }
  return false;
};

handler.help = ["play"];
handler.tags = ["descargas"];
handler.command = /^(play)$/i;

export default handler;
