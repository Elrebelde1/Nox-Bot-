import axios from "axios";
import baileys from "@whiskeysockets/baileys";

// Función auxiliar para enviar álbumes (se mantiene igual, es funcional)
async function sendAlbumMessage(conn, jid, medias, options) {
  options = { ...options };
  if (typeof jid !== "string") throw new TypeError(`jid must be a string, received: ${jid}`);

  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video"))
      throw new TypeError(`medias[i].type must be "image" or "video", received: ${media.type}`);
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data)))
      throw new TypeError(`medias[i].data must be an object with url or buffer, received: ${media.data}`);
  }

  if (medias.length < 2) throw new RangeError("Se requieren al menos 2 medios.");

  const caption = options.text || options.caption || "";
  const delay = !isNaN(options.delay) ? options.delay : 500;
  
  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(media => media.type === "image").length,
        expectedVideoCount: medias.filter(media => media.type === "video").length,
        ...(options.quoted ? {
          contextInfo: {
            remoteJid: options.quoted.key.remoteJid,
            fromMe: options.quoted.key.fromMe,
            stanzaId: options.quoted.key.id,
            participant: options.quoted.key.participant || options.quoted.key.remoteJid,
            quotedMessage: options.quoted.message,
          },
        } : {}),
      },
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (const i in medias) {
    const { type, data } = medias[i];
    const img = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === "0" ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    );
    img.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    };
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
    await baileys.delay(delay);
  }
  return album;
}

let handler = async (m, { conn, args, text }) => {
  if (!text) return m.reply("Por favor, proporciona una consulta.\n\nEjemplo: *.pinterest Twice*");

  await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

  try {
    // Nueva URL de la API de Delirius
    const apiUrl = `https://api.delirius.store/search/pinterest?text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    // Validación de la nueva estructura: data.results es el array de URLs
    if (!data.status || !data.results || data.results.length === 0) {
      return m.reply("No se encontraron resultados para tu búsqueda.");
    }

    // Limitamos a 10 imágenes para no saturar y mapeamos al formato del álbum
    const limitedData = data.results.slice(0, 10);
    const medias = limitedData.map(url => ({
      type: "image",
      data: { url: url }
    }));

    const albumCaption = `✨ *Pinterest Search* ✨\n\n📌 *Query:* ${text}\n📦 *Cantidad:* ${limitedData.length} imágenes`;
    
    await sendAlbumMessage(conn, m.chat, medias, { caption: albumCaption, quoted: m });
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error en Pinterest Delirius API:", error);
    m.reply("Ocurrió un error al procesar la búsqueda.");
  }
};

handler.help = ["pinterest"];
handler.tags = ["search"];
handler.command = ["pinterest", "pin"];

export default handler;
