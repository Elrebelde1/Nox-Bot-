import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `💥 ¡Hola! ¿En qué puedo ayudarte hoy? (Respondo en español)`, m);
  }

  try {
    // Definimos la instrucción de idioma
    const sistema = "Por favor, responde exclusivamente en español: ";
    const query = encodeURIComponent(sistema + text);
    
    // Nueva API de Sylphy (Gemini)
    const url = `https://sylphy.xyz/ai/gemini?q=${query}&prompt=&api_key=sylphy-6f150d`;

    const res = await fetch(url);
    const data = await res.json();

    // Verificamos la estructura según el JSON que proporcionaste
    if (data.status && data.result && data.result.text) {
      await conn.reply(m.chat, data.result.text, m);
    } else {
      await conn.reply(m.chat, "❌ La IA no devolvió un formato válido.", m);
    }

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, "⚠️ Error al conectar con el servidor de Sylphy.", m);
  }
};

handler.tags = ["ia"];
handler.command = handler.help = ["ia", "gemini", "chatgpt"];

export default handler;
