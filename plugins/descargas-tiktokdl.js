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
            if (!valid[user].pet) valid[user].pet = null;
        } else if (typeof data === 'string' && raw[data] === user) {
            valid[user] = { partner: data, date: Date.now(), spied: [], children: [], pet: null };
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

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    // --- COMANDO MARRY (MATRIMONIO) ---
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
            return conn.reply(m.chat, `*🚫 ACCIÓN BLOQUEADA 🚫*\n\n@${sender.split`@`[0]}, no puedes proponerle matrimonio a *@${proposee.split`@`[0]}* porque ya está con *@${partner.split`@`[0]}*. 🐍`, m, { mentions: [partner, sender, proposee] });
        }

        if (userIsMarried(sender)) return m.reply(`*⚠️ Ya estás unido a:* @${marriages[sender].partner.split`@`[0]}`, null, { mentions: [marriages[sender].partner] });

        const sentMsg = await conn.reply(m.chat, `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* solicita un vínculo con *@${proposee.split`@`[0]}*.\n\n¿Aceptas? 💍\n\n> Responde: *Acepto* o *No*`, m, { mentions: [sender, proposee] });
        confirmation[proposee] = { proposer: sender, type: 'marry', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[proposee]; }, 60000) };
    }

    // --- COMANDO ADOPTAR (HIJOS) ---
    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply(`*❌ [ ACCESO DENEGADO ] ❌*\n\nPara adoptar un hijo, primero debes estar casado legalmente con *${usedPrefix}marry*.`);
        
        const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!target) return m.reply('*🍼 Menciona o responde a quien quieras adoptar.*');
        if (target === sender || target === marriages[sender].partner) return m.reply('*🤨 No puedes adoptarte a ti mismo ni a tu pareja.*');

        const partner = marriages[sender].partner;
        const sentMsg = await conn.reply(m.chat, `*─── [ 🍼 𝓐𝓓𝓞𝓟𝓒𝓘𝓞𝓝 ] ───*\n\nLa pareja *@${sender.split`@`[0]}* y *@${partner.split`@`[0]}* quieren adoptarte *@${target.split`@`[0]}*.\n\n¿Aceptas? ❤️`, m, { mentions: [sender, partner, target] });
        confirmation[target] = { proposer: sender, type: 'adopt', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[target]; }, 60000) };
    }

    // --- COMANDO ADOPTAR MASCOTA ---
    if (/^adoptar_mascota$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Solo las familias casadas pueden tener mascotas.*');
        if (!text) return m.reply(`*🐾 [ USO ]*\n${usedPrefix}${command} [tipo] [nombre]\n\n*Tipos:* perro, gato, conejo, zorro`);
        
        const args = text.split(' ');
        const typeInput = args[0].toLowerCase();
        const petName = args.slice(1).join(' ');
        const icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };

        if (!petName || !icons[typeInput]) return m.reply('*❌ Formato incorrecto o mascota no válida.*');

        const partner = marriages[sender].partner;
        marriages[sender].pet = { type: icons[typeInput], name: petName };
        marriages[partner].pet = { type: icons[typeInput], name: petName };
        saveMarriages();
        return m.reply(`*✨ ¡Nueva mascota!* Ahora tienen un ${typeInput} llamado *${petName}* ${icons[typeInput]}.`);
    }

    // --- COMANDO FAMILIA (ARBOL GENEALÓGICO) ---
    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia registrada.*');
        const data = marriages[sender];
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Padres:* @${sender.split`@`[0]} ⚔️ @${data.partner.split`@`[0]}\n`;
        txt += `*Tiempo de unión:* ${getDuration(data.date)}\n\n`;
        txt += `*Hijos:* ${data.children?.length > 0 ? data.children.map(v => `@${v.split`@`[0]}`).join(', ') : 'Ninguno 🍼'}\n`;
        if (data.pet) txt += `*Mascota:* ${data.pet.type} ${data.pet.name}\n`;
        return conn.reply(m.chat, txt, m, { mentions: [sender, data.partner, ...(data.children || [])] });
    }

    // --- COMANDO AMOR (NIVELES) ---
    if (/^amor$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Debes estar casado.*');
        let data = marriages[sender];
        let days = Math.floor((Date.now() - data.date) / (1000 * 60 * 60 * 24));
        let porcentaje = Math.min(100, 10 + (days * 2));
        let rango = porcentaje < 50 ? "Novatos 🌱" : porcentaje < 90 ? "Almas Gemelas ✨" : "Pareja Legendaria 👑";
        let loveTxt = `*❤️ Medidor de Amor*\n\n*Pareja:* @${sender.split`@`[0]} x @${data.partner.split`@`[0]}\n*Porcentaje:* ${porcentaje}%\n*Rango:* ${rango}\n*Días:* ${days}`;
        return conn.reply(m.chat, loveTxt, m, { mentions: [sender, data.partner] });
    }

    // --- OTROS COMANDOS (LISTA, ESPIAR, DIVORCIO) ---
    if (/^marrylist$/i.test(command)) {
        let couples = Object.entries(marriages);
        if (couples.length === 0) return m.reply('*😶 Sin registros.*');
        let txt = `*─── [ 💘 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`;
        let seen = new Set();
        let count = 0;
        for (let [user, data] of couples) {
            if (!seen.has(user) && !seen.has(data.partner)) {
                seen.add(user); seen.add(data.partner);
                count++;
                txt += `*${count}.* @${user.split`@`[0]} ⚔️ @${data.partner.split`@`[0]} (${getDuration(data.date)})\n`;
            }
        }
        return conn.reply(m.chat, txt, m, { mentions: Array.from(seen) });
    }

    if (/^espiar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No estás casado.*');
        const data = marriages[sender];
        if (m.quoted?.sender !== data.partner) return m.reply(`*🕵️‍♂️ Responde a tu pareja (@${data.partner.split`@`[0]})*`, null, { mentions: [data.partner] });
        if (!data.spied?.length) return m.reply('*🛡️ Todo tranquilo, nadie ha intentado nada.*');
        let spyTxt = `*🕵️‍♂️ ALERTA:* Los siguientes usuarios intentaron proponer matrimonio a tu pareja:\n\n` + data.spied.map((v, i) => `${i+1}. @${v.split`@`[0]}`).join('\n');
        return conn.reply(m.chat, spyTxt, m, { mentions: data.spied });
    }

    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes pareja.*');
        const partner = marriages[sender].partner;
        delete marriages[sender]; delete marriages[partner];
        saveMarriages();
        return m.reply('*🌑 Vínculo roto. Ahora son libres.*');
    }
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys || !confirmation[m.sender]) return;
    const { proposer, type, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;
    const txt = m.text.trim().toLowerCase();

    if (/^acepto$/i.test(txt)) {
        if (type === 'marry') {
            let now = Date.now();
            marriages[proposer] = { partner: m.sender, date: now, spied: [], children: [], pet: null };
            marriages[m.sender] = { partner: proposer, date: now, spied: [], children: [], pet: null };
            saveMarriages();
            conn.reply(m.chat, `*💍 ¡Vínculo sellado!* Felicidades.`, m);
        }
        if (type === 'adopt') {
            const partner = marriages[proposer].partner;
            marriages[proposer].children.push(m.sender);
            marriages[partner].children.push(m.sender);
            saveMarriages();
            conn.reply(m.chat, `*🍼 ¡Bienvenido/a a la familia!*`, m);
        }
        delete confirmation[m.sender];
    }
    if (/^no$/i.test(txt)) {
        delete confirmation[m.sender];
        return m.reply('*💔 Propuesta rechazada.*');
    }
};

handler.help = ['marry', 'marrylist', 'divorce', 'amor', 'espiar', 'adoptar', 'adoptar_mascota', 'familia'];
handler.tags = ['fun'];
handler.command = ['marry', 'marrylist', 'divorce', 'pareja', 'amor', 'espiar', 'adoptar', 'adoptar_mascota', 'familia'];
handler.group = true;

export default handler;
