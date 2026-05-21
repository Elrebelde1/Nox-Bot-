import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.db) global.db = { data: {} };
    if (!global.db.data.tiktokCache) global.db.data.tiktokCache = {};

    if (command === 'tts_vid' || command === 'tts_aud') {
        const videoId = text.trim();
        const cachedVideo = global.db.data.tiktokCache[videoId];

        if (!cachedVideo) {
            return m.reply("⚠️ *El enlace ha expirado o no se encuentra en la caché. Busca de nuevo.*");
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
            return m.reply("⚠️ *Error al enviar el archivo solicitado.*");
        }
    }

    if (!text) return m.reply("🔍 *Por favor, ingresa un término de búsqueda.*");

    try {
        if (m.react) await m.react("🔄");

        let videoAleatorio;
        let origen = "";

        try {
            const res1 = await axios.get(`https://sylphyy.xyz/search/tiktok?q=${encodeURIComponent(text)}&count=15&api_key=sylphy-6f150d`);
            if (res1.data && res1.data.status && res1.data.result && res1.data.result.length > 0) {
                const dataRaw = res1.data.result[Math.floor(Math.random() * res1.data.result.length)];
                videoAleatorio = {
                    id: dataRaw.id,
                    title: dataRaw.title,
                    duration: `${dataRaw.duration}s`,
                    author: dataRaw.author.nickname,
                    views: dataRaw.stats.play_count,
                    likes: dataRaw.stats.digg_count,
                    comments: dataRaw.stats.comment_count,
                    dl: dataRaw.media.no_watermark,
                    music: dataRaw.media.music
                };
                origen = "Sylphy API";
            }
        } catch (e) {
            console.log("Fallo API 1, intentando API 2...");
        }

        if (!videoAleatorio) {
            try {
                const res2 = await axios.get(`https://api.evogb.org/search/tiktok?query=${encodeURIComponent(text)}&key=sasuke`);
                if (res2.data && res2.data.status && res2.data.data && res2.data.data.length > 0) {
                    const dataRaw = res2.data.data[Math.floor(Math.random() * res2.data.data.length)];
                    videoAleatorio = {
                        id: dataRaw.id,
                        title: dataRaw.title,
                        duration: dataRaw.duration,
                        author: dataRaw.author.nickname,
                        views: dataRaw.stats.views,
                        likes: dataRaw.stats.likes,
                        comments: dataRaw.stats.comments,
                        dl: dataRaw.dl,
                        music: dataRaw.music.url
                    };
                    origen = "EvoGB API";
                }
            } catch (e) {
                console.log("Fallo API 2, intentando Scraper Nacio de emergencia...");
            }
        }

        if (!videoAleatorio) {
            try {
                const dataRaw = await scraperTikTok(text);
                videoAleatorio = dataRaw;
                origen = "Emergency Scraper";
            } catch (e) {
                console.error(e);
            }
        }

        if (!videoAleatorio) {
            if (m.react) await m.react("❌");
            return m.reply("⚠️ *No se encontraron resultados en ninguna de las fuentes disponibles.*");
        }

        global.db.data.tiktokCache[videoAleatorio.id] = {
            id: videoAleatorio.id,
            title: videoAleatorio.title || "TikTok Video",
            dl: videoAleatorio.dl,
            music: videoAleatorio.music
        };

        let mensaje = `╭─〔 📥 *𝚃𝙸𝙺𝚃𝙾𝙺 𝚂𝙴𝙰𝚁𝙲𝙷* 〕─╮\n`;
        mensaje += `│ 👤 *𝙰𝚄𝚃𝙾𝚁:* ${videoAleatorio.author || 'Anónimo'}\n`;
        mensaje += `│ 📝 *ＴＩＴＵＬＯ:* ${videoAleatorio.title ? videoAleatorio.title.trim() : 'Sin descripción'}\n`;
        mensaje += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${videoAleatorio.duration}\n`;
        mensaje += `├───────────────────\n`;
        mensaje += `│ 👀 *𝚅𝙸𝚂𝚃𝙰𝚂:* ${Number(videoAleatorio.views).toLocaleString()}\n`;
        mensaje += `│ ❤️ *𝙻𝙸𝙺𝙴𝚂:* ${Number(videoAleatorio.likes).toLocaleString()}\n`;
        mensaje += `│ 💬 *ＣＯＭＥＮＴＡＲＩＯＳ:* ${Number(videoAleatorio.comments).toLocaleString()}\n`;
        mensaje += `╰───────────────────╯`;

        const buttons = [
            { buttonId: `${usedPrefix}tiktoksearch ${text}`, buttonText: { displayText: '⏭️ Siguiente Video' }, type: 1 },
            { buttonId: `${usedPrefix}tts_aud ${videoAleatorio.id}`, buttonText: { displayText: '🎵 Extraer Audio' }, type: 1 },
            { buttonId: `${usedPrefix}tts_vid ${videoAleatorio.id}`, buttonText: { displayText: '📺 Ver en HD' }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            video: { url: videoAleatorio.dl },
            caption: mensaje,
            footer: 'By Barboza-Team ⚡',
            buttons: buttons,
            headerType: 4
        }, { quoted: m });

        if (m.react) await m.react("✅");

    } catch (error) {
        console.error(error);
        if (m.react) await m.react("❌");
        m.reply("⚠️ *Ocurrió un error general en el sistema de búsqueda.*");
    }
};

async function scraperTikTok(query) {
    const data = { count: 10, cursor: 0, web: 1, hd: 1, keywords: query };
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
    if (response.data && response.data.data && response.data.data.videos.length > 0) {
        const video = response.data.data.videos[Math.floor(Math.random() * response.data.data.videos.length)];
        return {
            id: video.video_id,
            title: video.title,
            duration: `${video.duration}s`,
            author: video.author.nickname,
            views: video.play_count,
            likes: video.digg_count,
            comments: video.comment_count,
            dl: "https://tikwm.com" + video.play,
            music: "https://tikwm.com" + video.music
        };
    } else {
        throw new Error("Scraper sin info");
    }
}

handler.command = /^(tiktoksearch|tts_vid|tts_aud)$/i;
export default handler;
