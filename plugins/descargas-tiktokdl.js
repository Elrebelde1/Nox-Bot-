import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 
const confirmation = {};

function loadMarriages() {
    if (!fs.existsSync(marriagesFile)) return {};
    try {
        return JSON.parse(fs.readFileSync(marriagesFile, 'utf8'));
    } catch (e) {
        return {};
    }
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

function getDuration(ms) {
    let diff = Date.now() - ms;
    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} día(s)`;
}

// Verifica si el usuario está casado correctamente
const userIsMarried = (user) => {
    return marriages[user] && marriages[user].partner && marriages[marriages[user].partner];
};

const handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 [ ERROR ] ➔ Responde o etiqueta a alguien.*');
        if (proposee === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*');
        
        if (userIsMarried(proposee)) {
            const partner = marriages[proposee].partner;
            if (!marriages[proposee].spied) marriages[proposee].spied = [];
            if (!marriages[proposee].spied.includes(sender)) {
                marriages[proposee].spied.push(sender);
                marriages[partner].spied.push(sender);
                saveMarriages();
            }
            return conn.reply(m.chat, `*🚫 BLOQUEADO 🚫*\n\n@${proposee.split`@`[0]} ya está casado con @${partner.split`@`[0]}. 🐍`, m, { mentions: [partner, proposee] });
        }

        const sentMsg = await conn.reply(m.chat, `*💍 [ VÍNCULO ]*\n\n@${sender.split`@`[0]} quiere unirse a @${proposee.split`@`[0]}.\n\n¿Aceptas? Responde: *Acepto* o *No*`, m, { mentions: [sender, proposee] });
        
        confirmation[proposee] = { 
            proposer: sender, 
            type: 'marriage', 
            msgId: sentMsg.key.id, 
            timeout: setTimeout(() => {
                if (confirmation[proposee]) {
                    conn.sendMessage(m.chat, { text: '*⏰ Tiempo agotado.*' }, { quoted: sentMsg });
                    delete confirmation[proposee];
                }
            }, 60000)
        };
    }

    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Debes estar casado para adoptar.*');
        
        const child = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!child) return m.reply('*🍼 Responde o etiqueta a tu futuro hijo.*');
        
        const partner = marriages[sender].partner;
        const sentMsg = await conn.reply(m.chat, `*🍼 [ ADOPCIÓN ]*\n\n@${sender.split`@`[0]} y @${partner.split`@`[0]} quieren adoptarte @${child.split`@`[0]}.\n\n¿Aceptas? Responde: *Acepto* o *No*`, m, { mentions: [sender, partner, child] });

        confirmation[child] = { 
            proposer: sender, 
            type: 'adoption', 
            msgId: sentMsg.key.id, 
            timeout: setTimeout(() => {
                if (confirmation[child]) {
                    conn.sendMessage(m.chat, { text: '*⏰ La oferta expiró.*' }, { quoted: sentMsg });
                    delete confirmation[child];
                }
            }, 60000)
        };
    }

    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia.*');
        const data = marriages[sender];
        let txt = `*👨‍👩‍👧‍👦 FAMILIA BARBOZA*\n\n*Pareja:* @${sender.split`@`[0]} & @${data.partner.split`@`[0]}\n*Hijos:* `;
        txt += data.children.length > 0 ? data.children.map(v => `@${v.split`@`[0]}`).join(', ') : 'Ninguno';
        return conn.reply(m.chat, txt, m, { mentions: [sender, data.partner, ...data.children] });
    }

    if (/^espiar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No estás casado.*');
        const partner = marriages[sender].partner;
        if (m.quoted?.sender !== partner) return m.reply(`*🕵️‍♂️ Responde a un mensaje de tu pareja (@${partner.split`@`[0]})*`, null, { mentions: [partner] });
        
        const data = marriages[sender];
        if (!data.spied || data.spied.length === 0) return m.reply('*🛡️ Nadie ha intentado nada.*');
        let spyTxt = `*🕵️‍♂️ PRETENDIENTES:* \n` + data.spied.map((v, i) => `${i+1}. @${v.split`@`[0]}`).join('\n');
        return conn.reply(m.chat, spyTxt, m, { mentions: data.spied });
    }
    
    // Otros comandos (divorce, marrylist, etc) seguirían aquí...
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys || !confirmation[m.sender]) return;
    const { proposer, type, timeout, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;
    const txt = m.text.trim().toLowerCase();

    if (/^no$/i.test(txt)) {
        clearTimeout(timeout); delete confirmation[m.sender];
        return m.reply('*💔 Propuesta rechazada.*');
    }

    if (/^acepto$/i.test(txt)) {
        clearTimeout(timeout);
        if (type === 'marriage') {
            let now = Date.now();
            marriages[proposer] = { partner: m.sender, date: now, spied: [], children: [] };
            marriages[m.sender] = { partner: proposer, date: now, spied: [], children: [] };
            saveMarriages();
            m.reply(`*💍 ¡Felicidades!* @${proposer.split`@`[0]} y @${m.sender.split`@`[0]} están unidos.`);
        }
        if (type === 'adoption') {
            const partner = marriages[proposer].partner;
            marriages[proposer].children.push(m.sender);
            marriages[partner].children.push(m.sender);
            saveMarriages();
            m.reply(`*🍼 ¡Adoptado!* @${m.sender.split`@`[0]} ahora es parte de la familia.`);
        }
        delete confirmation[m.sender];
    }
};

handler.command = ['marry', 'marrylist', 'divorce', 'amor', 'espiar', 'adoptar', 'familia'];
handler.group = true;

export default handler;
