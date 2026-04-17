
import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `¡Hola! ¿En qué puedo ayudarte hoy? Por favor, ingresa una consulta.`, m, rcanal);
  }

  try {
    // Configuración de la nueva API
    const apiKey = "sylphy-6f150d";
    const url = `https://sylphyy.xyz/ai/copilot?text=${encodeURIComponent(text)}&api_key=${apiKey}`;
    
    const res = await fetch(url);
    const data = await res.json();

    // Verificación de la respuesta según la estructura de la API
    if (data.status && data.result && data.result.text) {
      await conn.reply(m.chat, data.result.text, m, rcanal);
    } else {
      await conn.reply(m.chat, "❌ No se pudo obtener una respuesta válida de la IA.", m, fake);
    }

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, "⚠️ Hubo un error al conectar con el servicio de IA.", m, fake);
  }
};

handler.tags = ["ia"];
handler.command = handler.help = ['ia', 'copilot'];

export default handler;
