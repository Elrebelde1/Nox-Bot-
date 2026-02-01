import fetch from 'node-fetch';
import axios from 'axios';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTADOR_PATH = join(__dirname, '.contador_spotify.txt');

// --- FUNCIONES DE UTILIDAD ---

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

function isSpotifyURL(text) {
  const spotifyRegex = /^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist)\/.+/i;
  return spotifyRegex.test(text);
}

// --- INTEGRACIÓN DE API DELIRIUS ---

async function searchSpotify(query) {
  try {
    const response = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(query)}&limit=20`);
    const res = await response.json();
    if (!res.status || !res.data.length) return null;
    return res.data[0]; // Retorna el primer resultado de la búsqueda
  } catch (error) {
    console.error('Error en búsqueda Spotify:', error);
    return null;
  }
}

async function downloadSpotify(url) {
  try {
    const response = await fetch(`https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(url)}`);
    const res = await response.json();
    if (!res.status) return null;
    return res.data; // Retorna title, author, image, download, etc.
  } catch (error) {
    console.error('Error en descarga Spotify:', error);
    return null;
  }
}

const sendAudioWithRetry = async (conn, chat, audioUrl, trackTitle, artistName, thumbnailUrl, maxRetries = 2) => {
  let attempt = 0;
  let thumbnailBuffer;

  try {
    const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
    thumbnailBuffer = Buffer.from(response.data, 'binary');
  } catch (error) {
    try {
      const fallback = await axios.get('https://files.catbox.moe/bex83k.jpg', { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(fallback.data, 'binary');
    } catch (e) {
      thumbnailBuffer = Buffer.alloc(0);
    }
  }

  const messageOptions = {
    audio: { url: audioUrl },
    mimetype: 'audio/mpeg',
    ptt: false,
    contextInfo: {
      externalAdReply: {
        title: trackTitle,
        body: `${artistName} • 🎵 Spotify Downloader`,
        previewType: 'PHOTO',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        sourceUrl: 'https://api.delirius.store'
      }
    }
  };

  while (attempt < maxRetries) {
    try {
      await conn.sendMessage(chat, messageOptions);
      return true;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
    }
  }
};

// --- HANDLER PRINCIPAL ---

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `[❗️] ᴜsᴏ: ${usedPrefix}${command} <ɴᴏᴍʙʀᴇ ᴏ ᴜʀʟ ᴅᴇ sᴘᴏᴛɪғʏ>`, m);
  }

  try {
    await m.react('🎵');
    const input = args.join(" ");
    let spotifyUrl = "";
    let trackData = null;

    await m.reply(`🔍 ʙᴜsᴄᴀɴᴅᴏ "${input}" ᴇɴ sᴘᴏᴛɪғʏ...`);

    // 1. Obtener la URL de Spotify
    if (isSpotifyURL(input)) {
      spotifyUrl = input;
    } else {
      const searchResult = await searchSpotify(input);
      if (!searchResult) throw "No se encontraron resultados en Spotify.";
      spotifyUrl = searchResult.url;
    }

    // 2. Obtener link de descarga y metadatos
    await m.react('📥');
    trackData = await downloadSpotify(spotifyUrl);

    if (!trackData || !trackData.download) {
      throw "No se pudo obtener el enlace de descarga directo.";
    }

    // 3. Enviar el audio
    await m.react('📤');
    await sendAudioWithRetry(
      conn,
      m.chat,
      trackData.download,
      trackData.title,
      trackData.author || trackData.artist || "Spotify Artist",
      trackData.image
    );

    contarDescarga();
    await m.react('🟢');

  } catch (e) {
    console.error(e);
    await m.react('🔴');
    return m.reply(`❌ ᴇʀʀᴏʀ: ${e.toString()}`);
  }
};

handler.command = /^spotify$/i;
handler.help = ['spotify <query/url>'];
handler.tags = ['descargas'];

export default handler;