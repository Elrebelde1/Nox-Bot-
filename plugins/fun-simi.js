import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `💥 ¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?`, m);
  }

  try {
    // Agregamos una instrucción al texto para asegurar que la respuesta sea en español
    const promptSystem = "Responde siempre en español de forma amable y concisa: ";
    const fullQuery = promptSystem + text;

    // Usando el endpoint de Delirius IA
    const url = `https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(fullQuery)}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.status || !data.data) {
      return conn.reply(m.chat, "❌ No recibí respuesta de la IA, intenta de nuevo.", m);
    }

    // Enviamos la respuesta obtenida en español
    await conn.reply(m.chat, `${data.data}`, m);

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, "⚠️ Hubo un error al conectar con la IA.", m);
  }
};

handler.tags = ["ia"];
handler.command = handler.help = ["ia", "chatgpt"];

export default handler;
