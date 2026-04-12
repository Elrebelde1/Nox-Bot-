import axios from "axios";
import baileys from "@whiskeysockets/baileys";

let handler = async (m, { conn, text, args }) => {
  if (!text) return m.reply("Por favor, proporciona una consulta.\n\nEjemplo: *.pinterest Twice*");

  // 1. Reaccionar para indicar que estamos trabajando
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    // 2. Petición a la API con tiempo de espera (10 segundos)
    const apiUrl = `https://api.delirius.store/search/pinterest?text=${encodeURIComponent(text)}`;
    const response = await axios.get(apiUrl, { timeout: 10000 });
    
    const res = response.data;

    // 3. Validar si hay resultados (La API de Delirius devuelve res.results como array de URLs)
    if (!res.status || !res.results || res.results.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("No se encontraron imágenes para esa búsqueda.");
    }

    // 4. Limitar resultados y preparar medios
    // Reducimos a 5 para probar que lleguen rápido, luego puedes subirlo a 10
    const limitedLinks = res.results.slice(0, 5); 
    
    const medias = limitedLinks.map((url) => ({
      type: "image",
      data: { url: url }
    }));

    // 5. Enviar usando la función de álbum
    const albumCaption = `✅ *Resultados para:* ${text}\n✨ *Fuente:* Pinterest (Delirius API)`;
    
    await sendAlbumMessage(conn, m.chat, medias, { 
      caption: albumCaption, 
      quoted: m,
      delay: 800 // Un poco más de delay para evitar bloqueos
    });

    // 6. Confirmación final
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error en Pinterest:", error);
    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
    m.reply("Hubo un error al obtener las imágenes. Intenta de nuevo más tarde.");
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
