import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 
const confirmation = {};

function loadMarriages() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });
    // Estructura: { userJid: { partner: jid, date: timestamp } }
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const userIsMarried = (user) => Object.hasOwn(marriages, user);

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
                const partner = data.partner;

                // Solo mostrar si ambos están en el grupo y no se han listado ya
                if (groupParticipants.includes(user) && groupParticipants.includes(partner) && !listed.has(user) && !listed.has(partner)) {
                    listed.add(user);
                    listed.add(partner);

                    const startTime = data.date;
                    const days = Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24));
                    const dateStr = new Date(startTime).toLocaleDateString('es-ES');

                    text += `*${count}.* @${user.split('@')[0]} ⚔️ @${partner.split('@')[0]}\n`;
                    text += `   ╰ 📅 *Fecha:* ${dateStr} (${days} días)\n\n`;
                    count++;
                }
            }

            if (count === 1) text += `_No hay lazos formados en este sector._ 🌌`;
            return conn.reply(m.chat, text, m, { mentions: Array.from(listed) });
        }

        // --- LÓGICA PARA PROPONER (.marry) ---
        if (isPropose) {
            const proposee = m.quoted?.sender;
            const proposer = sender;

            if (!proposee) {
                if (userIsMarried(proposer)) {
                    return await conn.reply(m.chat, `🦅 Ya caminas junto a *${conn.getName(marriages[proposer].partner)}*\n> Usa *.divorce* para romper los lazos. ⛓️‍💥`, m);
                }
                throw new Error('Debes marcar a alguien para proponerle un pacto eterno.');
            }

            if (proposer === proposee) throw new Error('No puedes restaurar tu clan contigo mismo.');
            if (userIsMarried(proposer)) throw new Error(`Ya tienes un lazo formado.`);
            if (userIsMarried(proposee)) throw new Error(`Esa persona ya pertenece a otro clan.`);
            if (proposals[proposer]) throw new Error('Ya enviaste tu propuesta. Ten paciencia.');

            proposals[proposer] = proposee;
            confirmation[proposee] = {
                proposer,
                timeout: setTimeout(() => {
                    if (confirmation[proposee]) {
                        conn.sendMessage(m.chat, { text: '🌑 El tiempo se ha agotado... Las sombras consumieron la propuesta. 🥀' }, { quoted: m });
                        delete confirmation[proposee];
                        delete proposals[proposer];
                    }
                }, 60000)
            };

            const confirmationMessage = `   ♱ ──── 𓆩 🍷 𓆪 ──── ♱\n    *𝐏𝐑𝐎𝐏𝐔𝐄𝐒𝐓𝐀 𝐃𝐄 𝐋𝐀𝐙𝐎*\n\n🐈‍⬛ \`${conn.getName(proposer)}\` quiere restaurar su clan contigo, \`${conn.getName(proposee)}\`\n\n¿Aceptarás este destino?\n\n      🌑 𝐒𝐇𝐀𝐑𝐈𝐍𝐆𝐀𝐍 𝐄𝐘𝐄𝐒 🌑\n         ╔════╦════╗\n         ║  .si  ║  .no ║\n         ╚════╩════╝\n> Tienes 60 segundos.`;
            return await conn.reply(m.chat, confirmationMessage, m);
        }

        // --- LÓGICA PARA ACEPTAR (.si) ---
        if (isAccept) {
            if (!confirmation[sender]) return; 
            const { proposer, timeout } = confirmation[sender];

            const now = Date.now();
            marriages[proposer] = { partner: sender, date: now };
            marriages[sender] = { partner: proposer, date: now };
            saveMarriages();

            clearTimeout(timeout);
            delete confirmation[sender];
            delete proposals[proposer];

            return conn.sendMessage(m.chat, {
                text: `𓄿 ─── ✦ ─── 𓄿\n💍 *𝐋𝐀𝐙𝐎 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐎*\n\n🌌 Han unido sus caminos bajo la luna roja.\n\n*¡Un nuevo poder ha nacido!*\n𓄿 ─── ✦ ─── 𓄿`
            }, { quoted: m });
        }

        // --- RECHAZAR, DIVORCIO Y PARTNER ---
        if (isReject) {
            if (!confirmation[sender]) return;
            const { proposer, timeout } = confirmation[sender];
            clearTimeout(timeout);
            delete confirmation[sender];
            delete proposals[proposer];
            return conn.sendMessage(m.chat, { text: '🐍 *Has caído en un genjutsu... propuesta rechazada.*' }, { quoted: m });
        }

        if (isDivorce) {
            if (!userIsMarried(sender)) throw new Error('No tienes lazos que romper.');
            const partner = marriages[sender].partner;
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages();
            return await conn.reply(m.chat, `🗡️ El lazo se ha cortado. Ahora son extraños de nuevo.`, m);
        }

        if (isPartner) {
            if (!userIsMarried(sender)) throw new Error('Caminas solo en la oscuridad.');
            const data = marriages[sender];
            const days = Math.floor((Date.now() - data.date) / (1000 * 60 * 60 * 24));
            return await conn.reply(m.chat, `🦇 Tu compañero es *${conn.getName(data.partner)}*\n\nLlevan unidos *${days}* días.`, m);
        }

    } catch (error) {
        await conn.reply(m.chat, `⚙️ *Error:* ${error.message}`, m);
    }
};

handler.tags = ['fun'];
handler.help = ['marry', 'divorce', 'partner', 'si', 'no', 'marrylist'];
handler.command = ['marry', 'divorce', 'partner', 'si', 'no', 'marrylist'];
handler.group = true;

export default handler;
