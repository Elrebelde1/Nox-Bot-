import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const query = text || (m.quoted && m.quoted.text);
    
    if (!query) return conn.reply(m.chat, `Escribe tu pregunta.\n\n*Ejemplo:* ${usedPrefix}${command} hola`, m);

    await m.react('⏳');

    try {
        const { data } = await axios.get(`https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(query)}`);
        
        if (!data.status) return m.react('❌');

        let res = data.data
            .replace(/Current Conditions/g, "Condiciones Actuales")
            .replace(/Feels Like/g, "Sensación térmica")
            .replace(/Wind/g, "Viento")
            .replace(/Humidity/g, "Humedad")
            .replace(/Precipitation/g, "Precipitación")
            .replace(/Today's Forecast/g, "Pronóstico de Hoy")
            .replace(/light snow/g, "nieve ligera");

        await conn.sendMessage(m.chat, { text: res }, { quoted: m });
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        console.log(e);
    }
};

handler.help = ['chatgpt', 'ia'];
handler.tags = ['ia'];
handler.command = ['chatgpt', 'pene'];

export default handler;
