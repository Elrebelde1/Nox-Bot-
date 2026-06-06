import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import fetch from "node-fetch";

// Cargamos la imagen una sola vez al inicio para evitar errores de lectura repetitiva
const imgPath = join(process.cwd(), 'storage', 'img', 'miniurl.jpg');
let imgLocal;

try {
  if (existsSync(imgPath)) {
    imgLocal = readFileSync(imgPath);
  } else {
    imgLocal = Buffer.alloc(0); 
    console.error(`[ERROR] La imagen en ${imgPath} no existe.`);
  }
} catch (e) {
  imgLocal = Buffer.alloc(0);
  console.error('[ERROR] Error al leer la imagen inicial:', e);
}

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, usedPrefix }) => {
  try {
    const chat = global.db.data?.chats?.[m.chat] || {};
    const emoji = chat.emojiTag || '🤖';

    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      return; 
    }

    const customMessage = args.join(' ');
    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({ subject: 'Grupo', participants: [] }));
    const groupName = groupMetadata.subject;

    // Listado de banderas ordenado y corregido
    const countryFlags = {
      '58': '🇻🇪', '52': '🇲🇽', '54': '🇦🇷', '57': '🇨🇴', '51': '🇵🇪',
      '56': '🇨🇱', '55': '🇧🇷', '34': '🇪🇸', '1': '🇺🇸', '44': '🇬🇧', 
      '33': '🇫🇷', '49': '🇩🇪', '39': '🇮🇹', '81': '🇯🇵', '82': '🇰🇷', 
      '86': '🇨🇳', '7': '🇷🇺', '91': '🇮🇳', '61': '🇦🇺', '64': '🇳🇿',
      '502': '🇬🇹', '503': '🇸🇻', '504': '🇭🇳', '505': '🇳🇮', '506': '🇨🇷', 
      '507': '🇵🇦', '591': '🇧🇴', '592': '🇬🇾', '593': '🇪🇨', '595': '🇵🇾'
    };

    // Función de detección de banderas corregida por orden de longitud de prefijo
    const getCountryFlag = (id) => {
      const phoneNumber = id.split('@')[0];
      
      // 1. Probar con prefijos de 3 dígitos (ej: 502, 504...)
      let prefix3 = phoneNumber.substring(0, 3);
      if (countryFlags[prefix3]) return countryFlags[prefix3];

      // 2. Probar con prefijos de 2 dígitos (ej: 58, 52, 54...)
      let prefix2 = phoneNumber.substring(0, 2);
      if (countryFlags[prefix2]) return countryFlags[prefix2];

      // 3. Probar con prefijos de 1 dígito (ej: 1 para USA o 7 para Rusia)
      let prefix1 = phoneNumber.substring(0, 1);
      if (countryFlags[prefix1]) return countryFlags[prefix1];

      return '🚩'; // Bandera por defecto si no se reconoce
    };

    let messageText = `*${groupName}*\n\n*Integrantes: ${participants.length}*\n${customMessage}\n┌──⭓ *Despierten*\n`;
    for (const mem of participants) {
      messageText += `${emoji} ${getCountryFlag(mem.id)} @${mem.id.split('@')[0]}\n`;
    }
    messageText += `└───────⭓\n\n𝘚𝘶𝘱𝘦𝘳 𝘉𝘰𝒕 𝘞𝘩𝘢𝘵𝘴𝘈𝘱pf 🚩`;

    const fkontak = {
      key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "AlienMenu" },
      message: {
        locationMessage: {
          name: "*Sasuke Bot MD 🌀*",
          jpegThumbnail: imgLocal,
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Sasuke;;;\nFN:Sasuke Bot\nORG:Barboza Developer\nEND:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    };

    const buttons = [
      { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: '📢 Ver canales' }, type: 1 }
    ];

    const buttonMessage = {
      image: imgLocal,
      caption: messageText,
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4,
      mentions: participants.map(a => a.id)
    };

    await conn.sendMessage(m.chat, buttonMessage, { quoted: fkontak });

  } catch (error) {
    console.error("[ERROR CRÍTICO EN TAGALL]:", error);
    conn.reply(m.chat, `❌ Ocurrió un error al ejecutar el comando.`, m);
  }
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = true;
handler.group = true;

export default handler;
