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

// --- CONFIGURACIÓN DE COMIDA ---
const foodMenu = {
    '🐶': [
        { name: 'Croquetas secas', fill: 20 },
        { name: 'Filete de carne', fill: 50 },
        { name: 'Hueso de juguete', fill: 10 }
    ],
    '🐱': [
        { name: 'Atún fresco', fill: 40 },
        { name: 'Leche tibia', fill: 20 },
        { name: 'Golosina para gato', fill: 15 }
    ],
    '🐰': [
        { name: 'Zanahoria fresca', fill: 30 },
        { name: 'Heno premium', fill: 50 },
        { name: 'Lechuga', fill: 15 }
    ],
    '🦊': [
        { name: 'Bayas silvestres', fill: 20 },
        { name: 'Pequeña presa', fill: 45 },
        { name: 'Fruta dulce', fill: 25 }
    ]
};

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 Responde o etiqueta a alguien.*');
        if (userIsMarried(sender)) return m.reply('*⚠️ Ya tienes un vínculo.*');

        const sentMsg = await conn.reply(m.chat, `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* le propone matrimonio a *@${proposee.split`@`[0]}*.\n\n¿Aceptas?`, m, { mentions: [sender, proposee] });
        confirmation[proposee] = { proposer: sender, type: 'marry', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[proposee]; }, 60000) };
    }

    if (/^adoptar_mascota$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Solo familias casadas.*');
        const args = text.split(' ');
        const typeInput = args[0]?.toLowerCase();
        const petName = args.slice(1).join(' ');
        const icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };
        if (!icons[typeInput] || !petName) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/zorro] [nombre]`);

        const partner = marriages[sender].partner;
        marriages[sender].pet = { type: icons[typeInput], name: petName, hunger: 20 }; // Empieza con hambre
        marriages[partner].pet = marriages[sender].pet;
        saveMarriages();
        return m.reply(`*✨ ¡Adoptaron a ${petName} ${icons[typeInput]}!*`);
    }

    // --- SISTEMA DE ALIMENTACIÓN MEJORADO ---
    if (/^alimentar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia.*');
        const data = marriages[sender];
        if (!data.pet) return m.reply('*❌ Tu familia no tiene una mascota.*');
        
        const menu = foodMenu[data.pet.type];
        if (!text) {
            let list = `*🍱 MENÚ PARA ${data.pet.name.toUpperCase()} ${data.pet.type}*\n\n`;
            menu.forEach((food, i) => {
                list += `*${i + 1}.* ${food.name} (Sacia: ${food.fill}%)\n`;
            });
            list += `\n> *Usa:* ${usedPrefix}${command} [número]`;
            return m.reply(list);
        }

        const index = parseInt(text) - 1;
        if (isNaN(index) || !menu[index]) return m.reply('*❌ Selecciona un número válido del menú.*');

        if (data.pet.hunger >= 100) return m.reply(`*😋 ${data.pet.name} ya está totalmente lleno/a.*`);

        const foodSelected = menu[index];
        const newHunger = Math.min(100, data.pet.hunger + foodSelected.fill);
        
        marriages[sender].pet.hunger = newHunger;
        marriages[data.partner].pet.hunger = newHunger;
        saveMarriages();

        let res = `*🍖 @${sender.split`@`[0]} le dio ${foodSelected.name} a ${data.pet.name}!*\n\n`;
        res += `> *Saciedad:* ${newHunger}%\n`;
        res += newHunger === 100 ? `*✨ ¡Está completamente feliz!*` : `*💡 Aún le queda un poco de hambre.*`;

        return conn.reply(m.chat, res, m, { mentions: [sender] });
    }

    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia registrada.*');
        const data = marriages[sender];
        const hijos = data.children || [];
        
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Padres:* @${sender.split`@`[0]} & @${data.partner.split`@`[0]}\n`;
        txt += `*Unión:* ${formatDate(data.date)}\n\n`;
        
        txt += `*Hijos (${hijos.length}):*\n`;
        hijos.forEach((h, i) => txt += `*${i+1}.* @${h.jid.split`@`[0]} (Adoptado: ${formatDate(h.date)})\n`);
        
        if (data.pet) {
            const h = data.pet.hunger;
            const barrita = '🟩'.repeat(Math.floor(h / 20)) + '⬜'.repeat(5 - Math.floor(h / 20));
            txt += `\n*Mascota:* ${data.pet.type} ${data.pet.name}\n`;
            txt += `*Estado:* [${barrita}] ${h}% (${h < 50 ? 'Hambriento 🦴' : 'Feliz 🍖'})`;
        }
        
        return conn.reply(m.chat, txt, m, { mentions: [sender, data.partner, ...hijos.map(h => h.jid)] });
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
    if (/^acepto$/i.test(m.text)) {
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
