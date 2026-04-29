import axios from "axios";
import baileys from "@whiskeysockets/baileys";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*¡Hola!* ¿Qué imágenes buscas?\n\n*Ejemplo:* ${usedPrefix}${command} Messi`, m);

  await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

  try {
    const apiUrl = `https://api.delirius.store/search/pinterest?text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.results || data.results.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("No se encontraron imágenes.");
    }

    // Tomamos las primeras 6 imágenes
    const limitedResults = data.results.slice(0, 6);

    const medias = limitedResults.map((url) => ({
      type: "image",
      data: { url: url } 
    }));

    const albumCaption = `*〔 PINTEREST ALBUM 〕*\n\n*Resultado de:* ${text}`;

    await sendAlbumMessage(conn, m.chat, medias, { 
      caption: albumCaption, 
      quoted: m,
      delay: 1000 
    });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
    m.reply("Ocurrió un error al procesar la búsqueda.");
  }
};

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
handler.command = /^(pinterest3|pin)$/i;

export default handler;
