import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 
const confirmation = {};

function loadMarriages() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });
    if (!fs.existsSync(marriagesFile)) return {};
    const raw = JSON.parse(fs.readFileSync(marriagesFile, 'utf8'));
    
    // Mini-fix: Si los datos viejos no tienen el formato nuevo, los adaptamos
    for (const user in raw) {
        if (typeof raw[user] === 'string') {
            raw[user] = { partner: raw[user], date: Date.now() };
        }
    }
    return raw;
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const userIsMarried = (user) => {
    const m = marriages[user];
    return m && m.partner && marriages[m.partner];
};

const handler = async (m, { conn, command, participants }) => {
    const isPropose = /^marry$/i.test(command);
    const isDivorce = /^divorce$/i.test(command);
    const isPartner = /^partner$/i.test(command);
    const isAccept = /^si$/i.test(command);
    const isReject = /^no$/i.test(command);
    const isList = /^marrylist$/i.test(command);

    try {
        const sender = m.sender;

        // --- LISTA DE MATRIMONIOS (.marrylist) ---
        if (isList) {
            const groupParticipants = participants.map(p => p.id);
            const listed = new Set();
            let text = `   ♱ ─── 𓆩 🍷 𓆪 ─── ♱\n`;
            text += `  *𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐃𝐄 𝐋𝐀𝐙𝐎𝐒*\n\n`;

            let count = 1;
            for (const user in marriages) {
                const data = marriages[user];
                const partner = data?.partner;

                if (!partner || listed.has(user)) continue;

                // Verificamos que ambos estén en el grupo
                if (groupParticipants.includes(user) && groupParticipants.includes(partner)) {
                    listed.add(user);
                    listed.add(partner);

                    const startTime = data.date || Date.now();
                    const diff = Date.now() - startTime;
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const dateStr = new Date(startTime).toLocaleDateString('es-ES');

                    text += `*${count}.* @${user.split('@')[0]} ⚔️ @${partner.split('@')[0]}\n`;
                    text += `   ╰ 📅 *Desde:* ${dateStr} (${days} días)\n\n`;
                    count++;
                }
            }

            if (count === 1) text += `_No hay lazos formados en este sector._ 🌌`;
            return conn.reply(m.chat, text, m, { mentions: Array.from(listed) });
        }

        // --- PROPONER (.marry) ---
        if (isPropose) {
            const proposee = m.quoted?.sender || m.mentionedJid?.[0];
            if (!proposee) throw new Error('Debes responder o mencionar a alguien.');
            
            if (userIsMarried(sender)) throw new Error(`Ya tienes un lazo formado con @${marriages[sender].partner.split('@')[0]}`);
            if (userIsMarried(proposee)) throw new Error(`Esa persona ya tiene un pacto con alguien más.`);
            if (proposer === proposee) throw new Error('No puedes casarte contigo mismo.');

            proposals[sender] = proposee;
            confirmation[proposee] = {
                proposer: sender,
                timeout: setTimeout(() => {
                    delete confirmation[proposee];
                    delete proposals[sender];
                }, 60000)
            };

            let msg = `   ♱ ──── 𓆩 🍷 𓆪 ──── ♱\n    *𝐏𝐑𝐎𝐏𝐔𝐄𝐒𝐓𝐀 𝐃𝐄 𝐋𝐀𝐙𝐎*\n\n🐈‍⬛ @${sender.split('@')[0]} quiere unir su destino al tuyo, @${proposee.split('@')[0]}\n\n¿Aceptarás?\n\n      🌑 𝐒𝐇𝐀𝐑𝐈𝐍𝐆𝐀𝐍 𝐄𝐘𝐄𝐒 🌑\n         ╔════╦════╗\n         ║  .si  ║  .no ║\n         ╚════╩════╝`;
            return await conn.reply(m.chat, msg, m, { mentions: [sender, proposee] });
        }

        // --- ACEPTAR (.si) ---
        if (isAccept) {
            const data = confirmation[sender];
            if (!data) return;

            const now = Date.now();
            marriages[data.proposer] = { partner: sender, date: now };
            marriages[sender] = { partner: data.proposer, date: now };
            saveMarriages();

            clearTimeout(data.timeout);
            delete confirmation[sender];
            delete proposals[data.proposer];

            return conn.reply(m.chat, `𓄿 ─── ✦ ─── 𓄿\n💍 *𝐋𝐀𝐙𝐎 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐎*\n\n🌌 Han unido sus caminos bajo la luna roja.\n𓄿 ─── ✦ ─── 𓄿`, m);
        }

        // --- OTROS COMANDOS (RECHAZAR, DIVORCIO, PARTNER) ---
        if (isReject && confirmation[sender]) {
            clearTimeout(confirmation[sender].timeout);
            delete proposals[confirmation[sender].proposer];
            delete confirmation[sender];
            return conn.reply(m.chat, '🐍 *Rechazado... No eres digno de este lazo.*', m);
        }

        if (isDivorce) {
            if (!userIsMarried(sender)) throw new Error('No tienes lazos que romper.');
            const partner = marriages[sender].partner;
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages();
            return conn.reply(m.chat, `🗡️ El lazo se ha cortado. El odio es el único camino ahora.`, m);
        }

        if (isPartner) {
            if (!userIsMarried(sender)) throw new Error('Caminas solo en la oscuridad.');
            const info = marriages[sender];
            const days = Math.floor((Date.now() - info.date) / (1000 * 60 * 60 * 24));
            return conn.reply(m.chat, `🦇 Tu compañero: @${info.partner.split('@')[0]}\n⌛ Tiempo: *${days}* días.`, m, { mentions: [info.partner] });
        }

    } catch (e) {
        conn.reply(m.chat, `⚙️ *Error:* ${e.message}`, m);
    }
};

handler.help = ['marry', 'divorce', 'partner', 'si', 'no', 'marrylist'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'partner', 'si', 'no', 'marrylist'];
handler.group = true;

export default handler;
