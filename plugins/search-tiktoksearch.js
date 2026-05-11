import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Manejador para los botones de la búsqueda (Video HD y Audio)
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
            return m.reply("⚠️ *Error al obtener el archivo.*");
        }
    }

    if (!text) return m.reply("🔍 *Ingresa qué buscar.*");

    try {
        m.react("🔄");
        
        let info = await tiktok.search(text);
        if (!info || info.length === 0) throw "Sin info";

        let videoAleatorio = Math.floor(Math.random() * info.length);
        let { metadata, media, id } = info[videoAleatorio];

        let mensaje = `┏━━━━━━━━━━━━━━┓\n┃     📥 DESCARGADOR |\n┗━━━━━━━━━━━━━━┛\n\n📝 *INFO:* ${metadata.titulo}\n\n━━━━━━━━━━━━━━━━\n⚡ *By: Barboza Developer*`.trim();

        // Configuración de botones modernos (Interactive Message)
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

        // Preparar el medio (video)
        let msg = await conn.prepareWAMessageMedia({ video: { url: media.no_watermark } }, { upload: conn.waUploadToServer });

        // Envío mediante relayMessage para que se vean los botones
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
        console.error(error);
        m.reply("⚠️ *Sin resultados. Intenta con otra palabra.*");
        m.react("❌");
    }
};

handler.command = /^(tiktoksearch|tts|tts_vid|tts_aud)$/i;
export default handler;

// Objeto de búsqueda corregido con User-Agent real
const tiktok = {
    search: async function (q) {
        try {
            const data = new URLSearchParams({
                count: '20',
                cursor: '0',
                web: '1',
                hd: '1',
                keywords: q
            });
            
            const response = await axios.post("https://tikwm.com/api/feed/search", data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
                }
            });

            if (response.data && response.data.data && response.data.data.videos) {
                return response.data.data.videos.map((v) => ({
                    id: v.video_id,
                    metadata: { titulo: v.title },
                    media: { no_watermark: "https://tikwm.com" + v.play }
                }));
            } else {
                return [];
            }
        } catch (e) {
            return [];
        }
    }
};
