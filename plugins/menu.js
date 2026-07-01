import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

let handler = async (m, { conn, usedPrefix }) => {
  let taguser = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
  let name = conn.getName(taguser);
  
  let menuText = `🌃 *BIENVENIDO A NOX BOT* 🌃\n\n`;
  menuText += `🌌 Hola ${name}\n`;
  menuText += `🌌 Prefijo actual: [ ${usedPrefix} ]\n\n`;
  
  let help = Object.values(global.plugins).filter(p => p.help && !p.disabled);
  let groups = {};
  
  for (let plugin of help) {
    let category = plugin.tags ? plugin.tags[0] : 'otros';
    if (!groups[category]) groups[category] = [];
    
    if (Array.isArray(plugin.help)) {
      groups[category].push(...plugin.help);
    } else {
      groups[category].push(plugin.help);
    }
  }
  
  for (let category in groups) {
    menuText += `*╔═════ 🌃 ${category.toUpperCase()} 🌃 ════╗*\n`;
    for (let cmd of groups[category]) {
      menuText += `║ 🌌 ${usedPrefix}${cmd}\n`;
    }
    menuText += `*╚═════════════════════════╝*\n\n`;
  }
  
  menuText += `🌃 *Nox Bot MD - Sistema de comandos automáticos* 🌃`;

  await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|menú)$/i;

export default handler;
