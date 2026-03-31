import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

global.emoji = '✨'
global.emoji2 = '⚠️'

let handler = async (m, { conn }) => {
    // Verificar si se respondió a una imagen
    if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
        return m.reply(`${global.emoji} Por favor, responde a una imagen con el comando *setbanner* para actualizar la foto del menú.`);
    }

    try {
        const media = await m.quoted.download();
        
        // Validar tipo de archivo
        const filetype = await fileTypeFromBuffer(media);
        if (!filetype || !filetype.mime.startsWith('image/')) {
            return m.reply(`${global.emoji2} El archivo enviado no es una imagen válida.`);
        }

        m.reply('Wait... subiendo imagen a Qu.ax 🚀');

        // Subida a Qu.ax
        const uploadRes = await uploadToQuax(media);
        const url = uploadRes.url;

        // Guardar en la base de datos
        let botData = global.db.data.settings[conn.user.jid] || {};
        botData.banner = url;
        global.db.data.settings[conn.user.jid] = botData;

        await conn.sendFile(m.chat, media, 'banner.jpg', `${global.emoji} *Banner Actualizado!*\n\n🔗 *URL:* ${url}`, m);

    } catch (e) {
        console.error(e);
        m.reply(`❌ Error: ${e.message}`);
    }
}

/**
 * Función para subir archivos a Qu.ax
 * @param {Buffer} buffer 
 */
async function uploadToQuax(buffer) {
    const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream' };
    const form = new FormData();
    
    // Qu.ax requiere el campo 'files[]'
    form.set("files[]", new Blob([buffer], { type: mime }), `file.${ext}`);

    const resp = await fetch("https://qu.ax/upload.php", {
        method: "POST",
        body: form
    });

    const result = await resp.json();

    if (result.success && result.files && result.files[0]) {
        return { url: result.files[0].url };
    } else {
        throw new Error('Error al subir a Qu.ax');
    }
}

handler.help = ['setbanner'];
handler.tags = ['tools'];
handler.command = ['setbanner'];

export default handler;
