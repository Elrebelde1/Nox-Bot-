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
            if (!valid[user].spied) valid[user].spied = [];
            if (!valid[user].children) valid[user].children = [];
        } else if (typeof data === 'string' && raw[data] === user) {
            valid[user] = { partner: data, date: Date.now(), spied: [], children: [] };
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

const userIsMarried = (user) => {
    return marriages[user] && marriages[marriages[user].partner]?.partner === user;
};

const handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 [ ERROR ] ➔ Responde o etiqueta a alguien para la propuesta.*');
        if (proposee === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*');
        
        if (userIsMarried(proposee)) {
            const partner = marriages[proposee].partner;
            if (!marriages[proposee].spied.includes(sender)) {
                marriages[proposee].spied.push(sender);
                marriages[partner].spied.push(sender);
                saveMarriages();
            }
            return conn.reply(m.chat, `*🚫 ACCIÓN BLOQUEADA 🚫*\n\n@${sender.split`@`[0]}, *@${proposee.split`@`[0]}* ya está en un vínculo con *@${partner.split`@`[0]}*. 🐍🔥`, m, { mentions: [partner, sender, proposee] });
        }

        proposals[proposee] = { type: 'marriage', proposer: sender };
        const sentMsg = await conn.reply(m.chat, `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* solicita un vínculo con *@${proposee.split`@`[0]}*.\n\n¿Aceptas? 💍\n\n> Responde: *Acepto* o *No*`, m, { mentions: [sender, proposee] });
        
        confirmation[proposee] = { proposer: sender, type: 'marriage', msgId: sentMsg.key.id, timeout: setTimeout(() => {
            if (confirmation[proposee]) {
                conn.sendMessage(m.chat, { text: '*⏰ Tiempo agotado.*' }, { quoted: sentMsg });
                delete confirmation[proposee];
            }
        }, 60000)};
    }

    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Necesitas estar unido a alguien mediante .marry para formar una familia.*');
        
        const child = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!child) return m.reply('*🍼 Responde o etiqueta a quien quieras adoptar.*');
        if (child === sender || child === marriages[sender].partner) return m.reply('*🤨 No puedes adoptarte a ti mismo ni a tu pareja.*');

        const partner = marriages[sender].partner;
        const adoptMsg = `*─── [ 🍼 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓐𝓓𝓞𝓟𝓒𝓘𝓞𝓝 ] ───*\n\nLa pareja *@${sender.split`@`[0]}* y *@${partner.split`@`[0]}* quieren adoptarte, *@${child.split`@`[0]}*.\n\n¿Aceptas ser su hijo/a? ❤️\n\n> Responde: *Acepto* o *No*`;

        const sentMsg = await conn.reply(m.chat, adoptMsg, m, { mentions: [sender, partner, child] });
        confirmation[child] = { proposer: sender, type: 'adoption', msgId: sentMsg.key.id, timeout: setTimeout(() => {
            if (confirmation[child]) {
                conn.sendMessage(m.chat, { text: '*⏰ La oferta expiró.*' }, { quoted: sentMsg });
                delete confirmation[child];
            }
        }, 60000)};
    }

    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia registrada.*');
        const data = marriages[sender];
        const partner = data.partner;
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Padres:* @${sender.split`@`[0]} ⚔️ @${partner.split`@`[0]}\n`;
        txt += `*Hijos:* ${data.children.length > 0 ? '' : 'Ninguno todavía 🍼'}\n`;
        data.children.forEach((child, i) => { txt += `*${i + 1}.* @${child.split`@`[0]}\n`; });
        return conn.reply(m.chat, txt, m, { mentions: [sender, partner, ...data.children] });
    }

    // ... (marrylist, espiar, divorce, amor se mantienen igual)
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys || !confirmation[m.sender]) return;
    const { proposer, type, timeout, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;
    const txt = m.text.trim().toLowerCase();

    if (/^no$/i.test(txt)) {
        clearTimeout(timeout); delete confirmation[m.sender];
        return m.reply(`*💔 Se rechazó la propuesta.*`);
    }

    if (/^acepto$/i.test(txt)) {
        clearTimeout(timeout);
        if (type === 'marriage') {
            let now = Date.now();
            marriages[proposer] = { partner: m.sender, date: now, spied: [], children: [] };
            marriages[m.sender] = { partner: proposer, date: now, spied: [], children: [] };
            saveMarriages();
            delete confirmation[m.sender];
            return conn.reply(m.chat, `*💍 ¡Vínculo sellado!* @${proposer.split`@`[0]} y @${m.sender.split`@`[0]} ahora están unidos. 💞`, m, { mentions: [proposer, m.sender] });
        }
        if (type === 'adoption') {
            const partner = marriages[proposer].partner;
            marriages[proposer].children.push(m.sender);
            marriages[partner].children.push(m.sender);
            saveMarriages();
            delete confirmation[m.sender];
            return conn.reply(m.chat, `*🍼 ¡Bienvenido a la familia!* @${m.sender.split`@`[0]} ahora es hijo de @${proposer.split`@`[0]} y @${partner.split`@`[0]}. ❤️`, m, { mentions: [m.sender, proposer, partner] });
        }
    }
};

handler.help = ['marry', 'marrylist', 'divorce', 'amor', 'espiar', 'adoptar', 'familia'];
handler.tags = ['fun'];
handler.command = ['marry', 'marrylist', 'divorce', 'pareja', 'amor', 'espiar', 'adoptar', 'familia'];
handler.group = true;

export default handler;
