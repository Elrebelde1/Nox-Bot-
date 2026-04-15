import fs from 'fs';
import path from 'path';

// Configuración de archivos
const dir = path.resolve('media/game');
const marriagesFile = path.join(dir, 'marry.json');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let marriages = loadMarriages();
const confirmation = {};

function loadMarriages() {
    try {
        return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    } catch { return {}; }
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
    '🐶': [{ name: 'Croquetas', fill: 20 }, { name: 'Filete', fill: 50 }],
    '🐱': [{ name: 'Atún', fill: 40 }, { name: 'Leche', fill: 20 }],
    '🐰': [{ name: 'Zanahoria', fill: 30 }, { name: 'Heno', fill: 55 }],
    '🦊': [{ name: 'Bayas', fill: 25 }, { name: 'Presa', fill: 50 }]
};

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const sender = m.sender;

    switch (command) {
        case 'marry':
            const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
            if (!proposee) return m.reply('*🐍 Responde o etiqueta a alguien.*');
            if (userIsMarried(sender)) return m.reply('*⚠️ Ya tienes un vínculo.*');
            if (userIsMarried(proposee)) return m.reply('*⚠️ Esa persona ya está casada.*');
            if (proposee === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*');

            const txtM = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${sender.split`@`[0]}* propone matrimonio a *@${proposee.split`@`[0]}*.\n\n> Responde: *acepto* o *rechazo*`;
            const sentMsg = await conn.reply(m.chat, txtM, m, { mentions: [sender, proposee] });
            confirmation[proposee] = { proposer: sender, type: 'marry', msgId: sentMsg.key.id, time: Date.now() };
            break;

        case 'amor':
            if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes pareja registrada.*');
            const partner = marriages[sender].partner;
            const love = Math.floor(Math.random() * 101);
            conn.reply(m.chat, `*❤️ [ 𝓐𝓜𝓞𝓡 ] @${sender.split`@`[0]} & @${partner.split`@`[0]}*\n*Compatibilidad:* ${love}%`, m, { mentions: [sender, partner] });
            break;

        case 'marrylist':
            const list = Object.entries(marriages);
            if (list.length === 0) return m.reply('*❌ No hay parejas registradas.*');
            let txtL = `*─── [ 💍 𝓟𝓐𝓡𝓔𝓙𝓐𝓢 ] ───*\n\n`, visto = new Set(), cont = 1;
            for (const [u, d] of list) {
                if (!visto.has(u)) {
                    txtL += `*${cont++}.* @${u.split`@`[0]} & @${d.partner.split`@`[0]}\n`;
                    visto.add(u); visto.add(d.partner);
                }
            }
            conn.reply(m.chat, txtL, m, { mentions: Array.from(visto) });
            break;

        case 'adoptar_mascota':
            if (!userIsMarried(sender)) return m.reply('*⚠️ Solo familias casadas.*');
            const args = text.split(' ');
            const icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };
            if (!icons[args[0]] || !args[1]) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/zorro] [nombre]`);
            const petData = { type: icons[args[0]], name: args.slice(1).join(' '), hunger: 50 };
            marriages[sender].pet = petData;
            marriages[marriages[sender].partner].pet = petData;
            saveMarriages();
            m.reply(`*✨ ¡Adoptaron a ${petData.name} ${petData.type}!*`);
            break;

        case 'alimentar':
            if (!userIsMarried(sender) || !marriages[sender].pet) return m.reply('*❌ No tienen mascota.*');
            const pet = marriages[sender].pet;
            if (pet.hunger >= 100) return m.reply('*✋ Ya está lleno y feliz.*');
            if (!text) return m.reply(`*🍱 Menú:* ${foodMenu[pet.type].map((f, i) => `\n${i+1}. ${f.name} (+${f.fill}%)`)}`);
            const fIdx = parseInt(text) - 1;
            if (!foodMenu[pet.type][fIdx]) return m.reply('*❌ Opción inválida.*');
            pet.hunger = Math.min(100, pet.hunger + foodMenu[pet.type][fIdx].fill);
            marriages[sender].pet = pet; marriages[marriages[sender].partner].pet = pet;
            saveMarriages();
            m.reply(`*🍖 Alimentado! Hambre: ${pet.hunger}%*`);
            break;

        case 'familia':
            if (!userIsMarried(sender)) return m.reply('*⚠️ Sin familia.*');
            const fam = marriages[sender];
            let txtF = `*── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 ] ──*\n*Padres:* @${sender.split`@`[0]} & @${fam.partner.split`@`[0]}\n*Unión:* ${formatDate(fam.date)}`;
            if (fam.pet) txtF += `\n*Mascota:* ${fam.pet.type} ${fam.pet.name} (${fam.pet.hunger}%)`;
            conn.reply(m.chat, txtF, m, { mentions: [sender, fam.partner] });
            break;

        case 'divorce':
            if (!userIsMarried(sender)) return m.reply('*⚠️ Sin pareja.*');
            const ex = marriages[sender].partner;
            delete marriages[sender]; delete marriages[ex];
            saveMarriages();
            m.reply('*🌑 El vínculo ha sido disuelto.*');
            break;
    }
};

handler.before = async (m, { conn }) => {
    if (!m.text || !confirmation[m.sender]) return;
    const conf = confirmation[m.sender];
    if (Date.now() - conf.time > 60000) return delete confirmation[m.sender];

    const input = m.text.toLowerCase().trim();
    if (input === 'acepto') {
        if (conf.type === 'marry') {
            marriages[conf.proposer] = { partner: m.sender, date: Date.now(), children: [], pet: null };
            marriages[m.sender] = { partner: conf.proposer, date: Date.now(), children: [], pet: null };
            saveMarriages();
            await conn.reply(m.chat, `*💍 ¡Felicidades! @${conf.proposer.split`@`[0]} y @${m.sender.split`@`[0]} se han casado.*`, m, { mentions: [conf.proposer, m.sender] });
        }
        delete confirmation[m.sender];
        return true;
    } else if (input === 'rechazo') {
        await m.reply('*❌ Propuesta rechazada.*');
        delete confirmation[m.sender];
        return true;
    }
};

handler.help = ['marry', 'amor', 'marrylist', 'adoptar_mascota', 'alimentar', 'familia', 'divorce'];
handler.tags = ['fun'];
handler.command = /^(marry|amor|marrylist|adoptar_mascota|alimentar|familia|divorce|pareja)$/i;
handler.group = true;

export default handler;
