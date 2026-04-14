import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 
const confirmation = {};

function loadMarriages() {
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

    try {
        const sender = m.sender;

        if (isPropose) {
            // 🔹 Solo responder al mensaje, sin @
            const proposee = m.quoted?.sender;
            const proposer = sender;

            if (!proposee) {
                if (userIsMarried(proposer)) {
                    return await conn.reply(m.chat,`🫰Ya estás casado con *${conn.getName(marriages[proposer])}*\n> Usa *.divorce* para terminar el matrimonio.💔`, m);
                } else {
                    throw new Error('*Debes responder al mensaje de alguien para proponer matrimonio.*\n\n> Ejemplo: *.marry* respondiendo al mensaje.');
                }
            }

            if (proposer === proposee) throw new Error('No puedes casarte contigo mismo.');
            if (userIsMarried(proposer)) throw new Error(`Ya estás casado con *${conn.getName(marriages[proposer])}.*\n> Usa .divorce para romper el matrimonio.💔`);
            if (userIsMarried(proposee)) throw new Error(`${conn.getName(proposee)} ya está casado con *${conn.getName(marriages[proposee])}*.`);
            if (proposals[proposer]) throw new Error('Ya hiciste una propuesta. Espera a que te respondan.');
            if (confirmation[proposee]) throw new Error(`${conn.getName(proposee)} ya tiene una propuesta pendiente.`);
            if (proposals[proposee] === proposer) throw new Error(`${conn.getName(proposee)} ya te propuso matrimonio. Responde su propuesta primero.`);

            proposals[proposer] = proposee;

            const proposerName = conn.getName(proposer);
            const proposeeName = conn.getName(proposee);
            const confirmationMessage = `
       :¨ ·.· ¨:  ﹏﹏﹏🜲﹏﹏﹏   :¨ ·.· ¨:
        "·.. 𝐏𝐫𝐨𝐩𝐮𝐞𝐬𝐭𝐚 𝐝' 𝐦𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨 ..·"

💕 \`${proposerName}\` Ha declarado su amor por \`${proposeeName}\` 💕

Y quiere consumar este amor con un matrimonio virtual🥺
> Más cacho que amor...


 💕✨  𝗥𝗘𝗦𝗣𝗢𝗡𝗗𝗘𝗥   ✨💕
         ╔════╦════╗
         ║   𝘀𝗶   ║   𝗻𝗼  ║
         ╚════╩════╝
> No es necesario usar prefix (osea . )`;
            await conn.reply(m.chat, confirmationMessage, m);

            confirmation[proposee] = {
                proposer,
                timeout: setTimeout(() => {
                    conn.sendMessage(m.chat, { text: '⏰ Tiempo agotado. La propuesta de matrimonio fue cancelada.🥲\n\n> soldado caído 💔\n\n> Jota Bot' }, { quoted: m });
                    delete confirmation[proposee];
                    delete proposals[proposer];
                }, 60000)
            };

        } else if (isDivorce) {
            if (!userIsMarried(sender)) throw new Error('No estás casado con nadie.');

            const partner = marriages[sender];
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages();

            await conn.reply(m.chat, `💔 ${conn.getName(sender)} y ${conn.getName(partner)} se han divorciado.
> se dió cuenta que le eran infiel 😅`, m);

        } else if (isPartner) {
            if (!userIsMarried(sender)) throw new Error('No estás casado con nadie.');
            return await conn.reply(m.chat, `💞 Estás casado con *${conn.getName(marriages[sender])}*`, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `🐼 ${error.message}`, m);
    }
};

handler.before = async (m) => {
    if (m.isBaileys) return;
    if (!confirmation[m.sender]) return;
    if (!m.text) return;

    const { proposer, timeout } = confirmation[m.sender];

    if (/^no$/i.test(m.text)) {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];
        return conn.sendMessage(m.chat, { text: '💔 *Han rechazado tu propuesta de matrimonio.*\n\n> Así de fex estás, ni modo yo te invito el primer trago.' }, { quoted: m });
    }

    if (/^si$/i.test(m.text)) {
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages();

        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];

        conn.sendMessage(m.chat, {
            text: `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n💍 *¡Boda Confirmada!*\n\n🎊 ${conn.getName(proposer)} y ${conn.getName(m.sender)} ahora están felizmente casados 💞\n\n¡Felicidades a la nueva pareja!\n✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n\n> Jota Bot`
        }, { quoted: m });
    }
};

handler.tags = ['fun'];
handler.help = ['marry', 'divorce', 'partner'];
handler.command = ['marry', 'divorce', 'partner'];
handler.group = true;

export default handler;