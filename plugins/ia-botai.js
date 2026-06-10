import fetch from "node-fetch";

// Función auxiliar para pausar la ejecución (efecto de espera)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `¡Hola! ¿En qué puedo ayudarte hoy? Por favor, ingresa una consulta.`, m, rcanal);
  }

  // Mostramos reacción de espera opcional
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    // Configuración de la API
    const apiKey = "sylphy-6f150d";
    const url = `https://sylphyy.xyz/ai/copilot?text=${encodeURIComponent(text)}&api_key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    // Verificación de la respuesta según la estructura de la API
    if (data.status && data.result && data.result.text) {
      const finalResult = data.result.text.trim();

      // --- EFECTO DE ESCRITURA ESTILO META AI ---
      
      // Separamos el texto por palabras
      const words = finalResult.split(" ");
      let currentText = "🤖 Copilot está pensando...";
      
      // Enviamos el primer mensaje base y guardamos su información (key) para poder editarlo
      const sentMsg = await conn.reply(m.chat, currentText, m, rcanal);
      const msgKey = sentMsg.key || sentMsg.messageAMessageID || sentMsg;

      // Agrupamos palabras para que la edición sea rápida pero fluida (bloques de 4 palabras)
      let wordBuffer = [];
      for (let i = 0; i < words.length; i++) {
        wordBuffer.push(words[i]);
        
        // Cada 4 palabras (o si llegamos al final), editamos el mensaje
        if (wordBuffer.length === 4 || i === words.length - 1) {
          currentText = words.slice(0, i + 1).join(" ");
          
          await conn.sendMessage(m.chat, {
            edit: msgKey,
            text: currentText
          });
          
          wordBuffer = [];
          // Pausa de 150ms para mantener el efecto de velocidad sobrehumana
          await delay(150); 
        }
      }

      // Reacción de éxito al terminar de escribir
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } else {
      await conn.reply(m.chat, "❌ No se pudo obtener una respuesta válida de la IA.", m, fake);
    }

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await conn.reply(m.chat, "⚠️ Hubo un error al conectar con el servicio de IA.", m, fake);
  }
};

handler.tags = ["ia"];
handler.command = handler.help = ['ia', 'copilot'];

export default handler;
