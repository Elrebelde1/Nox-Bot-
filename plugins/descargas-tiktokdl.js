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
            if (valid[user].pet && valid[user].pet.hunger === undefined) valid[user].pet.hunger = 50;
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

// --- CONFIGURACIÓN DE COMIDA PERSONALIZADA ---
const foodMenu = {
    '🐶': [
        { name: 'Croquetas secas', fill: 20 },
        { name: 'Filete de carne', fill: 50 },
        { name: 'Hueso de juguete', fill: 15 }
    ],
    '🐱': [
        { name: 'Atún fresco', fill: 40 },
        { name: 'Leche tibia', fill: 20 },
        { name: 'Golosina para gato', fill: 15 }
    ],
    '🐰': [
        { name: 'Zanahoria fresca', fill: 30 },
        { name: 'Heno premium', fill: 55 }
    ],
    '🦊': [
        { name: 'Bayas silvestres', fill: 25 },
        { name: 'Pequeña presa', fill: 50 }
    ]
};

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    // --- COMANDO MARRY ---
    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 Responde o etiqueta a alguien.*');
        if (userIsMarried(sender)) return m.reply('*⚠️ Ya tienes un vínculo.*');

        const sentMsg = await conn.reply(m.chat, `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* le propone matrimonio a *@${proposee.split`@`[0]}*.\n\n¿Aceptas?`, m, { mentions: [sender, proposee] });
        confirmation[proposee] = { proposer: sender, type: 'marry', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[proposee]; }, 60000) };
    }

    // --- COMANDO ADOPTAR (HIJOS) ---
    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*❌ Primero debes estar casado.*');
        const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!target) return m.reply('*🍼 Menciona a quien quieras adoptar.*');
        
        const partner = marriages[sender].partner;
        const sentMsg = await conn.reply(m.chat, `*─── [ 🍼 𝓐𝓓𝓞𝓟𝓒𝓘𝓞𝓝 ] ───*\n\nLa pareja *@${sender.split`@`[0]}* y *@${partner.split`@`[0]}* quieren adoptarte.\n\n¿Aceptas? ❤️`, m, { mentions: [sender, partner, target] });
        confirmation[target] = { proposer: sender, type: 'adopt', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[target]; }, 60000) };
    }

    // --- COMANDO ADOPTAR MASCOTA ---
    if (/^adoptar_mascota$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Solo familias casadas.*');
        const args = text.split(' ');
        const typeInput = args[0]?.toLowerCase();
        const petName = args.slice(1).join(' ');
        const icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };
        if (!icons[typeInput] || !petName) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/zorro] [nombre]`);

        const partner = marriages[sender].partner;
        const petData = { type: icons[typeInput], name: petName, hunger: 20 };
        marriages[sender].pet = petData;
        marriages[partner].pet = petData;
        saveMarriages();
        return m.reply(`*✨ ¡Adoptaron a ${petName} ${icons[typeInput]}!* Use ${usedPrefix}alimentar para cuidarlo.`);
    }

    // --- COMANDO ALIMENTAR (CON BLOQUEO Y ESTADOS) ---
    if (/^alimentar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia.*');
        const data = marriages[sender];
        if (!data.pet) return m.reply('*❌ No tienen mascota.*');
        
        // BLOQUEO SI YA ESTÁ LLENO
        if (data.pet.hunger >= 100) {
            return m.reply(`*✋ ¡No más comida!* \n\n${data.pet.type} *${data.pet.name}* ya está totalmente lleno/a y feliz. 🥰`);
        }

        const menu = foodMenu[data.pet.type];
        if (!text) {
            let list = `*🍱 MENÚ PARA ${data.pet.name.toUpperCase()} ${data.pet.type}*\n\n`;
            menu.forEach((food, i) => {
                list += `*${i + 1}.* ${food.name} (Sacia: ${food.fill}%)\n`;
            });
            list += `\n*Estado actual:* ${data.pet.hunger}%\n`;
            list += `> *Usa:* ${usedPrefix}${command} [número]`;
            return m.reply(list);
        }

        const index = parseInt(text) - 1;
        if (isNaN(index) || !menu[index]) return m.reply('*❌ Selecciona un número válido del menú.*');

        const foodSelected = menu[index];
        const newHunger = Math.min(100, data.pet.hunger + foodSelected.fill);
        
        marriages[sender].pet.hunger = newHunger;
        marriages[data.partner].pet.hunger = newHunger;
        saveMarriages();

        let animo = newHunger >= 100 ? "🤩 ¡Eufórico!" : newHunger >= 70 ? "😊 Feliz" : "😟 Hambriento";
        let res = `*🍖 @${sender.split`@`[0]} le dio ${foodSelected.name} a ${data.pet.name}!*\n\n`;
        res += `> *Saciedad:* ${newHunger}%\n`;
        res += `> *Ánimo:* ${animo}`;

        return conn.reply(m.chat, res, m, { mentions: [sender] });
    }

    // --- COMANDO FAMILIA (DISEÑO SOLICITADO) ---
    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia.*');
        const data = marriages[sender];
        const partner = data.partner;
        const hijos = data.children || [];
        
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Padres:* @${sender.split`@`[0]} & @${partner.split`@`[0]}\n`;
        txt += `*Unión:* ${formatDate(data.date)}\n\n`;
        
        txt += `*Hijos:* ${hijos.length}\n`;
        hijos.forEach((h, i) => {
            txt += `*${i+1}.* @${h.jid.split`@`[0]} (Adoptado: ${formatDate(h.date)})\n`;
        });
        
        if (data.pet) {
            const h = data.pet.hunger;
            const emojiHumor = h >= 90 ? '🥰' : h >= 50 ? '🙂' : '😟';
            const estadoNom = h >= 100 ? 'Feliz 🍖' : h >= 50 ? 'Satisfecho 🍬' : 'Hambriento 🦴';
            txt += `\n*Mascota:* ${data.pet.type} ${data.pet.name} (${estadoNom} ${emojiHumor})`;
        }
        
        const mentions = [sender, partner, ...hijos.map(h => h.jid)];
        return conn.reply(m.chat, txt, m, { mentions });
    }

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
    const txt = m.text.toLowerCase();

    if (/^acepto$/i.test(txt)) {
        if (type === 'marry') {
            const now = Date.now();
            marriages[proposer] = { partner: m.sender, date: now, children: [], pet: null };
            marriages[m.sender] = { partner: proposer, date: now, children: [], pet: null };
            saveMarriages();
            conn.reply(m.chat, `*💍 ¡Vínculo confirmado!*`, m);
        }
        if (type === 'adopt') {
            const partner = marriages[proposer].partner;
            const childData = { jid: m.sender, date: Date.now() };
            marriages[proposer].children.push(childData);
            marriages[partner].children.push(childData);
            saveMarriages();
            conn.reply(m.chat, `*🍼 ¡Bienvenido a la familia!*`, m);
        }
        delete confirmation[m.sender];
    }
};

handler.help = ['marry', 'divorce', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'pareja', 'amor', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar'];
handler.group = true;

export default handler;
