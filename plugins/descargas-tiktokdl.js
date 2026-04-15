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
            const infielTxt = `*🚫 ACCIÓN BLOQUEADA 🚫*\n\n@${sender.split`@`[0]}, no puedes proponerle matrimonio a *@${proposee.split`@`[0]}* porque ya tiene un destino sellado con *@${partner.split`@`[0]}*.\n\n⚠️ *@${partner.split`@`[0]}*, ¡cuida lo tuyo! Intentaron robarte la pareja. 🐍🔥`;
            return conn.reply(m.chat, infielTxt, m, { mentions: [partner, sender, proposee] });
        }

        if (userIsMarried(sender)) return m.reply(`*⚠️ Ya estás unido a:* ${conn.getName(marriages[sender].partner)}`);

        proposals[proposee] = { proposer: sender, type: 'marry' };
        const confirmationMessage = `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* solicita un vínculo con *@${proposee.split`@`[0]}*.\n\n¿Aceptas unir tu destino? 💍\n\n> Responde: *Acepto* o *No*`.trim();

        const sentMsg = await conn.reply(m.chat, confirmationMessage, m, { mentions: [sender, proposee] });
        confirmation[proposee] = {
            proposer: sender,
            type: 'marry',
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
        if (!userIsMarried(sender)) {
            return m.reply(`*❌ [ ACCESO DENEGADO ] ❌*\n\nPara poder adoptar un hijo, primero debes estar casado legalmente.\n\n> Usa el comando *${usedPrefix}marry @pareja* para casarte primero.`);
        }
        
        const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!target) return m.reply('*🍼 Menciona o responde a quien quieras adoptar como hijo/a.*');
        if (target === sender || target === marriages[sender].partner) return m.reply('*🤨 No puedes adoptarte a ti mismo ni a tu pareja.*');

        const partner = marriages[sender].partner;
        const adoptMsg = `*─── [ 🍼 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓐𝓓𝓞𝓟𝓒𝓘𝓞𝓝 ] ───*\n\nLa pareja *@${sender.split`@`[0]}* y *@${partner.split`@`[0]}* quieren adoptarte como su hijo/a, *@${target.split`@`[0]}*.\n\n¿Aceptas formar parte de su familia? ❤️\n\n> Responde: *Acepto* o *No*`;

        const sentMsg = await conn.reply(m.chat, adoptMsg, m, { mentions: [sender, partner, target] });
        confirmation[target] = {
            proposer: sender,
            type: 'adopt',
            msgId: sentMsg.key.id,
            timeout: setTimeout(() => {
                if (confirmation[target]) {
                    conn.sendMessage(m.chat, { text: '*⏰ La oferta de adopción expiró.*' }, { quoted: sentMsg });
                    delete confirmation[target];
                }
            }, 60000)
        };
    }

    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia registrada.*');
        const data = marriages[sender];
        const partner = data.partner;
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Padres:* @${sender.split`@`[0]} ⚔️ @${partner.split`@`[0]}\n`;
        txt += `*Tiempo de unión:* ${getDuration(data.date)}\n\n`;
        txt += `*Hijos:* ${data.children && data.children.length > 0 ? '' : 'Ninguno todavía 🍼'}\n`;
        
        if (data.children) {
            data.children.forEach((child, i) => {
                txt += `*${i + 1}.* @${child.split`@`[0]}\n`;
            });
        }
        
        return conn.reply(m.chat, txt, m, { mentions: [sender, partner, ...(data.children || [])] });
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
        txt += `> *Para ver pretendientes responde a un mensaje de tu pareja con:* ${usedPrefix}espiar\n*Barboza Bot*`;
        return conn.reply(m.chat, txt, m, { mentions: Array.from(seen) });
    }

    if (/^espiar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply(`*⚠️ Primero debes ver la lista de parejas con ${usedPrefix}marrylist.*`);
        const partner = marriages[sender].partner;
        const target = m.quoted?.sender; 
        if (!target || target !== partner) {
            return m.reply(`*🕵️‍♂️ Seguridad:* Debes responder a un mensaje de tu pareja actual (@${partner.split`@`[0]}) para ver el reporte.`, null, { mentions: [partner] });
        }
        const data = marriages[sender];
        if (!data.spied || data.spied.length === 0) {
            return conn.reply(m.chat, `*🛡️ REPORTE:* @${partner.split`@`[0]}, nadie ha intentado nada con @${sender.split`@`[0]}. Todo está en orden.`, m, { mentions: [partner, sender] });
        }
        let spyTxt = `*🕵️‍♂️ [ ALERTA DE SEGURIDAD ] 🕵️‍♂️*\n\n⚠️ @${partner.split`@`[0]}, se han detectado los siguientes pretendientes para @${sender.split`@`[0]}:\n\n`;
        data.spied.forEach((user, i) => { spyTxt += `*${i + 1}.* @${user.split`@`[0]}\n`; });
        return conn.reply(m.chat, spyTxt, m, { mentions: [...data.spied, partner, sender] });
    }

    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes ningún vínculo.*');
        const partner = marriages[sender].partner;
        delete marriages[sender]; delete marriages[partner];
        saveMarriages();
        return conn.sendMessage(m.chat, { text: `*🌑 Vínculo roto:* Ahora ambos son libres.\n\n> Barboza Bot`, mentions: [sender, partner] }, { quoted: m });
    }

    // --- COMANDO AMOR MEJORADO (FUNCIÓN 3) ---
    if (/^amor$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Primero debes estar unido mediante .marry.*');
        
        let data = marriages[sender];
        let partner = data.partner;
        let now = Date.now();
        let daysMarried = Math.floor((now - data.date) / (1000 * 60 * 60 * 24));
        
        // El amor base es 10% y sube 2% por cada día casado hasta el 100%
        let porcentaje = Math.min(10, 10 + (daysMarried * 2));
        if (porcentaje < 100) porcentaje = 10 + (daysMarried * 2);
        if (porcentaje > 100) porcentaje = 100;

        let rango = "";
        if (porcentaje < 25) rango = "Novatos del Amor 🌱";
        else if (porcentaje < 50) rango = "Vínculo Fortalecido 🔥";
        else if (porcentaje < 75) rango = "Amor Incondicional ❤️";
        else if (porcentaje < 100) rango = "Almas Gemelas ✨";
        else rango = "Pareja Legendaria 👑";

        let loveTxt = `*─── [ ❤️ 𝓔𝓢𝓣𝓐𝓓𝓞 𝓓𝓔𝓛 𝓐𝓜𝓞𝓡 ] ───*\n\n`;
        loveTxt += `*Pareja:* @${sender.split`@`[0]} ⚔️ @${partner.split`@`[0]}\n`;
        loveTxt += `*Nivel de Amor:* [${porcentaje}%]\n`;
        loveTxt += `*Rango:* ${rango}\n`;
        loveTxt += `*Días juntos:* ${daysMarried} día(s)\n\n`;
        loveTxt += `> ${porcentaje === 100 ? '¡Su amor ha alcanzado la cima eterna!' : '¡Sigan cultivando su vínculo para subir de nivel!'}`;
        
        return conn.reply(m.chat, loveTxt, m, { mentions: [sender, partner] });
    }
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys || !confirmation[m.sender]) return;
    const { proposer, type, timeout, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;
    const txt = m.text.trim().toLowerCase();

    if (/^no$/i.test(txt)) {
        clearTimeout(timeout); delete confirmation[m.sender];
        return conn.reply(m.chat, `*💔 Propuesta de ${type === 'marry' ? 'vínculo' : 'adopción'} rechazada.*`, m);
    }

    if (/^acepto$/i.test(txt)) {
        clearTimeout(timeout);
        if (type === 'marry') {
            let now = Date.now();
            marriages[proposer] = { partner: m.sender, date: now, spied: [], children: [] };
            marriages[m.sender] = { partner: proposer, date: now, spied: [], children: [] };
            saveMarriages();
            delete confirmation[m.sender];
            return conn.reply(m.chat, `*💍 ¡Vínculo confirmado!* @${proposer.split`@`[0]} y @${m.sender.split`@`[0]} ahora están unidos 💞\n\n> *Barboza Bot*`, m, { mentions: [proposer, m.sender] });
        }
        
        if (type === 'adopt') {
            const partner = marriages[proposer].partner;
            if (!marriages[proposer].children) marriages[proposer].children = [];
            if (!marriages[partner].children) marriages[partner].children = [];
            
            marriages[proposer].children.push(m.sender);
            marriages[partner].children.push(m.sender);
            saveMarriages();
            delete confirmation[m.sender];
            return conn.reply(m.chat, `*🍼 ¡Bienvenido/a a la familia!* @${m.sender.split`@`[0]} ahora es oficialmente hijo/a de @${proposer.split`@`[0]} y @${partner.split`@`[0]}. ❤️\n\n> *Barboza Bot*`, m, { mentions: [m.sender, proposer, partner] });
        }
    }
};

handler.help = ['marry', 'marrylist', 'divorce', 'amor', 'espiar', 'adoptar', 'familia'];
handler.tags = ['fun'];
handler.command = ['marry', 'marrylist', 'divorce', 'pareja', 'amor', 'espiar', 'adoptar', 'familia'];
handler.group = true;

export default handler;
