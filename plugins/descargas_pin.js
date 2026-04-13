import axios from "axios";
import baileys from "@whiskeysockets/baileys";

let handler = async (m, { conn, text }) => {
  // Validación: Si no hay texto, el bot avisa que falta la consulta
  if (!text) return m.reply("Por favor, proporciona un texto para buscar en Pinterest.\n\nEjemplo: *.pin Messi*");

  // Reacción de inicio
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    // URL de la API de Sylphyy con los parámetros correctos
    const apiUrl = `https://sylphyy.xyz/search/pinterest?q=${encodeURIComponent(text)}&api_key=sylphy-6f150d`;
    
    const response = await axios.get(apiUrl, { timeout: 15000 });
    const res = response.data;

    // Validación de la respuesta de la API
    if (!res.status || !res.result || !Array.isArray(res.result) || res.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`No encontré imágenes para: "${text}"`);
    }

    // Filtramos y tomamos exactamente 8 imágenes
    const limitedResults = res.result.slice(0, 8);

    const medias = limitedResults.map((item) => ({
      type: "image",
      data: { url: item.image } 
    }));

    // Título del álbum
    const albumCaption = `✅ *Pinterest:* ${text}\n📸 *Imágenes encontradas:* ${medias.length}`;

    // Envío usando la función de álbum optimizada
    await sendAlbumMessage(conn, m.chat, medias, { 
      caption: albumCaption, 
      quoted: m,
      delay: 1000 // Delay de 1 segundo entre imágenes para evitar spam filters
    });

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error en Pinterest Sylphyy:", error);
    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
    m.reply("Hubo un fallo al conectar con el servidor de imágenes. Intenta de nuevo.");
  }
};

// --- Función de envío de álbumes ---
async function sendAlbumMessage(conn, jid, medias, options = {}) {
  const { delay = 500, caption = "", quoted = null } = options;

  const album = baileys.generateWAMessageFromContent(jid, {
    messageContextInfo: {},
    albumMessage: {
      expectedImageCount: medias.filter(m => m.type === "image").length,
      expectedVideoCount: medias.filter(m => m.type === "video").length,
      contextInfo: quoted ? {
        remoteJid: quoted.key.remoteJid,
        fromMe: quoted.key.fromMe,
        stanzaId: quoted.key.id,
        participant: quoted.key.participant || quoted.key.remoteJid,
        quotedMessage: quoted.message,
      } : {}
    }
  }, {});

  await conn.relayMessage(jid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const msg = await baileys.generateWAMessage(jid, {
      [type]: data,
      ...(i === 0 ? { caption } : {}) // Solo la primera imagen lleva el texto
    }, { upload: conn.waUploadToServer });

    msg.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key }
    };

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

handler.help = ["pinterest <texto>"];
handler.tags = ["search"];
handler.command = /^(pinterest|pin)$/i;

export default handler;
