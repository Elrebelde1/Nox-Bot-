import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 1. Verificación de texto
  if (!text) {
    return conn.reply(m.chat, `*¡Hola!* 🤖\n\nEscribe tu pregunta para recibir una respuesta de la IA.\n\n*Ejemplo:* ${usedPrefix + command} ¿Quién es Messi?`, m);
  }

  // Mostramos un mensaje de "escribiendo" para que el usuario sepa que la IA está pensando
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    // 2. Configuración de parámetros
    const apiKey = "sylphy-6f150d";
    const basePrompt = "Tu nombre es Gemini. Eres un asistente útil y amable. Debes responder SIEMPRE en español, de forma detallada y profesional.";
    
    // Construcción de la URL de forma segura
    const endpoint = new URL("https://sylphyy.xyz/ai/gemini");
    endpoint.searchParams.append("q", text);
    endpoint.searchParams.append("prompt", basePrompt);
    endpoint.searchParams.append("api_key", apiKey);

    // 3. Petición a la API
    const response = await fetch(endpoint.href);
    
    if (!response.ok) throw new Error("Error en la conexión con la API");

    const json = await response.json();

    // 4. Validación del resultado según el formato JSON proporcionado
    if (json.status && json.result && json.result.text) {
      const finalResult = json.result.text.trim();
      
      // Enviamos la respuesta limpia
      await conn.reply(m.chat, finalResult, m);
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error("Respuesta de API vacía o mal estructurada");
    }

  } catch (error) {
    console.error("Error en el comando IA:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await conn.reply(m.chat, "⚠️ *Error del servidor:* No se pudo obtener una respuesta en este momento. Inténtalo más tarde.", m);
  }
};

handler.help = ["gemini", "ia"];
handler.tags = ["ia"];
handler.command = /^(gemini|chatgpt)$/i;

export default handler;
