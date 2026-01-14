import fetch from 'node-fetch';
import yts from 'yt-search';

/**
 * Configuración de APIs
 */
const API_DELIRIUS = "https://api.delirius.store";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*¿Qué canción buscamos?*\nUso: ${usedPrefix + command} Twice`);

    try {
        await m.react('🔍');
        
        // 1. Buscar información en Spotify
        const searchUrl = `${API_DELIRIUS}/search/spotify?q=${encodeURIComponent(text)}&limit=1`;
        const response = await fetch(searchUrl);
        const searchData = await response.json();

        if (!searchData.status || searchData.data.length === 0) {
            return m.reply("❌ No encontré resultados en Spotify.");
        }

        const track = searchData.data[0];
        const trackUrl = track.url; // URL de Spotify

        await m.react('📥');

        // 2. Intentar descarga directa vía Delirius SpotifyDL
        const dlUrl = `${API_DELIRIUS}/download/spotifydl?url=${encodeURIComponent(trackUrl)}`;
        const dlRes = await fetch(dlUrl);
        const dlData = await dlRes.json();

        let audioBuffer;
        let finalUrl;

        if (dlData.status && dlData.data.download) {
            // Caso exitoso: Descarga directa de Spotify
            finalUrl = dlData.data.download;
        } else {
            // Caso respaldo: Buscar en YouTube si falla SpotifyDL
            const ytSearch = await yts(`${track.title} ${track.artist}`);
            if (ytSearch.videos.length > 0) {
                // Aquí podrías usar tu lógica de Youtubers() para extraer el audio
                // Para este ejemplo, usaremos la info de la búsqueda
                finalUrl = ytSearch.videos[0].url; 
                return m.reply(`⚠️ Descarga directa no disponible. Puedes buscar el video aquí: ${finalUrl}`);
            }
        }

        // 3. Enviar el archivo
        await conn.sendMessage(m.chat, {
            audio: { url: finalUrl },
            mimetype: 'audio/mpeg',
            fileName: `${track.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: track.title,
                    body: track.artist,
                    thumbnailUrl: track.image,
                    sourceUrl: trackUrl,
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`Error interno: ${e.message}`);
    }
};

handler.command = /^(spotify|sp)$/i;
export default handler;
