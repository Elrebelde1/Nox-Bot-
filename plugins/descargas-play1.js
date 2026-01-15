import fetch from 'node-fetch';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTADOR_PATH = join(__dirname, '.contador_play.txt');

// --- UTILIDADES ---

function contarDescarga() {
  let contador = 0;
  if (existsSync(CONTADOR_PATH)) {
    try {
      contador = parseInt(readFileSync(CONTADOR_PATH, 'utf8')) || 0;
    } catch (error) { console.error(error); }
  }
  contador += 1;
  try { writeFileSync(CONTADOR_PATH, String(contador)); } catch (e) { console.error(e); }
  return contador;
}

// --- HANDLER PRINCIPAL ---

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `[❗️] ᴜsᴏ:\n${usedPrefix}${command} <ɴᴏᴍʙʀᴇ ᴅᴇ ʟᴀ ᴄᴀɴᴄɪᴏ́ɴ>`, m);
  }

  // play = mp3 | play2 = mp4
  const isVideo = command === 'play2';
  const typeLabel = isVideo ? 'VIDEO' : 'AUDIO';
  const apiKey = "799343a24b120a1a5798fe780b823230";

  try {
    await m.react('⏳');
    const input = args.join(" ");
    
    await m.reply(`🔍 ᴘʀᴏᴄᴇsᴀɴᴅᴏ "${input}"...\nᴛɪᴘᴏ: ${typeLabel}`);

    // Construcción de la URL basada en tu ejemplo
    const apiUrl = `https://optishield.uk/api/?type=mp3-mp4&apikey=${apiKey}&audio=${encodeURIComponent(input)}&image=${encodeURIComponent(input)}`;
    
    const response = await fetch(apiUrl);
    const res = await response.json();

    // Validamos que la API devuelva datos (ajusta según la respuesta real de la API)
    const downloadUrl = isVideo ? (res.mp4 || res.result?.mp4) : (res.mp3 || res.result?.mp3);
    const thumbnail = res.thumb || res.image || "https://files.catbox.moe/bex83k.jpg";

    if (!downloadUrl) {
      throw "No se encontró un enlace de descarga válido en la API.";
    }

    await m.react('📥');

    if (isVideo) {
      // Enviar como VIDEO (play2)
      await conn.sendMessage(m.chat, { 
        video: { url: downloadUrl }, 
        caption: `✅ *${input}*\n\n> 📥 Descargado con éxito`,
        mimetype: 'video/mp4' 
      }, { quoted: m });
    } else {
      // Enviar como AUDIO (play)
      await conn.sendMessage(m.chat, { 
        audio: { url: downloadUrl }, 
        mimetype: 'audio/mpeg',
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: input,
            body: "🎵 Multimedia Downloader",
            previewType: 'PHOTO',
            thumbnailUrl: thumbnail,
            sourceUrl: 'https://optishield.uk'
          }
        }
      }, { quoted: m });
    }

    contarDescarga();
    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('❌');
    return m.reply(`❌ ᴇʀʀᴏʀ: No se pudo completar la solicitud.`);
  }
};

handler.command = /^(play|play2)$/i;
handler.help = ['play <query>', 'play2 <query>'];
handler.tags = ['descargas'];

export default handler;
