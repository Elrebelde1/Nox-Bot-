Ponle aquí el . amor que es para medir el amor entre la pareja y el marrylist las parejas del grupo 

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
        const sentMsg = await conn.reply(m.chat, `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* propone matrimonio a *@${proposee.split`@`[0]}*.`, m, { mentions: [sender, proposee] });
        confirmation[proposee] = { proposer: sender, type: 'marry', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[proposee]; }, 60000) };
    }

    // --- ADOPTAR HIJOS ---
    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*❌ Primero debes estar casado.*');
        const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!target) return m.reply('*🍼 Menciona a quien quieras adoptar.*');
        const partner = marriages[sender].partner;
        const sentMsg = await conn.reply(m.chat, `*─── [ 🍼 𝓐𝓓𝓞𝓟𝓒𝓘𝓞𝓝 ] ───*\n\nLa pareja *@${sender.split`@`[0]}* y *@${partner.split`@`[0]}* quieren adoptarte.`, m, { mentions: [sender, partner, target] });
        confirmation[target] = { proposer: sender, type: 'adopt', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[target]; }, 60000) };
    }

    // --- ADOPTAR MASCOTA ---
    if (/^adoptar_mascota$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Solo familias casadas.*');
        const args = text.split(' ');
        const typeInput = args[0]?.toLowerCase();
        const petName = args.slice(1).join(' ');
        const icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };
        if (!icons[typeInput] || !petName) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/zorro] [nombre]`);
        const petData = { type: icons[typeInput], name: petName, hunger: 50, lastFed: Date.now() };
        marriages[sender].pet = petData;
        marriages[marriages[sender].partner].pet = petData;
        saveMarriages();
        return m.reply(`*✨ ¡Adoptaron a ${petName} ${icons[typeInput]}!*`);
    }

    // --- ALIMENTAR ---
    if (/^alimentar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes familia.*');
        const data = marriages[sender];
        if (!data.pet) return m.reply('*❌ No tienen mascota.*');

        if (data.pet.hunger >= 100) {
            const frases = ['está totalmente lleno y feliz 🥰', 'está eufórico y saltando de alegría 🐾', 'se siente muy alegre y satisfecho ✨', 'está con la panza llena y el corazón contento ❤️'];
            const randomF = frases[Math.floor(Math.random() * frases.length)];
            return m.reply(`*✋ ¡No más comida!*\n\n${data.pet.type} *${data.pet.name}* ya ${randomF}.\n\n> *Estado:* 100% Satisfecho 🌟`);
        }

        const menu = foodMenu[data.pet.type];
        if (!text) {
            let list = `*🍱 MENÚ PARA ${data.pet.name.toUpperCase()} ${data.pet.type}*\n\n`;
            menu.forEach((f, i) => list += `*${i + 1}.* ${f.name} (+${f.fill}%)\n`);
            return m.reply(list + `\n> *Usa:* ${usedPrefix}${command} [número]`);
        }

        const index = parseInt(text) - 1;
        if (isNaN(index) || !menu[index]) return m.reply('*❌ Opción inválida.*');

        const newHunger = Math.min(100, data.pet.hunger + menu[index].fill);
        marriages[sender].pet.hunger = newHunger;
        marriages[sender].pet.lastFed = Date.now();
        marriages[data.partner].pet = marriages[sender].pet;
        saveMarriages();

        let animo = newHunger >= 100 ? "🤩 ¡Eufórico!" : newHunger >= 70 ? "😊 Alegre" : "😐 Contento";
        return conn.reply(m.chat, `*🍖 @${sender.split`@`[0]} le dio ${menu[index].name} a ${data.pet.name}!*\n\n> *Saciedad:* ${newHunger}%\n> *Ánimo:* ${animo}`, m, { mentions: [sender] });
    }

    // --- FAMILIA ---
    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia.*');
        const data = marriages[sender];
        const partner = data.partner;
        const hrsSinceFed = (Date.now() - data.pet?.lastFed) / (1000 * 60 * 60);

        if (data.pet && hrsSinceFed > 24) {
            data.pet.hunger = Math.max(0, data.pet.hunger - 10);
            marriages[sender].pet.hunger = data.pet.hunger;
            marriages[partner].pet.hunger = data.pet.hunger;
            saveMarriages();
        }

        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Padres:* @${sender.split`@`[0]} & @${partner.split`@`[0]}\n`;
        txt += `*Unión:* ${formatDate(data.date)}\n\n`;

        if (data.pet) {
            const h = data.pet.hunger;
            txt += `*Mascota:* ${data.pet.type} ${data.pet.name}\n`;
            txt += `*Estado:* ${h >= 100 ? 'Lleno y Feliz 🥰' : h >= 50 ? 'Satisfecho 🙂' : 'Hambriento 😟'}\n`;
            txt += `*Hambre:* [${'🟩'.repeat(Math.floor(h/20))}${'⬜'.repeat(5-Math.floor(h/20))}] ${h}%\n`;
            if (h < 20 || hrsSinceFed > 48) txt += `\n*⚠️ ¡AVISO!* @${sender.split`@`[0]} y @${partner.split`@`[0]}, alimenten a su mascota. 🦴\n`;
        }
        return conn.reply(m.chat, txt, m, { mentions: [sender, partner] });
    }

    // --- DIVORCIO ---
    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes pareja.*');
        const partner = marriages[sender].partner;
        delete marriages[sender]; delete marriages[partner];
        saveMarriages();
        return m.reply('*🌑 Vínculo roto.*');
    }
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || !confirmation[m.sender]) return;
    const { proposer, type, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;
    if (/^acepto$/i.test(m.text)) {
        if (type === 'marry') {
            marriages[proposer] = { partner: m.sender, date: Date.now(), children: [], pet: null };
            marriages[m.sender] = { partner: proposer, date: Date.now(), children: [], pet: null };
            saveMarriages();
            m.reply('*💍 ¡Vínculo sellado!*');
        }
        delete confirmation[m.sender];
    }
};

handler.help = ['marry', 'divorce', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'pareja', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar',amor','marrylist'];
handler.group = true;

export default handler;