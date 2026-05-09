import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Manejador para los botones de la búsqueda
    if (command === 'tts_vid' || command === 'tts_aud') {
        // En tts_aud, el 'text' ahora es el ID del video para evitar el error 403
        const target = text.split(' ')[0];
        
        try {
            if (command === 'tts_vid') {
                return await conn.sendMessage(m.chat, { video: { url: target }, caption: `✅ *Video en Alta Calidad (HD)*` }, { quoted: m });
            } else {
                // Si es audio, hacemos una petición rápida para obtener el link directo sin bloqueo
                const res = await axios.get(`https://www.tikwm.com/api/?url=${target}`);
                const musicUrl = res.data.data.music;
                return await conn.sendMessage(m.chat, { 
                    audio: { url: musicUrl }, 
                    mimetype: 'audio/mp4', 
                    fileName: 'tiktok.mp3' 
                }, { quoted: m });
            }
        } catch (e) {
            return m.reply("⚠️ *Error al obtener el archivo. Intenta de nuevo.*");
        }
    }

    if (!text) return m.reply("🔍 *Por favor, ingresa un término de búsqueda.*");

    try {
        m.react("🔄");
        let info = await tiktok.search(text);
        
        let videoAleatorio = Math.floor(Math.random() * info.length);
        let { metadata, estadisticas, author, media, id } = info[videoAleatorio];

        let mensaje = `
🎥 *Título:* ${metadata.titulo}
⏳ *Duración:* ${metadata.duracion}s
👤 *Autor:* ${author.name}

📊 *Estadísticas:*
👀 ${estadisticas.reproducciones} | ❤️ ${estadisticas.likes}
`.trim();

        // CONFIGURACIÓN DE BOTONES
        const buttons = [
            { buttonId: `${usedPrefix}tts ${text}`, buttonText: { displayText: '⏭️ Siguiente Video' }, type: 1 },
            { buttonId: `${usedPrefix}tts_aud ${id}`, buttonText: { displayText: '🎵 Extraer Audio' }, type: 1 },
            { buttonId: `${usedPrefix}tts_vid ${media.no_watermark}`, buttonText: { displayText: '📺 Ver en HD' }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            video: { url: media.no_watermark },
            caption: mensaje,
            footer: 'By Barboza-Team ⚡',
            buttons: buttons,
            headerType: 4
        }, { quoted: m });

        m.react("✅");

    } catch (error) {
        console.error(error);
        m.reply("⚠️ *Sin resultados para esta búsqueda.*");
        m.react("❌");
    }
};

handler.command = /^(tiktoksearch|tts_vid|tts_aud)$/i;
export default handler;

const tiktok = {
    search: async function (q) {
        try {
            const data = { count: 20, cursor: 0, web: 1, hd: 1, keywords: q };
            const config = {
                method: "post",
                url: "https://tikwm.com/api/feed/search",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
                },
                data: data,
            };
            const response = await axios(config);
            if (response.data.data) {
                return response.data.data.videos.map((video) => ({
                    id: video.video_id, // Guardamos el ID para el botón de audio
                    metadata: { titulo: video.title, duracion: video.duration },
                    estadisticas: {
                        reproducciones: Number(video.play_count).toLocaleString(),
                        likes: Number(video.digg_count).toLocaleString(),
                    },
                    author: { name: video.author.nickname },
                    media: {
                        no_watermark: "https://tikwm.com" + video.play,
                    },
                }));
            } else {
                throw new Error("Sin info");
            }
        } catch (error) {
            throw new Error(error);
        }
    },
};
