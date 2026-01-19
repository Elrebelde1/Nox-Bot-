import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definiciones de contexto
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})

    // Obtener la consulta desde el texto o el mensaje citado
    const query = text || (m.quoted && m.quoted.text);

    if (!query) {
        await conn.sendMessage(m.chat, {
            react: { text: '❓', key: m.key }
        });
        return conn.reply(m.chat, `🤖 **¡Hola! Por favor, hazme una pregunta.**\n\nEjemplo: ${usedPrefix}${command} ¿Qué es la inteligencia artificial?`, m, ctxWarn);
    }

    try {
        await conn.sendMessage(m.chat, {
            react: { text: '✨', key: m.key }
        });

        // Llamada a la nueva API de Delirius
        const response = await axios.get(`https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(query)}`);
        
        const result = response.data.data;

        if (!result) {
            throw new Error("No se recibió una respuesta válida de la API.");
        }

        // Respuesta final
        await conn.reply(m.chat, `✨ *Respuesta de ChatGPT:*\n\n${result}`, m, ctxOk);

        await conn.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });

    } catch (err) {
        console.error("Error API Delirius:", err.message);

        await conn.sendMessage(m.chat, {
            react: { text: '💥', key: m.key }
        });

        await conn.reply(m.chat, `⚠️ **¡Ups! Ha ocurrido un fallo al conectar con la IA.**\n\nDetalles: *${err.message}*`, m, ctxErr);
    }
};

handler.help = ['gemini'];
handler.tags = ['ia'];
handler.command = ['gemini']; // Puedes mantener o cambiar los comandos
handler.group = true;

export default handler;
