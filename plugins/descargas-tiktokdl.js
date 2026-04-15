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
        } else if (typeof data === 'string' && raw[data] === user) {
            valid[user] = { partner: data, date: Date.now(), spied: [] };
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

const handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 [ ERROR ] ➔ Responde o etiqueta a alguien para la propuesta.*');
        if (proposee === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*');
        
        if (userIsMarried(proposee)) {
            const partner = marriages[proposee].partner;
            if (!marriages[proposee].spied) marriages[proposee].spied = [];
            if (!marriages[proposee].spied.includes(sender)) {
                marriages[proposee].spied.push(sender);
                marriages[partner].spied.push(sender);
                saveMarriages();
            }
            return conn.reply(m.chat, `*⚠️ ¡ALERTA DE INFIDELIDAD! ⚠️*\n\n@${partner.split`@`[0]}, ¡atento! *@${sender.split`@`[0]}* intentó tirar un vínculo con tu pareja *@${proposee.split`@`[0]}*. 🐍🔥`, m, { mentions: [partner, sender, proposee] });
        }

        if (userIsMarried(sender)) return m.reply(`*⚠️ Ya estás unido a:* ${conn.getName(marriages[sender].partner)}`);

        proposals[sender] = proposee;
        const confirmationMessage = `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* solicita un vínculo con *@${proposee.split`@`[0]}*.\n\n¿Aceptas unir tu destino? 💍\n\n> Responde: *Acepto* o *No*`.trim();

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
                txt += `*${count}.* @${user.split`@`[0]} ⚔️ @${partner.split`@`[0]}\n   🔹 *Tiempo:* ${getDuration(data.date)}\n\n`;
            }
        }
        txt += `> *Usa ${usedPrefix}espiar @pareja para ver pretendientes.*\n*Barboza Bot*`;
        return conn.reply(m.chat, txt, m, { mentions: Array.from(seen) });
    }

    if (/^espiar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No estás casado.*');
        
        const partner = marriages[sender].partner;
        const target = m.mentionedJid[0] || m.quoted?.sender;

        if (!target || target !== partner) {
            return m.reply(`*🕵️‍♂️ Debes etiquetar a tu pareja (@${partner.split`@`[0]}) para iniciar el espionaje.*`, null, { mentions: [partner] });
        }

        const data = marriages[sender];
        if (!data.spied || data.spied.length === 0) {
            return conn.reply(m.chat, `*🛡️ @${partner.split`@`[0]}, todo está en orden. Nadie ha intentado nada con @${sender.split`@`[0]}.*`, m, { mentions: [partner, sender] });
        }

        let spyTxt = `*🕵️‍♂️ [ REPORTE DE INTROMISIÓN ] 🕵️‍♂️*\n\n`;
        spyTxt += `*⚠️ @${partner.split`@`[0]}, aquí están los que intentaron algo con @${sender.split`@`[0]}:*\n\n`;
        data.spied.forEach((user, i) => { spyTxt += `*${i + 1}.* @${user.split`@`[0]}\n`; });
        spyTxt += `\n> *Barboza Bot*`;
        
        return conn.reply(m.chat, spyTxt, m, { mentions: [...data.spied, partner, sender] });
    }

    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes ningún vínculo.*');
        const partner = marriages[sender].partner;
        delete marriages[sender]; delete marriages[partner];
        saveMarriages();
        return conn.sendMessage(m.chat, { text: `*🌑 Vínculo roto:* Ahora ambos son libres.\n\n> Barboza Bot`, mentions: [sender, partner] }, { quoted: m });
    }

    if (/^amor$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Primero debes estar casado.*');
        let partner = marriages[sender].partner;
        let porcentaje = Math.floor(Math.random() * 100);
        let loveTxt = `*❤️ Medidor de Amor*\n\n*Vínculo:* @${sender.split`@`[0]} x @${partner.split`@`[0]}\n*Porcentaje:* ${porcentaje}%`;
        return conn.reply(m.chat, loveTxt, m, { mentions: [sender, partner] });
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
        marriages[proposer] = { partner: m.sender, date: now, spied: [] };
        marriages[m.sender] = { partner: proposer, date: now, spied: [] };
        saveMarriages();
        clearTimeout(timeout); delete confirmation[m.sender]; delete proposals[proposer];
        const winTxt = `*─── [ 💍 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ───*\n\n🎊 *@${proposer.split`@`[0]}* y *@${m.sender.split`@`[0]}* unidos 💞\n\n> *Barboza Bot*`;
        return conn.sendMessage(m.chat, { text: winTxt, mentions: [proposer, m.sender] }, { quoted: m });
    }
};

handler.help = ['marry', 'marrylist', 'divorce', 'amor', 'espiar'];
handler.tags = ['fun'];
handler.command = ['marry', 'marrylist', 'divorce', 'pareja', 'amor', 'espiar'];
handler.group = true;

export default handler;
