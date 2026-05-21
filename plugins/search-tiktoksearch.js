import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.db) global.db = { data: {} };
    if (!global.db.data.tiktokCache) global.db.data.tiktokCache = {};

    if (command === 'tts_vid' || command === 'tts_aud') {
        const videoId = text.trim();
        const cachedVideo = global.db.data.tiktokCache[videoId];

        if (!cachedVideo) {
            return m.reply("⚠️ *El enlace ha expirado. Realiza la búsqueda de nuevo.*");
        }

        try {
            if (command === 'tts_vid') {
                return await conn.sendMessage(m.chat, { 
                    video: { url: cachedVideo.dl }, 
                    caption: `✅ *Video:* ${cachedVideo.title}` 
                }, { quoted: m });
            } else {
                return await conn.sendMessage(m.chat, { 
                    audio: { url: cachedVideo.music }, 
                    mimetype: 'audio/mp4', 
                    fileName: `${cachedVideo.id}.mp3` 
                }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            return m.reply("⚠️ *Error al enviar el archivo.*");
        }
    }

    if (!text) return m.reply("🔍 *Por favor, ingresa un término de búsqueda.*");

    try {
        if (m.react) await m.react("🔄");

        const res = await axios.get(`https://api.evogb.org/search/tiktok?query=${encodeURIComponent(text)}&key=sasuke`);
        
        if (!res.data || !res.data.status || !res.data.data || res.data.data.length === 0) {
            if (m.react) await m.react("❌");
            return m.reply("⚠️ *Sin resultados para esta búsqueda.*");
        }

        const videos = res.data.data;
        const videoAleatorio = videos[Math.floor(Math.random() * videos.length)];

        const { title, id, dl, duration, author, stats, music } = videoAleatorio;

        global.db.data.tiktokCache[id] = {
            id: id,
            title: title || "TikTok Video",
            dl: dl,
            music: music.url
        };

        let mensaje = `╭─〔 📥 *𝚃𝙸𝙺𝚃𝙾𝙺 𝚂𝙴𝙰𝚁𝙲𝙷* 〕─╮\n`;
        mensaje += `│ 👤 *𝙰𝚄𝚃𝙾𝚁:* ${author.nickname || 'Anónimo'}\n`;
        mensaje += `│ 📝 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title ? title.trim() : 'Sin descripción'}\n`;
        mensaje += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${duration}\n`;
        mensaje += `├───────────────────\n`;
        mensaje += `│ 👀 *𝚅𝙸𝚂𝚃𝙰𝚂:* ${Number(stats.views).toLocaleString()}\n`;
        mensaje += `│ ❤️ *𝙻𝙸𝙺𝙴𝚂:* ${Number(stats.likes).toLocaleString()}\n`;
        mensaje += `│ 💬 *𝙲𝙾𝙼𝙴𝙽𝚃𝙰𝚁𝙸𝙾𝚂:* ${Number(stats.comments).toLocaleString()}\n`;
        mensaje += `╰───────────────────╯`;

        const buttons = [
            { buttonId: `${usedPrefix}tiktoksearch ${text}`, buttonText: { displayText: '⏭️ Siguiente Video' }, type: 1 },
            { buttonId: `${usedPrefix}tts_aud ${id}`, buttonText: { displayText: '🎵 Extraer Audio' }, type: 1 },
            { buttonId: `${usedPrefix}tts_vid ${id}`, buttonText: { displayText: '📺 Ver en HD' }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            video: { url: dl },
            caption: mensaje,
            footer: 'By Barboza-Team ⚡',
            buttons: buttons,
            headerType: 4
        }, { quoted: m });

        if (m.react) await m.react("✅");

    } catch (error) {
        console.error(error);
        if (m.react) await m.react("❌");
        m.reply("⚠️ *Ocurrió un error al procesar la búsqueda.*");
    }
};

handler.command = /^(tiktoksearch|tts_vid|tts_aud)$/i;
export default handler;
