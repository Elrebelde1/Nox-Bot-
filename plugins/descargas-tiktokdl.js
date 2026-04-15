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
            const proposee = m.quoted?.sender;
            const proposer = sender;

            if (!proposee) {
                if (userIsMarried(proposer)) {
                    return await conn.reply(m.chat,`*🐍 Ya posees un vínculo activo con:* _${conn.getName(marriages[proposer])}_\n\n> Usa *.divorce* si deseas romper el lazo.`, m);
                } else {
                    throw new Error('*Debes responder al mensaje de alguien para proponer un vínculo.*');
                }
            }

            if (proposer === proposee) throw new Error('No puedes sellar un vínculo contigo mismo.');
            if (userIsMarried(proposer)) throw new Error(`Ya estás unido a *${conn.getName(marriages[proposer])}*.\nRompe ese lazo antes de intentar otro.`);
            if (userIsMarried(proposee)) throw new Error(`_${conn.getName(proposee)}_ ya tiene un destino sellado con *${conn.getName(marriages[proposee])}*.`);
            if (proposals[proposer]) throw new Error('Ya has enviado una propuesta. Espera en silencio.');
            if (confirmation[proposee]) throw new Error(`Esa persona ya tiene una propuesta pendiente de alguien más.`);
            if (proposals[proposee] === proposer) throw new Error(`Esa persona ya te propuso un vínculo. Responde a su mensaje primero.`);

            proposals[proposer] = proposee;

            const proposerName = conn.getName(proposer);
            const proposeeName = conn.getName(proposee);
            const confirmationMessage = `
       :¨ ·.· ¨:  ﹏﹏﹏🜲﹏﹏﹏   :¨ ·.· ¨:
        "·.. 𝐏𝐫𝐨𝐩𝐮𝐞𝐬𝐭𝐚 𝐝' 𝐦𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨 ..·"

💕 \`${proposerName}\` Ha declarado su amor por \`${proposeeName}\` 💕

Y quiere consumar este amor con un matrimonio virtual 💍
> Más cacho que amor...


 💕✨  𝗥𝗘𝗦𝗣𝗢𝗡𝗗𝗘𝗥   ✨💕
         ╔════╦════╗
         ║   𝘀𝗶   ║   𝗻𝗼  ║
         ╚════╩════╝
> No es necesario usar prefix (osea . )
> Barboza Bot`;
            await conn.reply(m.chat, confirmationMessage, m);

            confirmation[proposee] = {
                proposer,
                timeout: setTimeout(() => {
                    conn.sendMessage(m.chat, { text: '*⏰ Tiempo agotado. El destino ha decidido que no habrá vínculo.*\n\n> Soldado caído 💔\n\n> Barboza Bot' }, { quoted: m });
                    delete confirmation[proposee];
                    delete proposals[proposer];
                }, 60000)
            };

        } else if (isDivorce) {
            if (!userIsMarried(sender)) throw new Error('No caminas junto a nadie actualmente.');

            const partner = marriages[sender];
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages();

            await conn.reply(m.chat, `*🌑 Vínculo roto:* _${conn.getName(sender)}_ y _${conn.getName(partner)}_ se han divorciado.\n> Se dio cuenta que le eran infiel 😅\n\n> Barboza Bot`, m);

        } else if (isPartner) {
            if (!userIsMarried(sender)) throw new Error('Caminas en soledad.');
            return await conn.reply(m.chat, `*📜 Tu destino está sellado con:* _${conn.getName(marriages[sender])}_`, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `*🐍 [ 𝓢𝓐𝓢𝓤𝓚𝓔 ] ➔* ${error.message}`, m);
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
        return conn.sendMessage(m.chat, { text: '*💔 El vínculo fue rechazado.*\n\n> Así de fex estás, ni modo yo te invito el primer trago.\n\n> Barboza Bot' }, { quoted: m });
    }

    if (/^si$/i.test(m.text)) {
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages();

        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];

        conn.sendMessage(m.chat, {
            text: `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n💍 *¡Boda Confirmada!*\n\n🎊 ${conn.getName(proposer)} y ${conn.getName(m.sender)} ahora están felizmente casados 💞\n\n¡Felicidades a la nueva pareja!\n✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n\n> Barboza Bot`
        }, { quoted: m });
    }
};

handler.tags = ['fun'];
handler.help = ['marry', 'divorce', 'partner'];
handler.command = ['marry', 'divorce', 'partner'];
handler.group = true;

export default handler;
