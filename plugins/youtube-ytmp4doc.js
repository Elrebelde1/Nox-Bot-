import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn, text }) => {
    // Forzamos a que el texto sea '1' o '2'
    let type = text.trim();
    if (type !== '1' && type !== '2') return m.reply(`⚠️ Responde a una imagen y escribe:\n*setbanner 1* o  *setbanner 2*`);
    
    if (!m.quoted || !/image/.test(m.quoted.mimetype)) return m.reply(`⚠️ Responde a una imagen.`);

    try {
        const media = await m.quoted.download();
        m.reply('Subiendo a Qu.ax... 🚀');
        
        const uploadRes = await uploadToQuax(media);
        const url = uploadRes.url;

        // Acceso correcto a la base de datos de configuración del bot
        if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {};
        let botData = global.db.data.settings[conn.user.jid];
        
        if (type === '1') botData.banner1 = url;
        if (type === '2') botData.banner2 = url;
        
        await m.reply(`✅ *Banner ${type} Actualizado*\n🔗 URL: ${url}`);
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
}

async function uploadToQuax(buffer) {
    const { ext, mime } = await fileTypeFromBuffer(buffer);
    const form = new FormData();
    form.set("files[]", new Blob([buffer], { type: mime }), `file.${ext}`);
    const resp = await fetch("https://qu.ax/upload.php", { method: "POST", body: form });
    const result = await resp.json();
    if (result.success) return { url: result.files[0].url };
    throw new Error('Fallo al subir');
}

handler.command = ['setbanner'];
export default handler;
