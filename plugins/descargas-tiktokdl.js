import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 
const confirmation = {};

function loadMarriages() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });
    const raw = fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    const valid = {};
    for (const user in raw) {
        const partner = raw[user];
        if (raw[partner] === user) valid[user] = partner;
    }
    return valid;
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const userIsMarried = (user) => Object.hasOwn(marriages, user);

const handler = async (m, { conn, command }) => {
    const isPropose = /^marry$/i.test(command);
    const isDivorce = /^divorce$/i.test(command);
    const isPartner = /^partner$/i.test(command);
    const isAccept = /^si$/i.test(command);
    const isReject = /^no$/i.test(command);

    try {
        const sender = m.sender;

        // --- LÓGICA PARA PROPONER (.marry) ---
        if (isPropose) {
            const proposee = m.quoted?.sender;
            const proposer = sender;

            if (!proposee) {
                if (userIsMarried(proposer)) {
                    return await conn.reply(m.chat, `🦅 Ya caminas junto a *${conn.getName(marriages[proposer])}*\n> Usa *.divorce* para romper los lazos. ⛓️‍💥`, m);
                }
                throw new Error('Debes marcar a alguien para proponerle un pacto eterno.');
            }

            if (proposer === proposee) throw new Error('No puedes restaurar tu clan contigo mismo.');
            if (userIsMarried(proposer)) throw new Error(`Ya tienes un lazo formado con *${conn.getName(marriages[proposer])}.*`);
            if (userIsMarried(proposee)) throw new Error(`${conn.getName(proposee)} ya pertenece a otro clan.`);
            if (proposals[proposer]) throw new Error('Ya enviaste tu propuesta. Ten paciencia.');
            if (confirmation[proposee]) throw new Error(`${conn.getName(proposee)} está decidiendo otro destino ahora mismo.`);

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

            const confirmationMessage = `
       ♱ ──── 𓆩 🍷 𓆪 ──── ♱
        *𝐏𝐑𝐎𝐏𝐔𝐄𝐒𝐓𝐀 𝐃𝐄 𝐋𝐀𝐙𝐎*

🐈‍⬛ \`${conn.getName(proposer)}\` quiere restaurar su clan contigo, \`${conn.getName(proposee)}\`

¿Aceptarás este destino o seguirás tu propio camino?

      🌑 𝐒𝐇𝐀𝐑𝐈𝐍𝐆𝐀𝐍 𝐄𝐘𝐄𝐒 🌑
         ╔════╦════╗
         ║  .si  ║  .no ║
         ╚════╩════╝
> Tienes 60 segundos antes de que el Susanoo desaparezca.`;
            return await conn.reply(m.chat, confirmationMessage, m);
        }

        // --- LÓGICA PARA ACEPTAR (.si) ---
        if (isAccept) {
            if (!confirmation[sender]) return; 
            const { proposer, timeout } = confirmation[sender];

            marriages[proposer] = sender;
            marriages[sender] = proposer;
            saveMarriages();

            clearTimeout(timeout);
            delete confirmation[sender];
            delete proposals[proposer];

            return conn.sendMessage(m.chat, {
                text: `𓄿 ─── ✦ ─── 𓄿\n💍 *𝐋𝐀𝐙𝐎 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐎*\n\n🌌 ${conn.getName(proposer)} y ${conn.getName(sender)} han unido sus caminos bajo la luna roja. 💞\n\n*¡Un nuevo poder ha nacido!*\n𓄿 ─── ✦ ─── 𓄿`
            }, { quoted: m });
        }

        // --- LÓGICA PARA RECHAZAR (.no) ---
        if (isReject) {
            if (!confirmation[sender]) return;
            const { proposer, timeout } = confirmation[sender];

            clearTimeout(timeout);
            delete confirmation[sender];
            delete proposals[proposer];

            return conn.sendMessage(m.chat, { text: '🐍 *Has caído en un genjutsu... la propuesta fue rechazada.*\n\n> "No eres lo suficientemente fuerte".' }, { quoted: m });
        }

        // --- LÓGICA PARA DIVORCIO (.divorce) ---
        if (isDivorce) {
            if (!userIsMarried(sender)) throw new Error('No tienes lazos que romper.');
            const partner = marriages[sender];
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages();
            return await conn.reply(m.chat, `🗡️ El lazo se ha cortado. *${conn.getName(sender)}* y *${conn.getName(partner)}* ahora son extraños de nuevo.`, m);
        }

        // --- LÓGICA PARA VER PAREJA (.partner) ---
        if (isPartner) {
            if (!userIsMarried(sender)) throw new Error('Caminas solo en la oscuridad.');
            return await conn.reply(m.chat, `🦇 Tu compañero de armas es *${conn.getName(marriages[sender])}*`, m);
        }

    } catch (error) {
        await conn.reply(m.chat, `⚙️ *Error:* ${error.message}`, m);
    }
};

handler.tags = ['fun'];
handler.help = ['marry', 'divorce', 'partner', 'si', 'no'];
handler.command = ['marry', 'divorce', 'partner', 'si', 'no'];
handler.group = true;

export default handler;
