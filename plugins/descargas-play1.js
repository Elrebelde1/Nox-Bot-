import { downloadMedia } from '../lib/scrapers.js';
import { unlinkSync } from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, 'Ingresa el nombre de la canción.', m);

    await m.react('⏳');
    
    // isAudio será true si es uno de estos comandos
    const isAudio = /^(play|yta|ytmp3|playaudio)$/i.test(command);
    
    // Llama al scraper local (sin APIs)
    const result = await downloadMedia(text, isAudio);

    if (!result) {
        await m.react('❌');
        return conn.reply(m.chat, 'No se pudo descargar.', m);
    }

    // Envío del archivo descargado localmente
    if (isAudio) {
        await conn.sendMessage(m.chat, { audio: { url: result.path }, mimetype: 'audio/mpeg' }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, { video: { url: result.path }, mimetype: 'video/mp4', caption: result.title }, { quoted: m });
    }

    await m.react('✅');
    
    // Limpieza
    try { unlinkSync(result.path); } catch (e) {}
}

handler.command = /^(play|yta|ytmp3|playaudio|play2|ytv|ytmp4|mp4)$/i
export default handler