import fetch from "node-fetch";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*¡Hola!* 🤖\n\nEscribe tu pregunta para recibir una respuesta de la IA.\n\n*Ejemplo:* ${usedPrefix + command} ¿Quién es Messi?`, m);
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const apiKey = "sylphy-6f150d";
    const basePrompt = "Tu nombre es Gemini. Eres un asistente útil y amable. Debes responder SIEMPRE en español, de forma detallada y profesional.";

    const endpoint = new URL("https://sylphyy.xyz/ai/gemini");
    endpoint.searchParams.append("q", text);
    endpoint.searchParams.append("prompt", basePrompt);
    endpoint.searchParams.append("api_key", apiKey);

    const response = await fetch(endpoint.href);
    if (!response.ok) throw new Error("Error en la conexión con la API");

    const json = await response.json();

    if (json.status && json.result && json.result.text) {
      const finalResult = json.result.text.trim();

      const words = finalResult.split(" ");
      let currentText = "🤖 Pensando...";
      
      const sentMsg = await conn.reply(m.chat, currentText, m);
      const msgKey = sentMsg.key || sentMsg.messageAMessageID || sentMsg;

      let wordBuffer = [];
      for (let i = 0; i < words.length; i++) {
        wordBuffer.push(words[i]);
        
        if (wordBuffer.length === 4 || i === words.length - 1) {
          currentText = words.slice(0, i + 1).join(" ");
          
          await conn.sendMessage(m.chat, {
            edit: msgKey,
            text: currentText
          });
          
          wordBuffer = [];
          await delay(120); // Un pelín más rápido para evitar lag de red
        }
      }

      // ASEGURAR TEXTO COMPLETO: Si faltó algo por el delay, se edita con el final original
      if (currentText !== finalResult) {
        await conn.sendMessage(m.chat, { edit: msgKey, text: finalResult });
      }

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } else {
      throw new Error("Respuesta de API vacía o malcommestucturada");
    }

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await conn.reply(m.chat, "⚠️ *Error del servidor:* No se pudo obtener una respuesta en este momento.", m);
  }
};

handler.help = ["gemini", "ia"];
handler.tags = ["ia"];
handler.command = /^(gemini|chatgpt)$/i;

export default handler;
