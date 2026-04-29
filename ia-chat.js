import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const query = text || (m.quoted && m.quoted.text);

    if (!query) return conn.reply(m.chat, `*¿Qué necesitas, Ninja?*\n\nUso: ${usedPrefix}${command} <pregunta>`, m);

    await m.react('🌌');

    try {
        const { data } = await axios.get(`https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(query)}`);

        if (!data.status || !data.data) throw "Error";

        const res = data.data
            .replace(/Current Conditions/g, "Condiciones Actuales")
            .replace(/Feels Like/g, "Sensación")
            .replace(/Wind/g, "Viento")
            .replace(/Humidity/g, "Humedad")
            .replace(/Precipitation/g, "Precipitación")
            .replace(/Today's Forecast/g, "Pronóstico")
            .replace(/light snow/g, "nieve ligera");

        global.sasukeSession = global.sasukeSession || {};
        global.sasukeSession[m.chat] = {
            content: res,
            time: Date.now()
        };

        await conn.sendMessage(m.chat, { text: res }, { quoted: m });
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
    }
};

handler.before = async (m) => {
    global.sasukeSession = global.sasukeSession || {};
    if (global.sasukeSession[m.chat] && Date.now() - global.sasukeSession[m.chat].time > 60000) {
        delete global.sasukeSession[m.chat];
    }
};

handler.command = ['sasuke'];

export default handler;
