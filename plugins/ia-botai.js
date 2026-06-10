import fetch from "node-fetch";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `¡Hola! ¿En qué puedo ayudarte hoy? Por favor, ingresa una consulta.`, m, rcanal);
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const apiKey = "sylphy-6f150d";
    const url = `https://sylphyy.xyz/ai/copilot?text=${encodeURIComponent(text)}&api_key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status && data.result && data.result.text) {
      const finalResult = data.result.text.trim();

      const words = finalResult.split(" ");
      let currentText = "🤖 Copilot está pensando...";
      
      const sentMsg = await conn.reply(m.chat, currentText, m, rcanal);
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
          await delay(120); 
        }
      }

      // ASEGURAR TEXTO COMPLETO: Garantiza que no quede cortado al final del bucle
      if (currentText !== finalResult) {
        await conn.sendMessage(m.chat, { edit: msgKey, text: finalResult });
      }

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
