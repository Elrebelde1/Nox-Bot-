import { downloadMedia } from '../lib/scrapers.js';
import { unlinkSync } from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `⚠️ *Uso correcto:* ${usedPrefix + command} [nombre o link]`, m);

    await m.react('⏳');
    
    // Verificamos si es audio o video según el comando
    const isAudio = /^(play|yta|ytmp3|playaudio)$/i.test(command);
    
    const res = await downloadMedia(text, isAudio);
    
    if (!res) {
        await m.react('❌');
        return conn.reply(m.chat, '❌ No se pudo descargar el contenido. Intenta con otro nombre.', m);
    }

    try {
        // Enviar según corresponda
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
                caption: `✅ *Descarga lista*\n🎬 ${res.title}`,
                fileName: `${res.title}.mp4`
            }, { quoted: m });
        }
        
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
    } finally {
        // Limpiamos el archivo del servidor
        try { if (res.path) unlinkSync(res.path); } catch (e) {}
    }
}

handler.command = /^(play|yta|ytmp3|playaudio|play2|ytv|ytmp4|mp4)$/i
export default handler