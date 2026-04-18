import { downloadAudio } from '../lib/scrapers.js';
import { unlinkSync } from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `⚠️ Ingresa el nombre de la canción.\nEjemplo: ${usedPrefix + command} Alan Walker Faded`, m);

    await m.react('⏳');
    
    // Usamos nuestro scraper local
    const res = await downloadAudio(text);
    
    if (!res) {
        await m.react('❌');
        return conn.reply(m.chat, '❌ No se pudo descargar la canción.', m);
    }

    try {
        // Enviar audio
        await conn.sendMessage(m.chat, { 
            audio: { url: res.path }, 
            mimetype: 'audio/mpeg',
            fileName: `${res.title}.mp3`
        }, { quoted: m });

        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
    } finally {
        // Borrar el archivo temporal para no llenar el servidor
        try { unlinkSync(res.path); } catch {}
    }
}

handler.command = /^(play|ytmp3)$/i
export default handler