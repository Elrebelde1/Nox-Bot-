import { downloadMedia } from '../lib/scrapers.js'; // Tu nuevo scraper
import { unlinkSync } from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `⚠️ *Uso:* ${usedPrefix + command} [nombre]`, m);

    await m.react('⏳');
    
    // Definimos si es audio (true) o video (false)
    const isAudio = /^(play|yta|ytmp3|playaudio)$/i.test(command);
    
    // Llamamos a TU scraper local (sin fetch, sin apis)
    const res = await downloadMedia(text, isAudio);
    
    if (!res) {
        await m.react('❌');
        return conn.reply(m.chat, '❌ No se pudo descargar el contenido.', m);
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
                caption: `✅ ${res.title}`,
                fileName: `${res.title}.mp4`
            }, { quoted: m });
        }
        
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
    } finally {
        // Borramos el archivo del servidor
        try { if (res.path) unlinkSync(res.path); } catch (e) {}
    }
}

handler.command = /^(play|yta|ytmp3|playaudio|play2|ytv|ytmp4|mp4)$/i
export default handler