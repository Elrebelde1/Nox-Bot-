import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 
const confirmation = {};

function loadMarriages() {
    const raw = fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    const valid = {};
    for (const user in raw) {
        const data = raw[user];
        if (typeof data === 'object' && raw[data.partner]?.partner === user) {
            valid[user] = data;
        } else if (typeof data === 'string' && raw[data] === user) {
            valid[user] = { partner: data, date: Date.now() };
        }
    }
    return valid;
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

function getDuration(ms) {
    let now = Date.now();
    let diff = now - ms;
    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    let months = Math.floor(days / 30);
    let years = Math.floor(months / 12);

    if (years > 0) return `${years} año(s), ${months % 12} mes(es) y ${days % 30} día(s)`;
    if (months > 0) return `${months} mes(es) y ${days % 30} día(s)`;
    return `${days} día(s)`;
}

const userIsMarried = (user) => Object.hasOwn(marriages, user);

const handler = async (m, { conn, command }) => {
    const sender = m.sender;

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 [ ERROR ] ➔ Responde al mensaje de alguien para proponer un vínculo.*');
        if (proposee === sender) return m.reply('*🤨 No puedes sellar un vínculo contigo mismo.*');
        if (userIsMarried(sender)) return m.reply(`*⚠️ Ya estás unido a:* ${conn.getName(marriages[sender].partner)}`);
        if (userIsMarried(proposee)) return m.reply(`*⚠️ Esa persona ya tiene un destino sellado.*`);

        proposals[sender] = proposee;
        const confirmationMessage = `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* solicita un vínculo con *@${proposee.split`@`[0]}*.\n\n¿Aceptas unir tu destino? 💍\n\n> Responde con: *Acepto* o *No*\n*Barboza Bot*`.trim();

        const sentMsg = await conn.reply(m.chat, confirmationMessage, m, { mentions: [sender, proposee] });
        confirmation[proposee] = {
            proposer: sender,
            msgId: sentMsg.key.id,
            timeout: setTimeout(() => {
                if (confirmation[proposee]) {
                    conn.sendMessage(m.chat, { text: '*⏰ Tiempo agotado.*' }, { quoted: sentMsg });
                    delete confirmation[proposee]; delete proposals[sender];
                }
            }, 60000)
        };
    }

    if (/^marrylist$/i.test(command)) {
        let couples = Object.entries(marriages);
        if (couples.length === 0) return m.reply('*😶 No hay vínculos registrados.*');

        let txt = `*─── [ 💘 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`;
        let seen = new Set();
        let count = 0;

        for (let [user, data] of couples) {
            let partner = data.partner;
            if (!seen.has(user) && !seen.has(partner)) {
                seen.add(user); seen.add(partner);
                count++;
                let dateStr = new Date(data.date).toLocaleDateString('es-ES');
                let timeAgo = getDuration(data.date);
                txt += `*${count}.* @${user.split`@`[0]} ⚔️ @${partner.split`@`[0]}\n`;
                txt += `   🔹 *Fecha:* ${dateStr}\n`;
                txt += `   🔹 *Tiempo:* ${timeAgo}\n\n`;
            }
        }
        txt += `*✨ Total:* ${count}\n*Barboza Bot*`;
        return conn.reply(m.chat, txt, m, { mentions: Array.from(seen) });
    }

    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes ningún vínculo.*');
        const partner = marriages[sender].partner;
        delete marriages[sender]; delete marriages[partner];
        saveMarriages();
        return conn.sendMessage(m.chat, { text: `*🌑 Vínculo roto:* Ahora ambos son libres.\n\n> Barboza Bot`, mentions: [sender, partner] }, { quoted: m });
    }
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys || !confirmation[m.sender]) return;
    const { proposer, timeout, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;
    const txt = m.text.trim().toLowerCase();

    if (/^no$/i.test(txt)) {
        clearTimeout(timeout); delete confirmation[m.sender]; delete proposals[proposer];
        return conn.reply(m.chat, '*💔 Vínculo rechazado.*', m);
    }

    if (/^acepto$/i.test(txt)) {
        let now = Date.now();
        marriages[proposer] = { partner: m.sender, date: now };
        marriages[m.sender] = { partner: proposer, date: now };
        saveMarriages();
        clearTimeout(timeout); delete confirmation[m.sender]; delete proposals[proposer];
        const winTxt = `*─── [ 💍 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ───*\n\n🎊 *@${proposer.split`@`[0]}* y *@${m.sender.split`@`[0]}* unidos 💞\n\n> *Barboza Bot*`;
        return conn.sendMessage(m.chat, { text: winTxt, mentions: [proposer, m.sender] }, { quoted: m });
    }
};

handler.help = ['marry', 'marrylist', 'divorce'];
handler.tags = ['fun'];
handler.command = ['marry', 'marrylist', 'divorce', 'partner', 'pareja'];
handler.group = true;

export default handler;
