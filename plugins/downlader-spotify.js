import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*¿Qué deseas buscar o descargar de Spotify?*\n\n> *Ejemplo de búsqueda:* ${usedPrefix + command} Lupe Fiasco\n> *Ejemplo de link:* ${usedPrefix + command} https://open.spotify.com/track/...`);

    try {
        let apiUrl;
        let isLink = text.match(/^(https?:\/\/)?(open\.spotify\.com|googleusercontent\.com\/spotify\.com)\/(track|album|playlist)/gi);

        if (isLink) {
            // Si es un link, usamos directamente el endpoint de descarga
            apiUrl = `https://sylphy.xyz/download/spotify?url=${encodeURIComponent(text)}&api_key=sylphy-6f150d`;
        } else {
            // Si es texto, buscamos primero el link de la canción
            let searchRes = await fetch(`https://sylphy.xyz/search/spotify?q=${encodeURIComponent(text)}&api_key=sylphy-6f150d`);
            let searchData = await searchRes.json();

            if (!searchData.status || searchData.result.length === 0) return m.reply('❌ No se encontraron resultados para tu búsqueda.');
            
            // Tomamos el primer resultado de la búsqueda
            let trackUrl = searchData.result[0].url;
            apiUrl = `https://sylphy.xyz/download/spotify?url=${encodeURIComponent(trackUrl)}&api_key=sylphy-6f150d`;
        }

        // Proceso de descarga final
        let res = await fetch(apiUrl);
        let data = await res.json();

        if (!data.status) return m.reply('❌ Hubo un error al procesar la descarga.');

        let { name, artists, album, download_url } = data.result;
        let cap = `*S P O T I F Y  -  D O W N L O A D*\n\n` +
                  `🎵 *Título:* ${name}\n` +
                  `👤 *Artista:* ${artists.map(a => a.name).join(', ')}\n` +
                  `💿 *Álbum:* ${album.name || 'N/A'}\n` +
                  `✨ *Enviando audio... por favor espere.*`;

        // Enviar la portada
        await conn.sendFile(m.chat, album.images[0].url, 'thumb.jpg', cap, m);

        // Enviar el archivo de audio
        await conn.sendMessage(m.chat, { 
            audio: { url: download_url }, 
            mimetype: 'audio/mpeg',
            fileName: `${name}.mp3`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('🚀 *Ocurrió un error inesperado.* Inténtalo de nuevo más tarde.');
    }
};

handler.command = ['spotify', 'spdl', 'play'];
handler.tags = ['dl'];

export default handler;
