import fetch from 'node-fetch';
import axios from 'axios';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yts from 'yt-search';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTADOR_PATH = join(__dirname, '.contador_ytmp3.txt');

// --- CONFIGURACIÓN DE API ---
const API_KEY = "799343a24b120a1a5798fe780b823230";
const API_BASE = "https://optishield.uk/api/";

function contarDescarga() {
  let contador = 0;
  if (existsSync(CONTADOR_PATH)) {
    try {
      contador = parseInt(readFileSync(CONTADOR_PATH, 'utf8')) || 0;
    } catch (error) {
      console.error('Error leyendo contador:', error);
    }
  }
  contador += 1;
  try {
    writeFileSync(CONTADOR_PATH, String(contador));
  } catch (error) {
    console.error('Error escribiendo contador:', error);
  }
  return contador;
}

function isYouTubeURL(text) {
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=|youtube\.com\/shorts\/)/i;
  return ytRegex.test(text);
}

const getFileSize = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch (error) {
    return 0;
  }
};

const sendAudioWithRetry = async (conn, chat, audioUrl, videoTitle, maxRetries = 2) => {
  let attempt = 0;
  let thumbnailBuffer;

  try {
    const response = await axios.get('https://files.catbox.moe/u6vqdk.jpg', { responseType: 'arraybuffer' });
    thumbnailBuffer = Buffer.from(response.data, 'binary');
  } catch (e) {
    console.error('⚠️ Error thumbnail');
  }

  const fileSize = await getFileSize(audioUrl);
  const maxSizeInBytes = 30 * 1024 * 1024;
  const sendAsDocument = fileSize > maxSizeInBytes;

  const messageOptions = {
    mimetype: 'audio/mpeg',
    contextInfo: {
      externalAdReply: {
        title: videoTitle,
        body: sendAsDocument ? "📁 Sasuke ʙᴏᴛ - ᴅᴏᴄᴜᴍᴇɴᴛᴏ" : "🌀 Sasuke ʙᴏᴛ™",
        previewType: 'PHOTO',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        sourceUrl: 'https://Sasuke.Bot.Com'
      }
    }
  };

  if (sendAsDocument) {
    messageOptions.document = { url: audioUrl };
    messageOptions.fileName = `${videoTitle}.mp3`;
  } else {
    messageOptions.audio = { url: audioUrl };
    messageOptions.ptt = false;
  }

  while (attempt < maxRetries) {
    try {
      await conn.sendMessage(chat, messageOptions);
      break;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw new Error('No se pudo enviar el audio');
    }
  }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `[❗️] ᴜsᴏ: ${usedPrefix}ytmp3 <ɴᴏᴍʙʀᴇ ᴅᴇʟ ᴠɪᴅᴇᴏ ᴏ ᴜʀʟ>`, m);
  }

  try {
    await m.react('📥');
    const query = args.join(" ");
    let videoTitle = "";
    
    // 1. Obtener nombre del video si es URL o buscar si es texto
    if (isYouTubeURL(query)) {
      const search = await yts(query);
      videoTitle = search.title || "Audio_Descargado";
    } else {
      const search = await yts(query);
      if (!search.videos || !search.videos.length) throw new Error("ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀó ɴɪɴɢúɴ ᴠɪᴅᴇᴏ");
      videoTitle = search.videos[0].title;
    }

    await conn.reply(m.chat, `ᴇsᴘᴇʀᴀ ᴜɴ ᴍᴏᴍᴇɴᴛᴏ...🔄\nBuscando: ${videoTitle}`, m);

    // 2. Llamada a la nueva API de Optishield
    // Usamos el título del video como parámetro 'audio' según tu ejemplo
    const optishieldUrl = `${API_BASE}?type=mp3-mp4&apikey=${API_KEY}&audio=${encodeURIComponent(videoTitle)}`;
    
    const res = await axios.get(optishieldUrl);
    const data = res.data;

    // 3. Extraer el enlace de descarga del JSON de respuesta usando Regex
    const match = JSON.stringify(data).match(/https:\/\/optishield\.uk\/tmp\/[^\s"]+/);
    
    if (!match) {
        throw new Error("No se pudo generar el enlace de descarga en el servidor.");
    }

    const downloadUrl = match[0];

    // 4. Enviar el archivo
    await m.react('📤');
    await sendAudioWithRetry(conn, m.chat, downloadUrl, videoTitle);

    contarDescarga();
    await m.react('🟢');

  } catch (e) {
    console.error(e);
    await m.react('🔴');
    return m.reply(`❌ ᴇʀʀᴏʀ: ${e.message}`);
  }
};

handler.command = /^ytmp3$/i;
handler.help = ['ytmp3 <query/url>'];
handler.tags = ['descargas'];

export default handler;
