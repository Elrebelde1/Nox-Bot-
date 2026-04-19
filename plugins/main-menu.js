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
    // Carga de imagen local
    const img = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'));
    
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5 };
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName(m.sender)) || tagUsuario;

    let categorizedCommands = {};
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
        const cmds = Array.isArray(p.help) ? p.help : [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(toStyle(usedPrefix + cmd)));
      });

    const header = `${saludo} ${tagUsuario} 👋

╭━━〔 ⚡ ${toStyle('SASUKE BOT MD')} ⚡ 〕━━⊷
┃ 👤 ${toStyle('Usuario')}: ${toStyle(userName)}
┃ 📊 ${toStyle('Nivel')}: ${user.level}
┃ 💎 ${toStyle('Diamantes')}: ${user.limit}
┃ ⏲️ ${toStyle('Uptime')}: ${uptime}
╰━━━━━━━━━━━━━━━⬣`.trim();

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const styledTitle = toStyle(title.toUpperCase());
      const list = [...cmds].map(cmd => `┃  » ⚡ ${cmd}`).join('\n');
      return `╭━━〔 📂 ${styledTitle} 〕━━⊷\n${list}\n╰━━━━━━━━━━━━━━━⬣`;
    }).join('\n\n');

    const fullMenu = `${header}\n\n${menuBody}`;

    const botones = [
      { buttonId: `.canal1`, buttonText: { displayText: "📢 Canal 1" }, type: 1 },
      { buttonId: `.canal2`, buttonText: { displayText: "📢 Canal 2" }, type: 1 }
    ];

    const buttonMessage = {
      image: img, // Usando la constante img cargada arriba
      caption: fullMenu,
      footer: "By Barboza-Team ⚡",
      buttons: botones,
      headerType: 4,
      mentions: [m.sender] // Esto asegura que la mención @número funcione
    };

    return await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

  } catch (e) {
    console.error(e);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
