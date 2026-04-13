import axios from "axios";
import baileys from "@whiskeysockets/baileys";

let handler = async (m, { conn, text }) => {
  // Si no envías texto, usará por defecto "Barcelona vs Bayern 4-1"
  let query = text ? text : "Barcelona vs Bayern 4-1";

  await conn.sendMessage(m.chat, { react: { text: "⚽", key: m.key } });

  try {
    // URL con la nueva API y el parámetro de búsqueda 'q'
    const apiUrl = `https://sylphyy.xyz/search/pinterest?q=${encodeURIComponent(query)}&api_key=sylphy-6f150d`;
    
    const response = await axios.get(apiUrl, { timeout: 15000 });
    const res = response.data;

    // La API de Sylphyy devuelve el array en 'res.result'
    if (!res.status || !res.result || res.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("No se encontraron imágenes para esa búsqueda.");
    }

    // Tomamos las primeras 6 imágenes (puedes ajustar este número)
    const limitedResults = res.result.slice(0, 6);

    const medias = limitedResults.map((item) => ({
      type: "image",
      data: { url: item.image } // 'item.image' es la propiedad correcta en esta API
    }));

    const albumCaption = `🏟️ *Resultado:* ${query}\n📸 *Imágenes obtenidas vía Pinterest*`;

    // Envío del álbum optimizado
    await sendAlbumMessage(conn, m.chat, medias, { 
      caption: albumCaption, 
      quoted: m,
      delay: 1000 
    });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error en Pinterest Sylphyy:", error);
    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
    m.reply("Ocurrió un error al procesar la búsqueda.");
  }
};

// --- Función para enviar álbumes ---
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
