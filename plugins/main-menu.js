import { readFileSync } from 'fs';
import { join } from 'path';

// Caché de imagen y cooldown global
const menuImg = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'));
const cooldown = new Map();

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
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const saludarSegunHora = () => {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return `🌅 ${toStyle('¡Buen día!')}`;
  if (hora >= 12 && hora < 19) return `☀️ ${toStyle('¡Linda tarde!')}`;
  return `🌙 ${toStyle('¡Buenas noches!')}`;
};

const handler = async (m, { conn, usedPrefix }) => {
  // Anti-Spam (Evita que saturen el bot con el menú)
  if (cooldown.has(m.sender)) {
    const lastTime = cooldown.get(m.sender);
    const diff = Date.now() - lastTime;
    if (diff < 5000) return; // 5 segundos de espera
  }
  cooldown.set(m.sender, Date.now());

  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 0, exp: 0, limit: 10 };
    const totalReg = Object.keys(global.db.data.users).length;
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = m.pushName || 'Usuario';

    let categorizedCommands = {};
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
        const cmds = Array.isArray(p.help) ? p.help : [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(usedPrefix + cmd));
      });

    // Encabezado con estadísticas reales
    const header = `
${saludo} ${tagUsuario} 👋

┏━━〔 ⚡ ${toStyle('SASUKE BOT MD')} ⚡ 〕━━⊷
┃ 👤 ${toStyle('Usuario')}: ${toStyle(userName)}
┃ 🏆 ${toStyle('Nivel')}: ${user.level}
┃ ⚡ ${toStyle('XP')}: ${user.exp}
┃ 💎 ${toStyle('Diamantes')}: ${user.limit}
┃ 📊 ${toStyle('Usuarios')}: ${totalReg}
┃ ⏲️ ${toStyle('Uptime')}: ${uptime}
┗━━━━━━━━━━━━━━━━━━━━⬣`.trim();

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const styledTitle = toStyle(title.toUpperCase());
      const list = [...cmds].map(cmd => `  ⚡ ${toStyle(cmd)}`).join('\n');
      return `┏━━〔 📂 ${styledTitle} 〕━━⊷\n${list}\n┗━━━━━━━━━━━━━━━━━━⬣`;
    }).join('\n\n');

    const fullMenu = `${header}\n\n${menuBody}\n\n${toStyle('Sasuke Bot Sky Ultra Plus V2')}`;

    const botones = [
      { buttonId: `${usedPrefix}perfil`, buttonText: { displayText: "👤 Mi Perfil" }, type: 1 },
      { buttonId: `${usedPrefix}owner`, buttonText: { displayText: "👑 Creador" }, type: 1 }
    ];

    const buttonMessage = {
      image: menuImg,
      caption: fullMenu,
      footer: "By Barboza-Team ⚡",
      buttons: botones,
      headerType: 4,
      mentions: [m.sender]
    };

    // Enviar el menú
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    
    // OPCIONAL: Enviar un pequeño audio para que el bot parezca más interactivo
    // await conn.sendMessage(m.chat, { audio: { url: './storage/audio/menu.mp3' }, fileName: 'error.mp3', mimetype: 'audio/mp4', ptt: true }, { quoted: m });

  } catch (e) {
    console.error("Error en el menú mejorado:", e);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
