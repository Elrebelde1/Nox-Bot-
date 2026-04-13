import axios from "axios";
import baileys from "@whiskeysockets/baileys";

let handler = async (m, { conn, text }) => {
  // Validación: Si no hay texto, pide una consulta al usuario
  if (!text) return m.reply("Por favor, proporciona un texto para buscar en Pinterest.\n\nEjemplo: *.pin paisajes estéticos*");

  // 1. Reaccionar para indicar que estamos trabajando
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    // 2. Petición a la API de Sylphyy
    const apiUrl = `https://sylphyy.xyz/search/pinterest?q=${encodeURIComponent(text)}&api_key=sylphy-6f150d`;
    const response = await axios.get(apiUrl, { timeout: 10000 });

    const res = response.data;

    // 3. Validar si hay resultados
    if (!res.status || !res.result || res.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("No encontré resultados para esa búsqueda.");
    }

    // 4. Limitar a las primeras 8 imágenes
    const limitedResults = res.result.slice(0, 8); 

    const medias = limitedResults.map((item) => ({
      type: "image",
      data: { url: item.image } 
    }));

    // 5. Enviar el álbum
    const albumCaption = `✅ *Pinterest:* ${text}`;

    await sendAlbumMessage(conn, m.chat, medias, { 
      caption: albumCaption, 
      quoted: m,
      delay: 800 
    });

    // 6. Confirmación final
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error en Pinterest:", error);
    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
    m.reply("Hubo un fallo al obtener las imágenes.");
  }
};

// --- Función de álbum optimizada ---
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
      ...(i === 0 ? { caption } : {})
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
