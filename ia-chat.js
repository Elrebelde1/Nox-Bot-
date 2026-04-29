import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const query = text || (m.quoted && m.quoted.text);
    
    if (!query) {
        return conn.reply(m.chat, `*¡Hola!* Por favor ingresa una pregunta.\n\n*Ejemplo:* ${usedPrefix}${command} ¿Quién es Simón Bolívar?`, m);
    }

    await m.react('✨');

    try {
        const response = await fetch(`https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(query)}`);
        const json = await response.json();

        if (!json.status || !json.data) throw "Error en la respuesta";

        let resultado = json.data
            .replace(/Current Conditions/g, "Condiciones Actuales")
            .replace(/Feels Like/g, "Sensación térmica")
            .replace(/Wind/g, "Viento")
            .replace(/Humidity/g, "Humedad")
            .replace(/Precipitation/g, "Precipitación")
            .replace(/Today's Forecast/g, "Pronóstico de Hoy")
            .replace(/light snow/g, "nieve ligera")
            .replace(/partly cloudy/g, "parcialmente nublado")
            .replace(/United States/g, "Estados Unidos");

        await conn.sendMessage(m.chat, { text: resultado }, { quoted: m });
        await m.react('✅');

    } catch (error) {
        await m.react('✖️');
        await conn.reply(m.chat, `*Ocurrió un error:* ${error}`, m);
    }
};

handler.help = ['chatgpt', 'pene'];
handler.tags = ['main'];
handler.command = ['chatgpt', 'pene'];

export default handler;
