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
  if (hora >= 5 && hora < 12) return '🌅 𝘽𝙪𝙚𝙣𝙤𝙨 𝙙í𝙖𝙨';
  if (hora >= 12 && hora < 19) return '☀️ 𝘽𝙪𝙚𝙣𝙖𝙨 𝙩𝙖𝙧𝙙𝙚𝙨';
  return '🌙 𝘽𝙪𝙚𝙣𝙖s 𝙣𝙤𝙘𝙝𝙚𝙨';
};

// Variables de diseño
const imgDefault = 'https://files.catbox.moe/t7uytz.png';
const sectionDivider = '╰━━━━━━━━━━━━━━━⬣';

const menuFooter = `
╭━━〔 💻 𝙄𝙉𝙁𝙊 𝙎𝙄𝙎𝙏𝙀𝙈𝘼 〕━━⊷
┃ 🛠️ 𝙐𝙨𝙤: ${String.fromCharCode(8203)}.𝙘𝙤𝙢𝙖𝙣𝙙𝙤
┃ ⚡ 𝙀𝙨𝙩𝙖𝙙𝙤: 𝙎𝙩𝙖𝙗𝙡𝙚
┃ 🦾 𝘿𝙚𝙫: 𝘽𝙖𝙧𝙗𝙤𝙯𝙖-𝙏𝙚𝙖𝙢
╰━━━━━━━━━━━━━━━⬣
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
    const mode = global.opts?.self ? '𝙋𝙧𝙞𝙫𝙖𝙙𝙤 🔒' : '𝙋ú𝙗𝙡𝙞𝙘𝙤 🌍';
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    const text = ["𝙎𝘼𝙎𝙐𝙆𝙀-𝘽𝙊𝙏 𝙄𝙉𝙏𝙀𝙍𝙁𝘼𝘾𝙀", "𝙎𝙔𝙎𝙏𝙀𝙈 𝘾𝙊𝙍𝙀", "𝘿𝘼𝙎𝙃𝘽𝙊𝘼𝙍𝘿 𝙑2"].getRandom();
    const imgRandom = ["https://iili.io/FKVDVAN.jpg", "https://iili.io/FKVbUrJ.jpg"].getRandom();

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
      // Convertir título a diseño de letra
      const stylishTitle = title.toUpperCase()
        .replace(/A/g, '𝘼').replace(/B/g, '𝘽').replace(/C/g, '𝘾').replace(/D/g, '𝘿')
        .replace(/E/g, '𝙀').replace(/F/g, '𝙁').replace(/G/g, '𝙂').replace(/H/g, '𝙃')
        .replace(/I/g, '𝙄').replace(/J/g, '𝙅').replace(/K/g, '𝙆').replace(/L/g, '𝙇')
        .replace(/M/g, '𝙈').replace(/N/g, '𝙉').replace(/O/g, '𝙊').replace(/P/g, '𝙋')
        .replace(/Q/g, '𝙌').replace(/R/g, '𝙍').replace(/S/g, '𝙎').replace(/T/g, '𝙏')
        .replace(/U/g, '𝙐').replace(/V/g, '𝙑').replace(/W/g, '𝙒').replace(/X/g, '𝙓')
        .replace(/Y/g, '𝙔').replace(/Z/g, '𝙕');
        
      const list = [...cmds].map(cmd => `┃  » ⚡ ${cmd}`).join('\n');
      return `╭━━〔 ${emoji} ${stylishTitle} 〕━━⊷\n${list}\n${sectionDivider}`;
    }).join('\n\n');

    const header = `
${saludo} ${tagUsuario} 👋

╭━━〔 ⚡ 𝙎𝘼𝙎𝙐𝙆𝙀 𝘽𝙊𝙏 𝙈𝘿 ⚡ 〕━━⊷
┃ 👤 𝙐𝙨𝙪𝙖𝙧𝙞𝙤: ${userName}
┃ 📊 𝙉𝙞𝙫𝙚𝙡: ${level}
┃ 💎 𝘿𝙞𝙖𝙢𝙖𝙣𝙩𝙚𝙨: ${limit}
┃ ⏲️ 𝙐𝙥𝙩𝙞𝙢𝙚: ${uptime}
┃ 👥 𝙐𝙨𝙪𝙖𝙧𝙞𝙤𝙨: ${totalUsers}
┃ 🔐 𝙈𝙤𝙙𝙤: ${mode}
╰━━━━━━━━━━━━━━━⬣
`.trim();

    const fullMenu = `${header}\n\n${menuBody}\n\n${menuFooter}`;

    let finalImage;
    try {
        finalImage = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'));
    } catch {
        finalImage = { url: imgDefault };
    }

    await conn.sendMessage(m.chat, {
      image: finalImage,
      caption: fullMenu,
      mentions: [m.sender]
    }, { quoted: izumi });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, `⚠️ 𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝙡𝙖 𝙞𝙣𝙩𝙚𝙧𝙛𝙖𝙟 𝙙𝙚𝙡 𝙨𝙞𝙨𝙩𝙚𝙢𝙖.\n> ${e.message}`, m);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
