import { readFileSync, existsSync } from 'fs';
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

const handler = async (m, { conn, usedPrefix, text: argsText }) => {
  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5 };
    const { level, limit } = user;
    const totalUsers = Object.keys(global.db.data.users).length;
    const mode = global.opts?.self ? 'Privado 🔒' : 'Público 🌍';
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    const textTitle = ["SASUKE-BOT INTERFACE", "SYSTEM CORE", "DASHBOARD V2"].getRandom();
    const imgRandom = ["https://iili.io/FKVDVAN.jpg", "https://iili.io/FKVbUrJ.jpg"].getRandom();

    // Generar thumbnail para el mensaje citado
    let thumbnailBuffer;
    try {
      const response = await axios.get(imgRandom, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data);
    } catch {
      thumbnailBuffer = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'));
    }

    const izumi = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Interface" },
      message: {
        locationMessage: {
          name: textTitle,
          jpegThumbnail: thumbnailBuffer,
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;User;;;\nFN:User\nEND:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    };

    // --- LÓGICA DE SELECCIÓN DE IMAGEN ---
    const choice = argsText.trim(); // Captura el "1" o "2" de ".menu 1"
    const botSettings = global.db.data.settings?.[conn.user.jid] || {};
    let finalImage;

    if (choice === '1' && botSettings.banner1) {
      finalImage = { url: botSettings.banner1 };
    } else if (choice === '2' && botSettings.banner2) {
      finalImage = { url: botSettings.banner2 };
    } else {
      // Imagen por defecto de GitHub/Local
      const pathLocal = join(process.cwd(), 'storage', 'img', 'miniurl.jpg');
      if (existsSync(pathLocal)) {
        finalImage = readFileSync(pathLocal);
      } else {
        finalImage = { url: imgDefault };
      }
    }

    // --- CONSTRUCCIÓN DEL CUERPO DEL MENÚ ---
    let categorizedCommands = {};
    Object.values(global.plugins).filter(p => p?.help && !p.disabled).forEach(p => {
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

    await conn.sendMessage(m.chat, {
      image: finalImage,
      caption: fullMenu,
      mentions: [m.sender]
    }, { quoted: izumi });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, `⚠️ Error en la interfaz.\n> ${e.message}`, m);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
