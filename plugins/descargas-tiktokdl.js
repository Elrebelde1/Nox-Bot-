import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
const confirmation = {};

function loadMarriages() {
    try {
        if (!fs.existsSync(marriagesFile)) return {};
        const raw = JSON.parse(fs.readFileSync(marriagesFile, 'utf8'));
        const valid = {};
        for (const user in raw) {
            const data = raw[user];
            if (typeof data === 'object' && raw[data.partner]?.partner === user) {
                valid[user] = data;
                if (!valid[user].children) valid[user].children = [];
            }
        }
        return valid;
    } catch (e) {
        return {};
    }
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

function formatDate(ms) {
    const d = new Date(ms);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

const userIsMarried = (user) => Object.hasOwn(marriages, user);

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    // --- COMANDO MARRY ---
    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 Responde o etiqueta a alguien.*');
        if (userIsMarried(sender)) return m.reply('*⚠️ Ya tienes un vínculo.*');
        if (userIsMarried(proposee)) return m.reply('*⚠️ Esa persona ya está casada.*');
        if (proposee === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*');

        const txt = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* propone matrimonio a *@${proposee.split`@`[0]}*.\n\n> *Responde a este mensaje con:* \n> ✅ *acepto*\n> ❌ *rechazo*`;
        const sentMsg = await conn.reply(m.chat, txt, m, { mentions: [sender, proposee] });
        
        confirmation[proposee] = { 
            proposer: sender, 
            type: 'marry', 
            msgId: sentMsg.key.id, 
            timeout: setTimeout(() => { delete confirmation[proposee]; }, 120000) // 2 minutos
        };
    }

    // --- COMANDO AMOR ---
    if (/^amor$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes pareja.*');
        const partner = marriages[sender].partner;
        const porcentaje = Math.floor(Math.random() * 101);
        return conn.reply(m.chat, `*─── [ ❤️ 𝓐𝓜𝓞𝓡 ] ───*\n\n*Pareja:* @${sender.split`@`[0]} & @${partner.split`@`[0]}\n*Compatibilidad:* ${porcentaje}%`, m, { mentions: [sender, partner] });
    }

    // --- COMANDO MARRYLIST ---
    if (/^marrylist$/i.test(command)) {
        const visto = new Set();
        let lista = `*─── [ 💍 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓟𝓐𝓡𝓔𝓙𝓐𝓢 ] ───*\n\n`;
        let i = 1;
        for (const user in marriages) {
            const partner = marriages[user].partner;
            if (!visto.has(user)) {
                lista += `*${i++}.* @${user.split`@`[0]} 💖 @${partner.split`@`[0]}\n`;
                visto.add(user); visto.add(partner);
            }
        }
        return conn.reply(m.chat, visto.size > 0 ? lista : '*❌ No hay parejas.*', m, { mentions: Array.from(visto) });
    }

    // --- COMANDO ADOPTAR ---
    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*❌ Primero debes estar casado.*');
        const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!target) return m.reply('*🍼 Menciona a quien quieras adoptar.*');
        const sentMsg = await conn.reply(m.chat, `*🍼 @${target.split`@`[0]}*, ¿aceptas ser adoptado por la familia de *@${sender.split`@`[0]}*?\n\n> Responde *acepto* o *rechazo*`, m, { mentions: [sender, target] });
        confirmation[target] = { proposer: sender, type: 'adopt', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[target]; }, 120000) };
    }

    // --- COMANDO FAMILIA ---
    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia.*');
        const data = marriages[sender];
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n*Padres:* @${sender.split`@`[0]} & @${data.partner.split`@`[0]}\n*Unión:* ${formatDate(data.date)}\n`;
        return conn.reply(m.chat, txt, m, { mentions: [sender, data.partner] });
    }

    // --- COMANDO DIVORCIO ---
    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin pareja.*');
        const partner = marriages[sender].partner;
        delete marriages[sender]; delete marriages[partner];
        saveMarriages();
        return m.reply('*🌑 Vínculo roto.*');
    }
};

handler.before = async (m, { conn }) => {
    // Si no hay confirmación pendiente para quien envía el mensaje, salimos.
    if (!confirmation[m.sender]) return;
    
    const input = (m.text || '').toLowerCase().trim();
    const conf = confirmation[m.sender];

    // Verificamos "acepto" o "rechazo"
    if (/^acepto$/i.test(input)) {
        if (conf.type === 'marry') {
            marriages[conf.proposer] = { partner: m.sender, date: Date.now(), children: [], pet: null };
            marriages[m.sender] = { partner: conf.proposer, date: Date.now(), children: [], pet: null };
            saveMarriages();
            await conn.reply(m.chat, '*💍 ¡Vínculo sellado! Ahora están unidos oficialmente.*', m);
        } else if (conf.type === 'adopt') {
            const partner = marriages[conf.proposer].partner;
            const child = { jid: m.sender, date: Date.now() };
            marriages[conf.proposer].children.push(child);
            marriages[partner].children.push(child);
            saveMarriages();
            await conn.reply(m.chat, '*🍼 ¡Adopción completada!*', m);
        }
        clearTimeout(conf.timeout);
        delete confirmation[m.sender];
        return true; 
    } 
    
    if (/^rechazo$/i.test(input)) {
        await conn.reply(m.chat, '*❌ Propuesta rechazada.*', m);
        clearTimeout(conf.timeout);
        delete confirmation[m.sender];
        return true;
    }
};

handler.command = ['marry', 'divorce', 'pareja', 'adoptar', 'familia', 'amor', 'marrylist'];
handler.group = true;

export default handler;
