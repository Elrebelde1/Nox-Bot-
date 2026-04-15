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
            if (!valid[user].spied) valid[user].spied = [];
            if (!valid[user].children) valid[user].children = [];
            if (valid[user].pet && valid[user].pet.hunger === undefined) valid[user].pet.hunger = 50;
        } else if (typeof data === 'string' && raw[data] === user) {
            valid[user] = { partner: data, date: Date.now(), spied: [], children: [], pet: null };
        }
    }
    return valid;
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const userIsMarried = (user) => Object.hasOwn(marriages, user);

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 Responde o etiqueta a alguien.*');
        if (userIsMarried(sender)) return m.reply('*⚠️ Ya estás casado.*');
        
        const sentMsg = await conn.reply(m.chat, `*💍 @${sender.split`@`[0]}* le propone matrimonio a *@${proposee.split`@`[0]}*.\n\n¿Aceptas?`, m, { mentions: [sender, proposee] });
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
        const petData = { type: icons[typeInput], name: petName, hunger: 100, lastFed: Date.now() };
        marriages[sender].pet = petData;
        marriages[partner].pet = petData;
        saveMarriages();
        return m.reply(`*✨ ¡Adoptaron a ${petName}!* No olvides usar *${usedPrefix}alimentar* para que sea feliz.`);
    }

    // --- NUEVO COMANDO ALIMENTAR ---
    if (/^alimentar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia a la cual ayudar.*');
        const data = marriages[sender];
        if (!data.pet) return m.reply('*❌ Tu familia no tiene una mascota.*');

        if (data.pet.hunger >= 100) return m.reply(`*😋 ${data.pet.name} ya está lleno/a.*`);

        const partner = data.partner;
        marriages[sender].pet.hunger = Math.min(100, data.pet.hunger + 25);
        marriages[partner].pet.hunger = marriages[sender].pet.hunger;
        
        // Bonus de amor por cuidar a la mascota
        marriages[sender].date -= (1000 * 60 * 60 * 12); // Adelanta el tiempo 12h para subir amor
        marriages[partner].date -= (1000 * 60 * 60 * 12);
        
        saveMarriages();
        return m.reply(`*🍖 @${sender.split`@`[0]} alimentó a ${data.pet.name}!*\n\nNivel de saciedad: ${marriages[sender].pet.hunger}%\n*¡El amor de la familia aumentó!* ❤️`, null, { mentions: [sender] });
    }

    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia.*');
        const data = marriages[sender];
        let txt = `*─── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 ] ───*\n\n`;
        txt += `*Padres:* @${sender.split`@`[0]} & @${data.partner.split`@`[0]}\n`;
        txt += `*Hijos:* ${data.children?.length || 0}\n`;
        if (data.pet) {
            const h = data.pet.hunger;
            const estado = h < 20 ? 'Muerto de hambre 💀' : h < 50 ? 'Hambriento 🦴' : 'Feliz 🍖';
            txt += `*Mascota:* ${data.pet.type} ${data.pet.name} (${estado})\n`;
        }
        return conn.reply(m.chat, txt, m, { mentions: [sender, data.partner, ...(data.children || [])] });
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
            marriages[proposer] = { partner: m.sender, date: Date.now(), spied: [], children: [], pet: null };
            marriages[m.sender] = { partner: proposer, date: Date.now(), spied: [], children: [], pet: null };
            saveMarriages();
            m.reply('*💍 ¡Casados!*');
        }
        delete confirmation[m.sender];
    }
};

handler.help = ['marry', 'divorce', 'alimentar', 'adoptar_mascota', 'familia'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'pareja', 'amor', 'espiar', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar'];
handler.group = true;

export default handler;
