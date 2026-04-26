import { igdl } from "ruhend-scraper";

let handler = async (m, { args, conn, usedPrefix, command, text }) => {
    // Limpieza de link para evitar errores por parámetros de rastreo (?igsh=...)
    let cleanUrl = text.split(' ')[0].split('?')[0];

    // Manejadores para los botones (HD y Audio)
    if (command === 'ig_vid' || command === 'ig_aud') {
        try {
            let res = await igdl(cleanUrl);
            let mediaUrl = res.data[0].url;

            if (command === 'ig_vid') {
                return await conn.sendMessage(m.chat, { 
                    video: { url: mediaUrl }, 
                    caption: `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ✅  *INSTAGRAM HD LISTO* \n╚════════════════════╝` 
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
        return conn.reply(m.chat, '╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ❌  *ERROR DE ENLACE* \n╚════════════════════╝\n\n*Ingresa el link de Instagram a descargar.*', m);
    }

    try {
        await m.react('🕑');

        let res = await igdl(cleanUrl);
        let data = res.data; 

        if (!data || data.length === 0) {
            await m.react('❌');
            return conn.reply(m.chat, '*No se encontraron resultados. El perfil podría ser privado.*', m);
        }

        for (let media of data) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await m.react('✅');

            const buttons = [
                { buttonId: `${usedPrefix}ig_vid ${cleanUrl}`, buttonText: { displayText: 'Video en HD 🎥' }, type: 1 },
                { buttonId: `${usedPrefix}ig_aud ${cleanUrl}`, buttonText: { displayText: 'Extraer Audio 🎵' }, type: 1 }
            ];

            const caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   ✅  *INSTAGRAM ENCONTRADO* ╚════════════════════╝

_Usa los botones para HD o Audio._`.trim();

            await conn.sendMessage(m.chat, {
                video: { url: media.url },
                caption: caption,
                footer: 'By Barboza-Team ⚡',
                buttons: buttons,
                headerType: 4
            }, { quoted: m });
        }
    } catch {
        await m.react('❌');
        conn.reply(m.chat, '❌ No se pudo descargar el contenido. Instagram es estricto con los links temporales.', m);
    }
}

handler.command = /^(ig|igdl|instagram|ig_vid|ig_aud)$/i;
handler.tags = ['dl'];
handler.help = ['ig *<link>*'];

export default handler;
