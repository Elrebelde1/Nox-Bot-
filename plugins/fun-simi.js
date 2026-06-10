import fetch from "node-fetch";

// Función auxiliar para pausar la ejecución (efecto de espera)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 1. Verificación de texto
  if (!text) {
    return conn.reply(m.chat, `*¡Hola!* 🤖\n\nEscribe tu pregunta para recibir una respuesta de la IA.\n\n*Ejemplo:* ${usedPrefix + command} ¿Quién es Messi?`, m);
  }

  // Mostramos un mensaje de "escribiendo" en reacción
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

    // 4. Validación del resultado
    if (json.status && json.result && json.result.text) {
      const finalResult = json.result.text.trim();

      // --- EFECTO DE ESCRITURA ESTILO META AI (Edición progresiva) ---
      
      // Separamos el texto por palabras
      const words = finalResult.split(" ");
      let currentText = "🤖 Pensando...";
      
      // Enviamos el primer mensaje base y guardamos su información (key) para poder editarlo
      const sentMsg = await conn.reply(m.chat, currentText, m);
      const msgKey = sentMsg.key || sentMsg.messageAMessageID || sentMsg;

      // Agrupamos palabras para que la edición sea rápida pero progresiva (bloques de 4 palabras)
      let wordBuffer = [];
      for (let i = 0; i < words.length; i++) {
        wordBuffer.push(words[i]);
        
        // Cada 4 palabras (o si es el final del texto), editamos el mensaje
        if (wordBuffer.length === 4 || i === words.length - 1) {
          currentText = words.slice(0, i + 1).join(" ");
          
          await conn.sendMessage(m.chat, {
            edit: msgKey,
            text: currentText
          });
          
          wordBuffer = [];
          // Pausa de 150 milisegundos entre actualizaciones para simular velocidad sobrehumana
          await delay(150); 
        }
      }

      // Reacción final de éxito
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
