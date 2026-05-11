import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
    if (command === 'tt_vid' || command === 'tt_aud') {
        const res = await fetch(`https://www.tikwm.com/api/?url=${text}`);
        const json = await res.json();

        if (command === 'tt_vid') {
            const videoHd = json.data.hdplay || json.data.play; 
            return await conn.sendMessage(m.chat, { video: { url: videoHd }, caption: `✅ *Video HD Listo*` }, { quoted: m });
        } else {
            return await conn.sendMessage(m.chat, { 
                audio: { url: json.data.music }, 
                mimetype: 'audio/mp4', 
                fileName: 'tiktok.mp3' 
            }, { quoted: m });
        }
    }

    if (!text) return conn.reply(m.chat, '❌ ¡Falta el enlace!', m);

    let cleanUrl = text.split('?')[0];

    try {
        m.react("🔄");
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
        const result = await response.json();
        if (!result?.data) return conn.reply(m.chat, '❌ Error al obtener video.', m);

        const data = result.data;
        const hashtags = data.title.match(/#[\wñ]+/g)?.join(' ') || '#viral #tiktok';
        const caption = `✨ *TikTok:* ${hashtags}`.trim();

        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Video en HD 🎥",
                    id: `${usedPrefix}tt_vid ${cleanUrl}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Extraer Audio 🎵",
                    id: `${usedPrefix}tt_aud ${cleanUrl}`
                })
            }
        ];

        let msg = await conn.prepareWAMessageMedia({ video: { url: data.play } }, { upload: conn.waUploadToServer });

        await conn.relayMessage(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: caption },
                        footer: { text: 'By Barboza-Team ⚡' },
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
        conn.reply(m.chat, '❌ Error de conexión.', m);
    }
};

handler.command = /^(tiktok|tt|tt_vid|tt_aud)$/i;
export default handler;
