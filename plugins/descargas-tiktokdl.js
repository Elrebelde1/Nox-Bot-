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

            if (proposer === proposee) throw new Error('No puedes casarte contigo mismo.');
            if (userIsMarried(proposer)) throw new Error(`Ya estás unido a *${conn.getName(marriages[proposer])}*.\nRompe ese lazo antes.`);
            if (userIsMarried(proposee)) throw new Error(`_${conn.getName(proposee)}_ ya tiene un destino con *${conn.getName(marriages[proposee])}*.`);
            if (proposals[proposer]) throw new Error('Ya has enviado una propuesta. Espera.');
            if (confirmation[proposee]) throw new Error(`Esa persona ya tiene una propuesta pendiente.`);

            proposals[proposer] = proposee;

            const proposerName = conn.getName(proposer);
            const proposeeName = conn.getName(proposee);
            const confirmationMessage = `
       :¨ ·.· ¨:  ﹏﹏﹏🜲﹏﹏﹏   :¨ ·.· ¨:
        "·.. 𝐏𝐫𝐨𝐩𝐮𝐞𝐬𝐭𝐚 𝐝' 𝐦𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨 ..·"

💕 \`${proposerName}\` solicita un vínculo con \`${proposeeName}\` 💕

¿Aceptas unir tu destino en este matrimonio virtual? 💍

 💕✨  𝗥𝗘𝗦𝗣𝗢𝗡𝗗𝗘𝗥   ✨💕
         ╔════╦════╗
         ║   𝘀𝗶   ║   𝗻𝗼  ║
         ╚════╩════╝
> RESPONDE a este mensaje para confirmar.
> Barboza Bot`;

            const sentMsg = await conn.reply(m.chat, confirmationMessage, m, { mentions: [proposer, proposee] });

            confirmation[proposee] = {
                proposer,
                msgId: sentMsg.key.id,
                timeout: setTimeout(() => {
                    if (confirmation[proposee]) {
                        conn.sendMessage(m.chat, { text: '*⏰ Tiempo agotado. El destino ha decidido que no habrá vínculo.*\n\n> Barboza Bot' }, { quoted: sentMsg });
                        delete confirmation[proposee];
                        delete proposals[proposer];
                    }
                }, 60000)
            };

        } else if (isDivorce) {
            if (!userIsMarried(sender)) throw new Error('No estás casado con nadie.');
            const partner = marriages[sender];
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages();
            await conn.reply(m.chat, `*🌑 Vínculo roto:* _${conn.getName(sender)}_ y _${conn.getName(partner)}_ se han divorciado.\n\n> Barboza Bot`, m);

        } else if (isPartner) {
            if (!userIsMarried(sender)) throw new Error('Caminas en soledad.');
            return await conn.reply(m.chat, `*📜 Tu destino está sellado con:* _${conn.getName(marriages[sender])}_`, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `*🐍 [ 𝓢𝓐𝓢𝓤𝓚𝓔 ] ➔* ${error.message}`, m);
    }
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys) return;
    if (!confirmation[m.sender]) return;

    const { proposer, timeout, msgId } = confirmation[m.sender];
    
    // Solo procesar si responden al mensaje exacto de la propuesta
    if (m.quoted.id !== msgId) return;

    const txt = m.text.trim().toLowerCase();

    if (/^(no)$/i.test(txt)) {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];
        return conn.reply(m.chat, '*💔 El vínculo fue rechazado por el usuario.*', m);
    }

    if (/^(si|sí)$/i.test(txt)) {
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages();

        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];

        const winTxt = `*─── [ 💍 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ───*\n\n🎊 *@${proposer.split`@`[0]}* y *@${m.sender.split`@`[0]}* han aceptado unir sus destinos 💞\n\n¡Felicidades por este nuevo vínculo!\n\n> Barboza Bot`;
        
        return conn.sendMessage(m.chat, { text: winTxt, mentions: [proposer, m.sender] }, { quoted: m });
    }
};

handler.tags = ['fun'];
handler.help = ['marry', 'divorce', 'partner'];
handler.command = ['marry', 'divorce', 'partner'];
handler.group = true;

export default handler;
