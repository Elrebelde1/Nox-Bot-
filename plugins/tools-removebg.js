import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';

const handler = async (m, { conn, text }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    m.react('🕒');

    try {
        const formData = new FormData();
        let api = `https://api.evogb.org/tools/removebg?key=Jotaa.hrzkey`;

        if (/image/.test(mime)) {
            let img = await q.download();
            const blob = new Blob([img], { type: mime });
            formData.append("method", "file");
            formData.append("file", blob, "image.png");
        } else if (text && text.startsWith('http')) {
            formData.append("method", "url");
            formData.append("url", text);
        } else {
            m.react('✖️');
            throw `Responda a una imagen o proporcione una URL.`;
        }

        const response = await fetch(api, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error('API Error');

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength < 500) throw new Error('Imagen no procesada');

        m.react('☑️');
        await conn.sendMessage(m.chat, { image: Buffer.from(buffer) }, { quoted: m });

    } catch (error) {
        m.react('✖️');
        throw `Error: ${error.message}`;
    }
}

handler.tags = ['tools'];
handler.help = ['removebg'];
handler.command = ['removebg', 'bg'];

export default handler;
