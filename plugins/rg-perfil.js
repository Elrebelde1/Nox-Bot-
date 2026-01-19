import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';
import fs from 'fs';

const loadMarriages = () => {
    if (fs.existsSync('./media/database/marry.json')) {
        const data = JSON.parse(fs.readFileSync('./media/database/marry.json', 'utf-8'));
        global.db.data.marriages = data;
    } else {
        global.db.data.marriages = {};
    }
};

var handler = async (m, { conn }) => {
    loadMarriages();

    let who;
    if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
    } else {
        who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    }

    let { premium, level, estrellas, money, exp, registered, role } = global.db.data.users[who] || {};
    let username = conn.getName(who);
    role = role || 'Aldeano';

    // Texto para usuarios normales (Simplificado)
    let noprem = `
「 𖤘 *Perfil De Usuario* 」
❀ *N᥆mᑲrᥱ:* ${username}
❍ *Rᥱgіs𝗍rᥲძ᥆:* ${registered ? '✅': '❌'}

「 ✦ *Recursos - User* 」
✩ *Es𝗍rᥱᥣᥣᥲs:* ${estrellas || 0}
🪙 *M᥆ᥒᥱძᥲs:* ${money || 0}
🌟 *Nі᥎ᥱᥣ:* ${level || 0}
◭ *E᥊⍴ᥱrіᥱᥒᥴіᥲ:* ${exp || 0}
⚡︎ *Rᥲᥒg᥆:* ${role}

> ✧ ⍴ᥲrᥲ ᥎ᥱr 𝗆ᥲ́𝗌 ᥙ𝗌ᥲ *#perfildates*`.trim();

    // Texto para usuarios Premium (Simplificado)
    let prem = `╭──⪩ 𝐍𝐈𝐍𝐆𝐀 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 ⪨
│⧼👤⧽ *ᴜsᴜᴀʀɪᴏ:* *${username}*
│⧼🌀⧽ *ʀᴇɢɪsᴛʀᴀᴅᴏ:* ${registered ? '✅': '❌'}
╰─────────────────⪨

╭────⪩ 𝐑𝐄𝐂𝐔𝐑𝐒𝐎𝐒 ⪨
│⧼💴⧽ *ᴇsᴛʀᴇʟʟᴀs:* ${estrellas || 0}
│⧼🪙⧽ *ᴍᴏɴᴇᴅᴀs:* ${money || 0}
│⧼🌟⧽ *ɴɪᴠᴇʟ:* ${level || 0}
│⧼✨⧽ *ᴇxᴘᴇʀɪᴇɴᴄɪᴀ:* ${exp || 0}
│⧼⚜️⧽ *ʀᴀɴɢᴏ:* ${role}
╰───⪨ *𝓤𝓼𝓾𝓪𝓻𝓲𝓸 𝓓𝓮𝓼𝓽𝓪𝓬𝓪𝓭𝓸* ⪩`.trim();

    // Enviar solo el texto sin imagen
    conn.reply(m.chat, premium ? prem : noprem, m, { mentions: [who] });
}

handler.help = ['profile'];
handler.group = false;
handler.tags = ['rg'];
handler.command = ['profile', 'perfil'];

export default handler;
