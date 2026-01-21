import { readFileSync } from 'fs';
import { join } from 'path';
import { xpRange } from '../lib/levelling.js';
import axios from 'axios';

// Configuración de utilidades
const clockString = ms => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const saludarSegunHora = () => {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return '🌅 ¡Buenos días!';
  if (hora >= 12 && hora < 19) return '☀️ ¡Buenas tardes!';
  return '🌙 ¡Buenas noches!';
};

// Variables de diseño
const imgDefault = 'https://files.catbox.moe/t7uytz.png';
const sectionDivider = '╰━━━━━━━━━━━━━━━━━━━━━⭓';

const menuFooter = `
╭─❒ 「 💻 SYSTEM INFO 」
│ 🛠️ Use: ${String.fromCharCode(8203)}.comando
│ ⚡ Status: Stable
│ 🦾 Dev: Barboza-Team
╰❒
`.trim();

Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5 };
    const { exp, level, limit } = user;
    const { min, xp } = xpRange(level, global.multiplier || 1);
    const totalUsers = Object.keys(global.db.data.users).length;
    const mode = global.opts?.self ? 'Privado 🔒' : 'Público 🌍';
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    const text = ["SASUKE-BOT INTERFACE", "SYSTEM CORE", "DASHBOARD V2"].getRandom();
    const imgRandom = ["https://iili.io/FKVDVAN.jpg", "https://iili.io/FKVbUrJ.jpg"].getRandom();

    // Intentar obtener el thumbnail para el mensaje citado (izumi)
    let thumbnailBuffer;
    try {
      const response = await axios.get(imgRandom, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data);
    } catch (e) {
      const fallback = await axios.get(imgDefault, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(fallback.data);
    }

    const izumi = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Interface" },
      message: {
        locationMessage: {
          name: text,
          jpegThumbnail: thumbnailBuffer,
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;User;;;\nFN:User\nEND:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    };

    // Lógica de categorización de comandos
    let categorizedCommands = {};
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
        const cmds = Array.isArray(p.help) ? p.help : [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(usedPrefix + cmd));
      });

    const categoryEmojis = {
      anime: '🎎', info: '🆔', search: '🔍', diversión: '🎮', subbots: '🤖',
      rpg: '⚔️', registro: '📝', sticker: '🎭', imagen: '🖼️', logo: '🎨',
      premium: '💎', configuración: '⚙️', descargas: '📥', herramientas: '🔧',
      nsfw: '🔞', 'base de datos': '🗂️', audios: '🎧', freefire: '🔫', otros: '🧩'
    };

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const emoji = categoryEmojis[title.toLowerCase()] || '📂';
      const list = [...cmds].map(cmd => `│  ◦ ${cmd}`).join('\n');
      return `╭─「 ${emoji} ${title.toUpperCase()} 」\n${list}\n${sectionDivider}`;
    }).join('\n\n');

    const header = `
${saludo} ${tagUsuario} 👋

╭─ 「 ⚡ *SASUKE BOT MD* ⚡ 」
│ 👤 *Usuario:* ${userName}
│ 📊 *Nivel:* ${level}
│ 💎 *Diamantes:* ${limit}
│ ⏲️ *Uptime:* ${uptime}
│ 👥 *Usuarios:* ${totalUsers}
│ 🔐 *Modo:* ${mode}
╰─❒
`.trim();

    const fullMenu = `${header}\n\n${menuBody}\n\n${menuFooter}`;

    // Lógica para decidir si usar imagen local o URL
    let finalImage;
    try {
        // Intenta leer la imagen local del catálogo
        finalImage = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'));
    } catch {
        // Si no existe el archivo local, usa el banner de los ajustes o la URL default
        const botSettings = global.db.data.settings?.[conn.user.jid] || {};
        finalImage = { url: botSettings.banner || imgDefault };
    }

    await conn.sendMessage(m.chat, {
      image: finalImage.length ? finalImage : finalImage, // Detecta si es Buffer o URL object
      caption: fullMenu,
      mentions: [m.sender]
    }, { quoted: izumi });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, `⚠️ Error en la interfaz del sistema.\n> ${e.message}`, m);
  }
};

handler.command = ['menu', 'help', 'menú'];
handler.register = true;
export default handler;
