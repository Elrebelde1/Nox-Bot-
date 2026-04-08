import { readFileSync } from 'fs';
import { join } from 'path';
import { xpRange } from '../lib/levelling.js';
import axios from 'axios';

// --- FUNCIÓN PARA EL ESTILO DE LETRA ---
const toStyle = (text) => {
  const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.<>!¡-';
  const styled = '𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵.＜＞!¡-';
  return text.split('').map(char => {
    const index = normal.indexOf(char);
    return index !== -1 ? styled.substring(index * 2, (index + 1) * 2) : char;
  }).join('');
};

const clockString = ms => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const saludarSegunHora = () => {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return `🌅 ${toStyle('¡Buenos días!')}`;
  if (hora >= 12 && hora < 19) return `☀️ ${toStyle('¡Buenas tardes!')}`;
  return `🌙 ${toStyle('¡Buenas noches!')}`;
};

const imgDefault = 'https://files.catbox.moe/t7uytz.png';
const sectionDivider = '╰━━━━━━━━━━━━━━━⬣';

const menuFooter = `
╭━━〔 💻 ${toStyle('INFO SISTEMA')} 〕━━⊷
┃ 🛠️ ${toStyle('Uso')}: ${String.fromCharCode(8203)}.comando
┃ ⚡ ${toStyle('Estado')}: ${toStyle('Stable')}
┃ 🦾 ${toStyle('Dev')}: ${toStyle('Barboza-Team')}
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
    const totalUsers = Object.keys(global.db.data.users).length;
    const mode = global.opts?.self ? toStyle('Privado 🔒') : toStyle('Público 🌍');
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    // --- CAMBIO AQUÍ: TEXTO QUE SALE ARRIBA DE LA IMAGEN ---
    const fakeText = toStyle("𝙗𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖 - 𝙎𝙖𝙨𝙪𝙠𝙚");
    const imgRandom = ["https://iili.io/FKVDVAN.jpg", "https://iili.io/FKVbUrJ.jpg"].getRandom();

    let thumbnailBuffer;
    try {
      const response = await axios.get(imgRandom, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data);
    } catch (e) {
      const fallback = await axios.get(imgDefault, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(fallback.data);
    }

    // Interfaz del mensaje citado (Fake Reply)
    const izumi = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Interface" },
      message: {
        locationMessage: {
          name: fakeText, // Aquí se aplicó el cambio
          jpegThumbnail: thumbnailBuffer,
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;User;;;\nFN:User\nEND:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    };

    let categorizedCommands = {};
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
        const cmds = Array.isArray(p.help) ? p.help : [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(toStyle(usedPrefix + cmd)));
      });

    const categoryEmojis = {
      anime: '🎎', info: '🆔', search: '🔍', diversión: '🎮', subbots: '🤖',
      rpg: '⚔️', registro: '📝', sticker: '🎭', imagen: '🖼️', logo: '🎨',
      premium: '💎', configuración: '⚙️', descargas: '📥', herramientas: '🔧',
      nsfw: '🔞', 'base de datos': '🗂️', audios: '🎧', freefire: '🔫', otros: '🧩'
    };

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const emoji = categoryEmojis[title.toLowerCase()] || '📂';
      const styledTitle = toStyle(title.toUpperCase());
      const list = [...cmds].map(cmd => `┃  » ⚡ ${cmd}`).join('\n');
      return `╭━━〔 ${emoji} ${styledTitle} 〕━━⊷\n${list}\n${sectionDivider}`;
    }).join('\n\n');

    const header = `
${saludo} ${toStyle(tagUsuario)} 👋

╭━━〔 ⚡ ${toStyle('SASUKE BOT MD')} ⚡ 〕━━⊷
┃ 👤 ${toStyle('Usuario')}: ${toStyle(userName)}
┃ 📊 ${toStyle('Nivel')}: ${level}
┃ 💎 ${toStyle('Diamantes')}: ${limit}
┃ ⏲️ ${toStyle('Uptime')}: ${uptime}
┃ 👥 ${toStyle('Usuarios')}: ${totalUsers}
┃ 🔐 ${toStyle('Modo')}: ${mode}
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
    await conn.reply(m.chat, `⚠️ ${toStyle('Error en la interfaz')}.\n> ${toStyle(e.message)}`, m);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
