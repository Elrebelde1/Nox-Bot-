import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { xpRange } from '../lib/levelling.js';
import axios from 'axios';

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

const imgDefault = 'https://files.catbox.moe/t7uytz.png';
const sectionDivider = '╰━━━━━━━━━━━━━━━━━━━━━⭓';

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5 };
    const { level, limit } = user;
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    // --- LÓGICA DE SELECCIÓN DE IMAGEN CORREGIDA ---
    // Buscamos en los settings globales del bot
    const settings = global.db.data.settings[conn.user.jid] || {};
    let finalImage;

    // REVISIÓN PRIORITARIA:
    // 1. ¿Hay algo en banner1? (puesto con setbanner 1)
    // 2. ¿Hay algo en banner2? (puesto con setbanner 2)
    if (settings.banner1 && settings.banner1 !== '') {
        finalImage = { url: settings.banner1 };
    } else if (settings.banner2 && settings.banner2 !== '') {
        finalImage = { url: settings.banner2 };
    } else {
        // 3. Si no hay nada, buscamos la de Sasuke en storage
        const pathLocal = join(process.cwd(), 'storage', 'img', 'miniurl.jpg');
        if (existsSync(pathLocal)) {
            finalImage = readFileSync(pathLocal);
        } else {
            finalImage = { url: imgDefault };
        }
    }

    // --- GENERAR EL MENÚ ---
    let categorizedCommands = {};
    Object.values(global.plugins).filter(p => p?.help && !p.disabled).forEach(p => {
      const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
      const cmds = Array.isArray(p.help) ? p.help : [p.help];
      categorizedCommands[tag] = categorizedCommands[tag] || new Set();
      cmds.forEach(cmd => categorizedCommands[tag].add(usedPrefix + cmd));
    });

    const categoryEmojis = { anime: '🎎', info: '🆔', search: '🔍', diversión: '🎮', subbots: '🤖', rpg: '⚔️', registro: '📝', sticker: '🎭', imagen: '🖼️', logo: '🎨', premium: '💎', configuración: '⚙️', descargas: '📥', herramientas: '🔧', nsfw: '🔞', 'base de datos': '🗂️', audios: '🎧', freefire: '🔫', otros: '🧩' };

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const emoji = categoryEmojis[title.toLowerCase()] || '📂';
      const list = [...cmds].map(cmd => `│  ◦ ${cmd}`).join('\n');
      return `╭─「 ${emoji} ${title.toUpperCase()} 」\n${list}\n${sectionDivider}`;
    }).join('\n\n');

    const fullMenu = `
${saludo} ${tagUsuario} 👋

╭─ 「 ⚡ *SASUKE BOT MD* ⚡ 」
│ 👤 *Usuario:* ${userName}
│ 📊 *Nivel:* ${level}
│ 💎 *Diamantes:* ${limit}
│ ⏲️ *Uptime:* ${uptime}
│ 🔐 *Modo:* ${global.opts?.self ? 'Privado' : 'Público'}
╰─❒

${menuBody}

╭─❒ 「 💻 SYSTEM INFO 」
│ 🛠️ Use: .comando
│ ⚡ Status: Stable
│ 🦾 Dev: Barboza-Team
╰❒`.trim();

    // ENVIAR EL MENÚ CON LA IMAGEN DETECTADA
    await conn.sendMessage(m.chat, {
      image: finalImage,
      caption: fullMenu,
      mentions: [m.sender]
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(`⚠️ Error: ${e.message}`);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
