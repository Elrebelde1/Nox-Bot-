import { downloadMedia } from '../lib/scrapers.js';
import { unlinkSync } from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `⚠️ *Uso:* ${usedPrefix + command} [nombre o link]`, m);

    await m.react('⏳');
    
    // Detectamos si es audio o video
    const isAudio = /play$|yta|ytmp3|playaudio/i.test(command);
    
    const res = await downloadMedia(text, isAudio);
    
    if (!res) {
        await m.react('❌');
        return conn.reply(m.chat, '❌ No se pudo procesar tu descarga.', m);
    }

    try {
        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: res.path }, 
                mimetype: 'audio/mpeg',
                fileName: `${res.title}.mp3`
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: res.path }, 
                mimetype: 'video/mp4',
                caption: `✅ *Descarga lista:* ${res.title}`
            }, { quoted: m });
        }
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
    } finally {
        // Borrar el archivo temporal
        try { unlinkSync(res.path); } catch {}
    }
}

handler.command = /^(play|yta|ytmp3|playaudio|play2|ytv|ytmp4|mp4)$/i
export default handler