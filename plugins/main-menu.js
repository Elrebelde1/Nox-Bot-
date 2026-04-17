import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const toStyle = (text) => {
  if (!text) return '';
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

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5 };
    const { level, limit } = user;
    const totalUsers = Object.keys(global.db.data.users).length;
    const mode = global.opts?.self ? toStyle('Privado 🔒') : toStyle('Público 🌍');
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    const imgRandom = ["https://iili.io/FKVDVAN.jpg", "https://iili.io/FKVbUrJ.jpg"].getRandom();

    let categorizedCommands = {};
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
        const cmds = Array.isArray(p.help) ? p.help : [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(toStyle(usedPrefix + cmd)));
      });

    const header = `
${saludo} ${tagUsuario} 👋

╭━━〔 ⚡ ${toStyle('SASUKE BOT MD')} ⚡ 〕━━⊷
┃ 👤 ${toStyle('Usuario')}: ${toStyle(userName)}
┃ 📊 ${toStyle('Nivel')}: ${level}
┃ 💎 ${toStyle('Diamantes')}: ${limit}
┃ ⏲️ ${toStyle('Uptime')}: ${uptime}
┃ 🔐 ${toStyle('Modo')}: ${mode}
╰━━━━━━━━━━━━━━━⬣
`.trim();

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const styledTitle = toStyle(title.toUpperCase());
      const list = [...cmds].map(cmd => `┃  » ⚡ ${cmd}`).join('\n');
      return `╭━━〔 📂 ${styledTitle} 〕━━⊷\n${list}\n╰━━━━━━━━━━━━━━━⬣`;
    }).join('\n\n');

    const fullMenu = `${header}\n\n${menuBody}`;

    // --- BOTONES DE CANALES ---
    const botones = [
      { buttonId: `${usedPrefix}c1`, buttonText: { displayText: "📢 𝖢𝖺𝗇𝖺𝗅 1" }, type: 1 },
      { buttonId: `${usedPrefix}c2`, buttonText: { displayText: "📢 𝖢𝖺𝗇𝖺𝗅 2" }, type: 1 }
    ]

    const buttonMessage = {
      image: { url: imgRandom },
      caption: fullMenu,
      footer: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
      buttons: botones,
      headerType: 4
    }

    return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })

  } catch (e) {
    console.error(e);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
