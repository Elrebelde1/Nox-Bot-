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
            if (!valid[user].items) valid[user].items = [];
            if (!valid[user].children) valid[user].children = [];
            if (valid[user].pet && valid[user].pet.hunger === undefined) valid[user].pet.hunger = 50;
        } else if (typeof data === 'string' && raw[data] === user) {
            valid[user] = { partner: data, date: Date.now(), children: [], items: [], pet: null };
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

// --- TIENDA DE LUJO ---
const shopItems = [
    { id: 1, name: 'Anillo de Diamante', icon: '💎', desc: 'Sube el nivel de amor' },
    { id: 2, name: 'Casa de Campo', icon: '🏡', desc: 'Un lugar acogedor' },
    { id: 3, name: 'Auto Deportivo', icon: '🏎️', desc: 'Para pasear en familia' },
    { id: 4, name: 'Mansión Moderna', icon: '🏰', desc: 'Máximo estatus social' },
    { id: 5, name: 'Yate Privado', icon: '🛥️', desc: 'Vacaciones de lujo' }
];

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    // --- COMANDO TIENDA ---
    if (/^tienda$/i.test(command)) {
        let list = `*─── [ 🛒 𝓣𝓘𝓔𝓝𝓓𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        shopItems.forEach(item => {
            list += `*${item.id}.* ${item.icon} ${item.name}\n> _${item.desc}_\n\n`;
        });
        list += `> *Usa:* ${usedPrefix}comprar [número]`;
        return m.reply(list);
    }

    // --- COMANDO COMPRAR ---
    if (/^comprar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Debes estar casado para comprar bienes familiares.*');
        const index = parseInt(text) - 1;
        if (isNaN(index) || !shopItems[index]) return m.reply('*❌ Elige un número válido de la tienda.*');

        const item = shopItems[index];
        const partner = marriages[sender].partner;

        if (marriages[sender].items.includes(item.name)) return m.reply(`*⚠️ Tu familia ya posee un ${item.name}.*`);

        marriages[sender].items.push(item.name);
        marriages[partner].items.push(item.name);
        saveMarriages();

        return m.reply(`*🎉 ¡Felicidades!* Tu familia ha adquirido: ${item.icon} *${item.name}*.\nAhora aparecerá en su perfil familiar.`);
    }

    // --- COMANDO FAMILIA (ACTUALIZADO CON BIENES) ---
    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia.*');
        const data = marriages[sender];
        const partner = data.partner;
        const bienes = data.items || [];
        
        let rangos = bienes.length >= 4 ? 'Dinastía Real 👑' : bienes.length >= 2 ? 'Familia de Clase Alta 💵' : 'Familia Humilde 🏠';

        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Rango:* ${rangos}\n`;
        txt += `*Padres:* @${sender.split`@`[0]} & @${partner.split`@`[0]}\n`;
        txt += `*Unión:* ${formatDate(data.date)}\n\n`;
        
        txt += `*🏙️ BIENES FAMILIARES:* \n`;
        if (bienes.length > 0) {
            txt += `> ${bienes.join(', ')}\n\n`;
        } else {
            txt += `> Ninguno. ¡Visita la .tienda! 🛒\n\n`;
        }

        if (data.pet) {
            const h = data.pet.hunger;
            txt += `*Mascota:* ${data.pet.type} ${data.pet.name} (${h >= 100 ? 'Feliz 🥰' : 'Hambriento 😟'})\n`;
        }
        
        return conn.reply(m.chat, txt, m, { mentions: [sender, partner] });
    }

    // --- (Mantener comandos marry, adoptar, alimentar igual) ---
};

handler.help = ['marry', 'tienda', 'comprar', 'familia', 'alimentar', 'adoptar_mascota'];
handler.tags = ['fun'];
handler.command = ['marry', 'tienda', 'comprar', 'familia', 'alimentar', 'adoptar_mascota', 'divorce'];
handler.group = true;

export default handler;
