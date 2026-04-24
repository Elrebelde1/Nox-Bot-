import { igdl } from "ruhend-scraper";

let handler = async (m, { args, conn, usedPrefix, command, text }) => {
    // Manejadores para los botones (HD y Audio)
    if (command === 'ig_vid' || command === 'ig_aud') {
        try {
            let res = await igdl(text);
            let mediaUrl = res.data[0].url;
            
            if (command === 'ig_vid') {
                return await conn.sendMessage(m.chat, { 
                    video: { url: mediaUrl }, 
                    caption: `✅ *Video en HD extraído*` 
                }, { quoted: m });
            } else {
                return await conn.sendMessage(m.chat, { 
                    audio: { url: mediaUrl }, 
                    mimetype: 'audio/mp4', 
                    fileName: 'instagram.mp3' 
                }, { quoted: m });
            }
        } catch {
            return conn.reply(m.chat, '❌ Error al procesar la solicitud del botón.', m);
        }
    }

    if (!args[0]) {
        return conn.reply(m.chat, '*`Ingresa El link Del vídeo a descargar 🤍`*', m);
    }

    try {
        await m.react('🕑');

        let res = await igdl(args[0]);
        let data = res.data; 

        for (let media of data) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await m.react('✅');

            // Configuración de botones igual a TikTok
            const buttons = [
                { buttonId: `${usedPrefix}ig_vid ${args[0]}`, buttonText: { displayText: 'Video en HD' }, type: 1 },
                { buttonId: `${usedPrefix}ig_aud ${args[0]}`, buttonText: { displayText: 'Extraer Audio' }, type: 1 }
            ];

            // Envía el video original con los botones
            await conn.sendMessage(m.chat, {
                video: { url: media.url },
                caption: '✅ *Instagram Encontrado*',
                footer: 'By Barboza-Team ⚡',
                buttons: buttons,
                headerType: 4
            }, { quoted: m });
        }
    } catch {
        await m.react('❌');
        conn.reply(m.chat, '❌ No se pudo descargar el contenido de Instagram.', m);
    }
}

handler.corazones = 2;
// Importante: agregar los comandos de los botones aquí
handler.command = /^(ig|igdl|instagram|ig_vid|ig_aud)$/i;
handler.tags = ['dl'];
handler.help = ['ig *<link>*'];

export default handler;
