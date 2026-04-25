import axios from "axios";
import Jimp from "jimp";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    
    if (command === 'cartel') {
        if (!text) return m.reply(`📝 Escribe el mensaje para el pizarrón.\n\n*Ejemplo:* ${usedPrefix}${command} Hola a todos`);

        try {
            m.react("🎨");
            
            const urlBase = 'https://i.ibb.co/3Yv6Y9j/sasuke-pizarron.png'; 
            
            const imagen = await Jimp.read(urlBase);
            const fuente = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

            const x = 120; 
            const y = 180;
            const anchoMax = 350;

            imagen.print(
                fuente,
                x,
                y,
                {
                    text: text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                },
                anchoMax,
                anchoMax
            );

            const buffer = await imagen.getBufferAsync(Jimp.MIME_PNG);

            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: '⚡ *Sasuke ha hablado:*' 
            }, { quoted: m });

            m.react("✅");

        } catch (e) {
            console.error(e);
            m.reply("⚠️ Hubo un fallo al generar la imagen. Intenta de nuevo.");
        }
        return;
    }

    if (command === 'playbot') {
        if (!text) return m.reply("🎵 Ingresa el término para buscar en TikTok.");
        try {
            m.react("🔄");
            let info = await tiktok.search(text);
            let v = info[Math.floor(Math.random() * info.length)];
            
            let res = await axios.get(`https://www.tikwm.com/api/?url=${v.id}`);
            let data = res.data.data;

            let repro = `
      *LOS REYES DE LOS BOTS*
   
   🎵 *Titulo:* ${v.metadata.titulo.substring(0, 30)}...
   👤 *Canal:* ${v.author.name}

   0:01 ━━━●──────── 3:45
         ⇆      ◁    ❚❚    ▷     ↻

   *By Barboza-Team ⚡*`.trim();

            await conn.sendMessage(m.chat, { image: { url: data.cover }, caption: repro }, { quoted: m });
            await conn.sendMessage(m.chat, { audio: { url: data.music }, mimetype: 'audio/mp4', fileName: 'music.mp3' }, { quoted: m });
            m.react("✅");
        } catch (error) {
            m.reply("⚠️ Sin resultados.");
        }
    }
};

handler.command = /^(cartel|playbot)$/i;
export default handler;

const tiktok = {
    search: async function (q) {
        const config = {
            method: "post",
            url: "https://tikwm.com/api/feed/search",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            data: { count: 20, keywords: q }
        };
        const response = await axios(config);
        return response.data.data.videos.map((v) => ({
            id: v.video_id,
            metadata: { titulo: v.title },
            author: { name: v.author.nickname }
        }));
    }
};
