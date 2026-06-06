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

    // Diccionario estructurado en un array ordenado por longitud de prefijo (de mayor a menor)
    // Esto garantiza que los prefijos de 3 dígitos se evalúen antes que los de 2 o 1 dígito.
    const countryFlags = [
      { prefijo: '502', bandera: '🇬🇹' }, { prefijo: '503', bandera: '🇸🇻' },
      { prefijo: '504', bandera: '🇭🇳' }, { prefijo: '505', bandera: '🇳🇮' },
      { prefijo: '506', bandera: '🇨🇷' }, { prefijo: '507', bandera: '🇵🇦' },
      { prefijo: '591', bandera: '🇧🇴' }, { prefijo: '592', bandera: '🇬🇾' },
      { prefijo: '593', bandera: '🇪🇨' }, { prefijo: '595', bandera: '🇵🇾' },
      { prefijo: '58',  bandera: '🇻🇪' }, { prefijo: '52',  bandera: '🇲🇽' },
      { prefijo: '54',  bandera: '🇦🇷' }, { prefijo: '57',  bandera: '🇨🇴' },
      { prefijo: '51',  bandera: '🇵🇪' }, { prefijo: '56',  bandera: '🇨🇱' },
      { prefijo: '55',  bandera: '🇧🇷' }, { prefijo: '34',  bandera: '🇪🇸' },
      { prefijo: '44',  bandera: '🇬🇧' }, { prefijo: '33',  bandera: '🇫🇷' },
      { prefijo: '49',  bandera: '🇩🇪' }, { prefijo: '39',  bandera: '🇮🇹' },
      { prefijo: '81',  bandera: '🇯🇵' }, { prefijo: '82',  bandera: '🇰🇷' },
      { prefijo: '86',  bandera: '🇨🇳' }, { prefijo: '91',  bandera: '🇮🇳' },
      { prefijo: '61',  bandera: '🇦🇺' }, { prefijo: '64',  bandera: '🇳🇿' },
      { prefijo: '1',   bandera: '🇺🇸' }, { prefijo: '7',   bandera: '🇷🇺' }
    ];

    // Sistema de coincidencia exacta por descarte de prefijo inicial
    const getCountryFlag = (id) => {
      const phoneNumber = id.split('@')[0];
      
      // Busca el primer prefijo de la lista que coincida exactamente con el inicio del número
      const match = countryFlags.find(c => phoneNumber.startsWith(c.prefijo));
      
      return match ? match.bandera : '🚩';
    };

    let messageText = `*${groupName}*\n\n*Integrantes: ${participants.length}*\n${customMessage}\n┌──⭓ *Despierten*\n`;
    for (const mem of participants) {
      messageText += `${emoji} ${getCountryFlag(mem.id)} @${mem.id.split('@')[0]}\n`;
    }
    messageText += `└───────⭓\n\n𝘚𝘶𝘱𝘦𝘳 𝘉𝘰𝘵 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 🚩`;

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
