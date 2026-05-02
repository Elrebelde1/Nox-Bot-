import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    let imgBuffer;

    m.react('🕒');

    try {
        const formData = new FormData();
        formData.append("size", "auto");

        // Lógica dual: Si es imagen adjunta o si es URL por texto
        if (/image/.test(mime)) {
            // Caso 1: El usuario responde a una imagen
            await conn.sendMessage(m.chat, { text: '*🧑‍💻 Procesando imagen adjunta...*' }, { quoted: m });
            imgBuffer = await q.download();
            const blob = new Blob([imgBuffer], { type: mime });
            formData.append("image_file", blob, "image.png");
        } else if (text && text.startsWith('http')) {
            // Caso 2: El usuario proporciona una URL
            await conn.sendMessage(m.chat, { text: '*🧑‍💻 Procesando URL de imagen...*' }, { quoted: m });
            formData.append("image_url", text);
        } else {
            // Caso 3: No hay ni imagen ni URL válida
            m.react('✖️');
            throw `*🧑‍💻 Etiqueta una imagen o ingresa una URL válida.*`;
        }

        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: { "X-Api-Key": "pZoqmwkwmMSJAVdJFDnMgWB8" }, // Recuerda proteger tu API Key
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors ? errorData.errors[0].title : 'Error al conectar con Remove.bg');
        }

        const buffer = await response.arrayBuffer();
        m.react('☑️');
        
        await conn.sendMessage(m.chat, { 
            image: Buffer.from(buffer), 
            caption: '✅ Fondo eliminado con éxito.' 
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.react('✖️');
        throw `*⚠️ Error:* ${error.message}`;
    }
}

handler.tags = ['tools'];
handler.help = ['removebg'];
handler.command = ['removebg', 'bg'];

export default handler;
