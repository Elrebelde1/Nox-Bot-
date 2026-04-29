import fetch from "node-fetch";

const timeout = 30000;

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const query = text || (m.quoted && m.quoted.text);
    
    if (!query) return conn.reply(m.chat, `*Escribe una pregunta.*\n\n*Ejemplo:* ${usedPrefix}${command} ¿Cómo estás?`, m);

    try {
        const response = await fetch(`https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(query)}`);
        const json = await response.json();

        if (json.status && json.data) {
            conn.iaSession = conn.iaSession || {};
            conn.iaSession[m.chat] = {
                respuesta: json.data,
                timeout: setTimeout(() => {
                    if (conn.iaSession[m.chat]) {
                        delete conn.iaSession[m.chat];
                    }
                }, timeout),
            };

            await conn.reply(m.chat, json.data, m);
        } else {
            await conn.reply(m.chat, `⚠️ No se pudo obtener respuesta.`, m);
        }
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ Error de conexión.`, m);
    }
};

handler.before = async (m, { conn }) => {
    if (conn.iaSession && conn.iaSession[m.chat] && !m.fromMe && m.text) {
        clearTimeout(conn.iaSession[m.chat].timeout);
        delete conn.iaSession[m.chat];
    }
};

handler.command = ['barbox'];

export default handler;
