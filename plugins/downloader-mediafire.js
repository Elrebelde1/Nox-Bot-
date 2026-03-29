import axios from "axios";
import path from "path";
import { URL } from "url";

const bytesToKB = (bytes) => (!bytes ? 0 : Math.floor(Number(bytes) / 1024));

const formatSize = (size) => {
  if (!size) return "0 KB";
  const bytes = Number(size);
  if (isNaN(bytes)) return String(size);
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.floor(bytes / 1024)} KB`;
};

const getFilenameFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const name = decodeURIComponent(path.basename(parsed.pathname));
    return name || "archivo_desconocido";
  } catch {
    return "archivo_desconocido";
  }
};

let processingGlobal = false;
const processingChats = new Set();

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('📨');

  try {
    if (processingGlobal || processingChats.has(m.chat)) {
      return await m.reply(
        `
╭─────────────♂
│ ⚠️ El sistema ya está procesando un archivo.
│ ⏳ Intenta nuevamente en unos minutos.
╰─────────────♂`,
        m
      );
    }

    if (!text?.trim()) {
      return await m.reply(
        `
╭─────────────♂
│ 📦 Debes ingresar un enlace válido de MediaFire.
│
│ 💠 Ejemplo:
│ ${usedPrefix + command} https://www.mediafire.com/file/xxxx
╰─────────────♂`,
        m
      );
    }

    if (!/https?:\/\/(www\.)?mediafire\.com\//i.test(text)) {
      return await m.reply(
        `
╭─────────────♂
│ 🚫 Ese enlace no es de MediaFire.
│ Ingresa un enlace válido.
╰─────────────♂`,
        m
      );
    }

    processingGlobal = true;
    processingChats.add(m.chat);

    const initialMsg = await m.reply(`🔄 Procesando enlace...\n🛡️ Espera un momento...`);
    await m.react('🔄');

    let fileData = null;

    try {
      const { data } = await axios.get(
        "https://fgsi.koyeb.app/api/downloader/mediafire",
        {
          params: {
            apikey: "fgsiapi-26242e54-6d",
            url: text
          },
          timeout: 20000
        }
      );
//no usen la Apikey pndjs 🖕🏻
      if (data?.status && data.data?.downloadUrl) {
        const r = data.data;
        fileData = {
          name: r.filename || getFilenameFromUrl(r.downloadUrl),
          mime: r.mimetype || "application/octet-stream",
          sizeText: r.size ? `${(r.size / (1024 * 1024)).toFixed(2)} MB` : "0 KB",
          sizeKB: bytesToKB(r.size),
          downloadUrl: r.downloadUrl
        };
      } else throw new Error();
    } catch {
      const { data } = await axios.get(
        "https://api.nekolabs.my.id/downloader/mediafire",
        {
          params: { url: text },
          timeout: 20000
        }
      );

      if (data?.status && data.result?.download_url) {
        const r = data.result;
        fileData = {
          name: r.filename || getFilenameFromUrl(r.download_url),
          mime: r.mimetype || "application/octet-stream",
          sizeText: r.filesize || "0 KB",
          sizeKB: bytesToKB(r.size),
          downloadUrl: r.download_url
        };
      } else throw new Error("No se pudo obtener el archivo.");
    }

    if (!fileData?.downloadUrl) throw new Error("No se pudo obtener el archivo.");

    fileData.name = fileData.name || getFilenameFromUrl(fileData.downloadUrl);

    await m.react('📥');

    await conn.sendMessage(
      m.chat,
      {
        document: { url: fileData.downloadUrl },
        fileName: fileData.name,
        mimetype: fileData.mime,
        caption: `
╭─────────────
│ 📁 Nombre: ${fileData.name}
│ 📦 Tamaño: ${fileData.sizeText}
│ ⚙️ Tipo: ${fileData.mime}
╰─────────────
Sasuke-Bot™
        `.trim()
      },
      { quoted: initialMsg }
    );

    await m.react('🟢');

  } catch (e) {
    await m.react('🔴');

    await m.reply(
      `
╭─────────────
│ ❌ Error al procesar el archivo.
│
│ 📋 Detalle:
│ ${e.message}
╰─────────────`,
      m
    );

  } finally {
    processingGlobal = false;
    processingChats.delete(m.chat);
  }
};

handler.help = ["mediafire <url>"];
handler.tags = ["descargas"];
handler.command = /^(mediafire|mf|mfdl)$/i;

export default handler;