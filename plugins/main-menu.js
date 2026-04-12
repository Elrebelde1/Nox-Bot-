import { readFileSync, existsSync } from 'fs'; // Añadimos existsSync
import { join } from 'path';
import { xpRange } from '../lib/levelling.js';
import axios from 'axios';

// ... (tus funciones toStyle, clockString, saludarSegunHora se mantienen igual)

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

    const fakeText = toStyle("by Barboza - Sasuke");
    const imgRandom = ["https://iili.io/FKVDVAN.jpg", "https://iili.io/FKVbUrJ.jpg"].getRandom();

    // --- LÓGICA PARA FILTRAR COMANDOS ELIMINADOS ---
    let categorizedCommands = {};
    
    // Obtenemos la ruta de la carpeta plugins
    const pluginsDir = join(process.cwd(), 'plugins');

    Object.entries(global.plugins)
      .filter(([path, p]) => {
        // 1. Verificamos que tenga ayuda y no esté desactivado
        if (!p?.help || p.disabled) return false;
        
        // 2. VERIFICACIÓN CRÍTICA: ¿El archivo existe físicamente?
        // La llave 'path' en global.plugins suele ser la ruta completa del archivo
        if (!existsSync(path)) {
            delete global.plugins[path]; // Lo eliminamos del caché si ya no existe
            return false;
        }
        return true;
      })
      .forEach(([path, p]) => {
        const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
        const cmds = Array.isArray(p.help) ? p.help : [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(toStyle(usedPrefix + cmd)));
      });

    // ... (el resto del código de emojis y cuerpo del menú se mantiene igual)

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
${saludo} ${tagUsuario} 👋

╭━━〔 ⚡ ${toStyle('SASUKE BOT MD')} ⚡ 〕━━⊷
┃ 👤 ${toStyle('Usuario')}: ${toStyle(userName)}
┃ 📊 ${toStyle('Nivel')}: ${level}
┃ 💎 ${toStyle('Diamantes')}: ${limit}
┃ ⏲️ ${toStyle('Uptime')}: ${uptime}
┃ 👥 ${toStyle('Usuarios')}: ${totalUsers}
┃ 🔐 ${toStyle('Modo')}: ${mode}
╰━━━━━━━━━━━━━━━⬣
`.trim();

    const menuFooter = `
╭━━〔 💻 ${toStyle('INFO SISTEMA')} 〕━━⊷
┃ 🛠️ ${toStyle('Uso')}: ${String.fromCharCode(8203)}.comando
┃ ⚡ ${toStyle('Estado')}: ${toStyle('Stable')}
┃ 🦾 ${toStyle('Dev')}: ${toStyle('Barboza-Team')}
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
