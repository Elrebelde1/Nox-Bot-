import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (command === 'tts_vid' || command === 'tts_aud') {
        const target = text.split(' ')[0];
        try {
            if (command === 'tts_vid') {
                return await conn.sendMessage(m.chat, { video: { url: target }, caption: `✅ *Video HD Listo*` }, { quoted: m });
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
            return m.reply("⚠️ Error.");
        }
    }

    if (!text) return m.reply("🔍 Ingresa qué buscar.");

    try {
        m.react("🔄");
        let info = await tiktok.search(text);
        let videoAleatorio = Math.floor(Math.random() * info.length);
        let { metadata, author, media, id } = info[videoAleatorio];

        let mensaje = `
┏━━━━━━━━━━━━━━┓
┃     📥 DESCARGADOR |
┗━━━━━━━━━━━━━━┛

📝 *INFO:* ${metadata.titulo}

━━━━━━━━━━━━━━━━
⚡ *By: Barboza Developer*`.trim();

        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "⏭️ Siguiente",
                    id: `${usedPrefix}tts ${text}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎵 Audio",
                    id: `${usedPrefix}tts_aud ${id}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📺 Video HD",
                    id: `${usedPrefix}tts_vid ${media.no_watermark}`
                })
            }
        ];

        let msg = await conn.prepareWAMessageMedia({ video: { url: media.no_watermark } }, { upload: conn.waUploadToServer });

        await conn.relayMessage(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: mensaje },
                        footer: { text: 'Sasuke Bot ⚡' },
                        header: {
                            hasVideoMessage: true,
                            videoMessage: msg.videoMessage
                        },
                        nativeFlowMessage: {
                            buttons: buttons
                        }
                    }
                }
            }
        }, { quoted: m });

        m.react("✅");

    } catch (error) {
        m.reply("⚠️ Sin resultados.");
    }
};

handler.command = /^(tiktoksearch|tts_vid|tts_aud)$/i;
export default handler;

const tiktok = {
    search: async function (q) {
        try {
            const data = { count: 20, cursor: 0, web: 1, hd: 1, keywords: q };
            const response = await axios({
                method: "post",
                url: "https://tikwm.com/api/feed/search",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                data: data
            });
            return response.data.data.videos.map((v) => ({
                id: v.video_id,
                metadata: { titulo: v.title },
                author: { name: v.author.nickname },
                media: { no_watermark: "https://tikwm.com" + v.play }
            }));
        } catch (e) { return []; }
    }
};
