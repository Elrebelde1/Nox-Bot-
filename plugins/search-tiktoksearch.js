import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (command === 'tts_vid' || command === 'tts_aud') {
        const target = text.split(' ')[0];
        try {
            if (command === 'tts_vid') {
                return await conn.sendMessage(m.chat, { video: { url: target }, caption: `✅ *Video en HD*` }, { quoted: m });
            } else {
                const res = await axios.get(`https://www.tikwm.com/api/?url=${target}`);
                const musicUrl = res.data.data.music;
                return await conn.sendMessage(m.chat, { 
                    audio: { url: musicUrl }, 
                    mimetype: 'audio/mp4', 
                    fileName: 'tiktok.mp3' 
                }, { quoted: m });
            }
        } catch (e) {
            return m.reply("⚠️ *Error al obtener el archivo.*");
        }
    }

    if (!text) return m.reply("🔍 *Ingresa qué buscar.*");

    try {
        m.react("🔄");
        let info = await tiktok.search(text);
        let videoAleatorio = Math.floor(Math.random() * info.length);
        let { metadata, estadisticas, author, media, id } = info[videoAleatorio];

        let mensaje = `
┏━━━━━━━━━━━━━━┓
┃     📥 DESCARGADOR |
┗━━━━━━━━━━━━━━┛

📝 *INFO:* ${metadata.titulo}
👤 *AUTOR:* ${author.name}
📊 *STATS:* ❤️ ${estadisticas.likes}

━━━━━━━━━━━━━━━━
🎥 *OPCIONES:*
👉 *Siguiente:* ${usedPrefix}tts ${text}
👉 *Video HD:* ${usedPrefix}tts_vid ${media.no_watermark}
👉 *Solo Audio:* ${usedPrefix}tts_aud ${id}

━━━━━━━━━━━━━━━━
⚡ *By: Barboza Developer*`.trim();

        await conn.sendMessage(m.chat, {
            video: { url: media.no_watermark },
            caption: mensaje
        }, { quoted: m });

        m.react("✅");

    } catch (error) {
        m.reply("⚠️ *Sin resultados.*");
        m.react("❌");
    }
};

handler.command = /^(tiktoksearch|tts|tts_vid|tts_aud)$/i;
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
                },
                data: data,
            };
            const response = await axios(config);
            if (response.data.data) {
                return response.data.data.videos.map((video) => ({
                    id: video.video_id,
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
