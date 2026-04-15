import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
const confirmation = {};

function loadMarriages() {
    const raw = fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    const valid = {};
    for (const user in raw) {
        const data = raw[user];
        if (typeof data === 'object' && raw[data.partner]?.partner === user) {
            valid[user] = data;
            if (!valid[user].children) valid[user].children = [];
            if (valid[user].pet) {
                if (valid[user].pet.hunger === undefined) valid[user].pet.hunger = 50;
                if (!valid[user].pet.lastFed) valid[user].pet.lastFed = Date.now();
            }
        } else if (typeof data === 'string' && raw[data] === user) {
            valid[user] = { partner: data, date: Date.now(), children: [], pet: null };
        }
    }
    return valid;
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

function formatDate(ms) {
    const d = new Date(ms);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

const userIsMarried = (user) => Object.hasOwn(marriages, user);

const foodMenu = {
    '🐶': [{ name: 'Croquetas', fill: 20 }, { name: 'Filete', fill: 50 }, { name: 'Hueso', fill: 15 }],
    '🐱': [{ name: 'Atún', fill: 40 }, { name: 'Leche', fill: 20 }, { name: 'Golosina', fill: 15 }],
    '🐰': [{ name: 'Zanahoria', fill: 30 }, { name: 'Heno', fill: 55 }],
    '🦊': [{ name: 'Bayas', fill: 25 }, { name: 'Presa', fill: 50 }]
};

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    // --- MATRIMONIO ---
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
            timeout: setTimeout(() => { delete confirmation[proposee]; }, 90000) 
        };
    }

    // --- MEDIDOR DE AMOR ---
    if (/^amor$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una pareja registrada para medir el amor.*');
        const partner = marriages[sender].partner;
        const porcentaje = Math.floor(Math.random() * 101);
        let emoji = porcentaje > 80 ? '💖' : porcentaje > 50 ? '❤️' : '💔';
        
        return conn.reply(m.chat, `*─── [ ${emoji} 𝓜𝓔𝓓𝓘𝓓𝓞𝓡 𝓓𝓔 𝓐𝓜𝓞𝓡 ] ───*\n\n*Pareja:* @${sender.split`@`[0]} & @${partner.split`@`[0]}\n*Compatibilidad:* ${porcentaje}%\n\n> ${porcentaje > 70 ? '¡Una conexión inquebrantable!' : 'Aún pueden mejorar su vínculo.'}`, m, { mentions: [sender, partner] });
    }

    // --- LISTA DE MATRIMONIOS DEL GRUPO ---
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
        return conn.reply(m.chat, visto.size > 0 ? lista : '*❌ No hay parejas registradas en el sistema.*', m, { mentions: Array.from(visto) });
    }

    // --- ADOPTAR HIJOS ---
    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*❌ Primero debes estar casado.*');
        const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!target) return m.reply('*🍼 Menciona a quien quieras adoptar.*');
        const sentMsg = await conn.reply(m.chat, `*─── [ 🍼 𝓐𝓓𝓞𝓟𝓒𝓘𝓞𝓝 ] ───*\n\n¿Aceptas ser hijo/a de @${sender.split`@`[0]}?\n\n> Responde *acepto* o *rechazo*`, m, { mentions: [sender, target] });
        confirmation[target] = { proposer: sender, type: 'adopt', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[target]; }, 90000) };
    }

    // --- ADOPTAR MASCOTA ---
    if (/^adoptar_mascota$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Solo familias casadas.*');
        const args = text.split(' ');
        const icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };
        if (!icons[args[0]] || !args[1]) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/zorro] [nombre]`);
        const petData = { type: icons[args[0]], name: args.slice(1).join(' '), hunger: 50, lastFed: Date.now() };
        marriages[sender].pet = petData;
        marriages[marriages[sender].partner].pet = petData;
        saveMarriages();
        return m.reply(`*✨ ¡Adoptaron a ${petData.name} ${petData.type}!*`);
    }

    // --- ALIMENTAR ---
    if (/^alimentar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia.*');
        const data = marriages[sender];
        if (!data.pet) return m.reply('*❌ Sin mascota.*');
        if (data.pet.hunger >= 100) return m.reply(`*✋ ¡No más comida!* ${data.pet.type} *${data.pet.name}* ya está lleno y feliz 🥰`);
        const menu = foodMenu[data.pet.type];
        if (!text) return m.reply(`*🍱 MENÚ*\n${menu.map((f, i) => `*${i+1}.* ${f.name} (+${f.fill}%)`).join('\n')}`);
        const idx = parseInt(text) - 1;
        if (!menu[idx]) return m.reply('*❌ Opción inválida.*');
        data.pet.hunger = Math.min(100, data.pet.hunger + menu[idx].fill);
        data.pet.lastFed = Date.now();
        marriages[sender].pet = data.pet; marriages[data.partner].pet = data.pet;
        saveMarriages();
        return m.reply(`*🍖 Alimentaste a ${data.pet.name}. Saciedad: ${data.pet.hunger}%*`);
    }

    // --- FAMILIA ---
    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia.*');
        const data = marriages[sender];
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n*Padres:* @${sender.split`@`[0]} & @${data.partner.split`@`[0]}\n*Unión:* ${formatDate(data.date)}\n`;
        if (data.pet) txt += `\n*Mascota:* ${data.pet.type} ${data.pet.name}\n*Hambre:* ${data.pet.hunger}%`;
        return conn.reply(m.chat, txt, m, { mentions: [sender, data.partner] });
    }

    // --- DIVORCIO ---
    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin pareja.*');
        const partner = marriages[sender].partner;
        delete marriages[sender]; delete marriages[partner];
        saveMarriages();
        return m.reply('*🌑 Vínculo roto.*');
    }
};

handler.before = async (m) => {
    if (!m.quoted || !m.text || !confirmation[m.sender]) return;
    const { proposer, type, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;

    const input = m.text.toLowerCase().trim();
    if (input === 'acepto') {
        if (type === 'marry') {
            marriages[proposer] = { partner: m.sender, date: Date.now(), children: [], pet: null };
            marriages[m.sender] = { partner: proposer, date: Date.now(), children: [], pet: null };
            saveMarriages();
            m.reply('*💍 ¡Vínculo sellado! Felicidades.*');
        } else if (type === 'adopt') {
            const partner = marriages[proposer].partner;
            const child = { jid: m.sender, date: Date.now() };
            marriages[proposer].children.push(child);
            marriages[partner].children.push(child);
            saveMarriages();
            m.reply('*🍼 ¡Adopción completada!*');
        }
        delete confirmation[m.sender];
    } else if (input === 'rechazo') {
        m.reply('*❌ Propuesta rechazada.*');
        delete confirmation[m.sender];
    }
    return true;
};

handler.help = ['marry', 'divorce', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar', 'amor', 'marrylist'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'pareja', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar', 'amor', 'marrylist'];
handler.group = true;

export default handler;
