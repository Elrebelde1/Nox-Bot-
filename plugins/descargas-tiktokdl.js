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
        if (!proposee) return m.reply('*🐍 [ ERROR ] ➔ Responde o etiqueta a alguien para la propuesta.*');
        if (proposee === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*');
        if (userIsMarried(sender)) return m.reply(`*⚠️ Ya estás unido a:* @${marriages[sender].partner.split`@`[0]}`, null, { mentions: [marriages[sender].partner] });

        const sentMsg = await conn.reply(m.chat, `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* solicita un vínculo con *@${proposee.split`@`[0]}*.\n\n¿Aceptas unir tu destino? 💍\n\n> Responde: *Acepto* o *No*`, m, { mentions: [sender, proposee] });
        confirmation[proposee] = { proposer: sender, type: 'marry', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[proposee]; }, 60000) };
    }

    // --- COMANDO ADOPTAR ---
    if (/^adoptar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply(`*❌ [ ACCESO DENEGADO ] ❌*\n\nPara adoptar, primero debes estar casado legalmente.`);
        const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!target) return m.reply('*🍼 Menciona o responde a quien quieras adoptar.*');
        
        const partner = marriages[sender].partner;
        const sentMsg = await conn.reply(m.chat, `*─── [ 🍼 𝓐𝓓𝓞𝓟𝓒𝓘𝓞𝓝 ] ───*\n\nLa pareja *@${sender.split`@`[0]}* y *@${partner.split`@`[0]}* quieren adoptarte *@${target.split`@`[0]}*.\n\n¿Aceptas formar parte de su familia? ❤️`, m, { mentions: [sender, partner, target] });
        confirmation[target] = { proposer: sender, type: 'adopt', msgId: sentMsg.key.id, timeout: setTimeout(() => { delete confirmation[target]; }, 60000) };
    }

    // --- COMANDO ADOPTAR MASCOTA ---
    if (/^adoptar_mascota$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Solo familias casadas pueden tener mascotas.*');
        const args = text.split(' ');
        const typeInput = args[0]?.toLowerCase();
        const petName = args.slice(1).join(' ');
        const icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };
        if (!icons[typeInput] || !petName) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/zorro] [nombre]`);

        const partner = marriages[sender].partner;
        const petData = { type: icons[typeInput], name: petName, hunger: 100 };
        marriages[sender].pet = petData;
        marriages[partner].pet = petData;
        saveMarriages();
        return m.reply(`*✨ ¡Nueva mascota!* Ahora tienen un ${typeInput} llamado *${petName}* ${icons[typeInput]}.`);
    }

    // --- COMANDO ALIMENTAR ---
    if (/^alimentar$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia.*');
        const data = marriages[sender];
        if (!data.pet) return m.reply('*❌ No tienen mascota.*');
        if (data.pet.hunger >= 100) return m.reply(`*😋 ${data.pet.name} ya está satisfecho/a.*`);

        marriages[sender].pet.hunger = Math.min(100, data.pet.hunger + 25);
        marriages[data.partner].pet.hunger = marriages[sender].pet.hunger;
        saveMarriages();
        return m.reply(`*🍖 @${sender.split`@`[0]} alimentó a ${data.pet.name}!* (Hambre: ${marriages[sender].pet.hunger}%)`, null, { mentions: [sender] });
    }

    // --- COMANDO FAMILIA (NUEVO DISEÑO) ---
    if (/^familia$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes una familia registrada.*');
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
            const estado = h < 20 ? 'Muerto de hambre 💀' : h < 50 ? 'Hambriento 🦴' : 'Feliz 🍖';
            txt += `\n*Mascota:* ${data.pet.type} ${data.pet.name} (${estado})`;
        }
        
        const mentions = [sender, partner, ...hijos.map(h => h.jid)];
        return conn.reply(m.chat, txt, m, { mentions });
    }

    // --- COMANDO AMOR ---
    if (/^amor$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ Debes estar casado.*');
        let data = marriages[sender];
        let days = Math.floor((Date.now() - data.date) / (1000 * 60 * 60 * 24));
        let porcentaje = Math.min(100, 10 + (days * 2));
        return m.reply(`*❤️ Nivel de Amor:* ${porcentaje}%\n*Días juntos:* ${days}`);
    }

    // --- COMANDO DIVORCIO ---
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
            marriages[proposer] = { partner: m.sender, date: now, spied: [], children: [], pet: null };
            marriages[m.sender] = { partner: proposer, date: now, spied: [], children: [], pet: null };
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

handler.help = ['marry', 'divorce', 'amor', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'pareja', 'amor', 'espiar', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar'];
handler.group = true;

export default handler;
