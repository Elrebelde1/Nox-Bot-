import { xpRange} from '../lib/levelling.js';
import axios from 'axios';

// Utilidad para convertir milisegundos en formato hh:mm:ss
const clockString = ms => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

// Saludo dinámico según la hora con toque navideño
const saludarSegunHora = () => {
  const hora = new Date().getHours();
  if (hora>= 5 && hora < 12) return '🎄 ¡Feliz Mañana Navideña!';
  if (hora>= 12 && hora < 19) return '🎅 ¡Disfruta esta Tarde Festiva!';
  return '🌟 ¡Buenas Noches de Paz!';
};

// Imagen de respaldo
const img = 'https://qu.ax/Ny958';
const sectionDivider = '╰━━━━━━━━━━━━━━━━━━⭓';

// Pie de menú con mensaje navideño
const menuFooter = `
╭─❒ 「🎁 DESEOS Y COMANDOS」
│ 🔔 Usa los comandos con el prefijo correspondiente
│ 🕯️ Ejemplo:.ping |.menu
│ ❄️ Creado por Barboza-Team - ¡Felices Fiestas!
╰❒
`.trim();

// Extensión para obtener un elemento aleatorio de un array
Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)];
};

const handler = async (m, { conn, usedPrefix}) => {
  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5};
    const { exp, level, limit} = user;
    const { min, xp} = xpRange(level, global.multiplier || 1);
    const totalUsers = Object.keys(global.db.data.users).length;
    const mode = global.opts?.self? 'Duende Personal 🧝': 'Trineo Abierto 🦌';
    const uptime = clockString(process.uptime() * 1000);
    const tagUsuario = `@${m.sender.split('@')[0]}`;
    const userName = (await conn.getName?.(m.sender)) || tagUsuario;

    const text = [
      "Campanas de Sasuke",
      "Villancico General",
      "Regalos para los NPC"
    ].getRandom();

    const imgRandom = [
      "https://iili.io/FKVDVAN.jpg", // Puedes reemplazar con imágenes navideñas
      "https://iili.io/FKVbUrJ.jpg" // Puedes reemplazar con imágenes navideñas
    ].getRandom();

    let thumbnailBuffer;
    try {
      const response = await axios.get(imgRandom, { responseType: 'arraybuffer'});
      thumbnailBuffer = Buffer.from(response.data);
} catch (e) {
      console.error('❌ Error al descargar la imagen:', e);
      const fallback = await axios.get(img, { responseType: 'arraybuffer'});
      thumbnailBuffer = Buffer.from(fallback.data);
}

    const izumi = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo"},
      message: {
        locationMessage: {
          name: text,
          jpegThumbnail: thumbnailBuffer,
          vcard:
            "BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\n" +
            "item1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\n" +
            "X-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD"
}
},
      participant: "0@s.whatsapp.net"
};

    let categorizedCommands = {};
    Object.values(global.plugins)
.filter(p => p?.help &&!p.disabled)
.forEach(p => {
        const tag = Array.isArray(p.tags)? p.tags[0]: p.tags || 'Otros';
        const cmds = Array.isArray(p.help)? p.help: [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(usedPrefix + cmd));
});

    // Emojis de categoría con toque navideño
    const categoryEmojis = {
      anime: '🎭', info: 'ℹ️', search: '🔍', diversión: '🎁', subbots: '🤖',
      rpg: '🦌', registro: '📝', sticker: '✨', imagen: '🖼️', logo: '🖍️',
      premium: '👑', configuración: '⚙️', descargas: '📦', herramientas: '🛠️',
      nsfw: '🚫', 'base de datos': '📀', audios: '🎵', freefire: '🔥', otros: '🎄'
};

const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const emoji = categoryEmojis[title.toLowerCase()] || '❄️';
      const list = [...cmds].map(cmd => `│ ◦ ${cmd}`).join('\n');
      return `╭─「 ${emoji} ${title.toUpperCase()} 」\n${list}\n${sectionDivider}`;
}).join('\n\n');

    const header = `
${saludo} ${tagUsuario} 🎁

╭─ 「 sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🎅 」
│ 👤 Nombre: ${userName}
│ 🌟 Nivel: ${level} | XP: ${exp - min}/${xp}
│ 🔑 Pases de Regalo: ${limit}
│ 🧭 Modo: ${mode}
│ ⏱️ Tiempo activo: ${uptime}
│ 🌍 Amigos de Navidad: ${totalUsers}
╰─❒
`.trim();

    const fullMenu = `${header}\n\n${menuBody}\n\n${menuFooter}`;

    const botSettings = global.db.data.settings?.[conn.user.jid] || {};
    const bannerr = botSettings.banner || img;

    await conn.sendMessage(m.chat, {
      image: { url: bannerr},
      caption: fullMenu,
      mentions: [m.sender]
}, { quoted: izumi});

} catch (e) {
    console.error('❌ Error al generar el menú: Barboza bug :', e);
    await conn.reply(m.chat, `⚠️ Ocurrió un error al mostrar el menú. ¡El Grinch atacó!\n> ${e.message}`, m);
}
};

handler.command = ['menu', 'help', 'menú'];
handler.register = true 
export default handler;
