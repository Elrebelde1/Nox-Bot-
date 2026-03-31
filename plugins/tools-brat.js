import { sticker } from '../lib/sticker.js';
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Si no hay texto, enviamos el error sin usar la variable 'emoji' que no existe
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `*⚠️ Por favor ingresa el texto para crear tu sticker animado.*\n\nEjemplo: _${usedPrefix + command} Hola_`,
        }, { quoted: m });
    }

    try {
        // Reacción de espera
        if (m.react) m.react('⌛');

        // URL de la API que pediste (Animada)
        const apiUrl = `https://sylphy.xyz/tools/brat?text=${encodeURIComponent(text)}&color=Negro&fondo=Blanco&type=Anim&api_key=sylphy-6f150d`;

        // Descargamos el contenido (video/gif)
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        // Generamos el sticker. 
        // Usamos global.botname o 'Brat' como respaldo para evitar más ReferenceErrors
        let stiker = await sticker(buffer, false, global.botname || 'BratBot', global.nombre || 'Sebastián');

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
            if (m.react) m.react('✅');
        } else {
            throw new Error("No se pudo convertir el video a sticker.");
        }

    } catch (error) {
        console.error(error);
        if (m.react) m.react('❌');
        
        // Reemplacé '${msm}' por un texto fijo para evitar el ReferenceError
        return conn.sendMessage(m.chat, {
            text: `❌ *Ocurrió un error:* ${error.message}`,
        }, { quoted: m });
    }
};

handler.command = ['brat'];
handler.tags = ['sticker'];
handler.help = ['brat *<texto>*'];

export default handler;
