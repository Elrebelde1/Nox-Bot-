import fs from 'fs';
import path from 'path';

// Asegurar que el directorio existe
const dir = path.resolve('storage/databases');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const marriagesFile = path.join(dir, 'marry.json');
let marriages = loadMarriages();
const confirmation = {};

function loadMarriages() {
    try {
        return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    } catch (e) {
        return {};
    }
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const handler = async (m, { conn, command, text }) => {
    const isPropose = /^marry$/i.test(command);
    const isDivorce = /^divorce$/i.test(command);
    const userIsMarried = (user) => marriages[user] !== undefined;

    if (isPropose) {
        const proposer = m.sender;
        const proposee = m.mentionedJid?.[0] || m.quoted?.sender;
        const botJid = conn.user.jid;

        if (!proposee) {
            if (userIsMarried(proposer)) {
                return await conn.reply(m.chat, `《✧》 Ya estás casado con *${conn.getName(marriages[proposer])}*\n> Puedes divorciarte con: *#divorce*`, m);
            }
            return await conn.reply(m.chat, `Debes mencionar a alguien.\n> Ejemplo: *#marry @usuario*`, m);
        }

        if (userIsMarried(proposer)) return await conn.reply(m.chat, `《✧》 Ya estás casado con *${conn.getName(marriages[proposer])}*.`, m);
        if (userIsMarried(proposee)) return await conn.reply(m.chat, `《✧》 *${conn.getName(proposee)}* ya está casado(a).`, m);
        if (proposer === proposee) return await conn.reply(m.chat, `¡No puedes casarte contigo mismo!`, m);

        // --- RESPUESTA SI ES PARA EL BOT ---
        if (proposee === botJid) {
            const respuestas = ['si', 'no'];
            const decision = respuestas[Math.floor(Math.random() * respuestas.length)];
            await new Promise(res => setTimeout(res, 1500));

            if (decision === 'si') {
                marriages[proposer] = botJid;
                marriages[botJid] = proposer;
                saveMarriages();
                return conn.reply(m.chat, `¡Acepto casarme contigo! 💍✨\n\n*Esposo:* ${conn.getName(proposer)}\n*Esposa:* ${conn.getName(botJid)}`, m);
            } else {
                return conn.reply(m.chat, `Lo siento, pero solo te veo como un usuario... 💔 No acepto.`, m);
            }
        }

        // --- PROPUESTA A OTRO USUARIO ---
        confirmation[proposee] = {
            proposer,
            timeout: setTimeout(() => {
                conn.reply(m.chat, '*《✧》 Tiempo agotado (30s). Propuesta cancelada.*', m);
                delete confirmation[proposee];
            }, 30000) 
        };

        const confirmationMessage = `♡ @${proposer.split('@')[0]} le ha propuesto matrimonio a @${proposee.split('@')[0]}. 
¿Aceptas? •(=^●ω●^=)•

*Responde con:*
> ✐ "Si" para aceptar
> ✐ "No" para rechazar.`;

        await conn.reply(m.chat, confirmationMessage, m, { mentions: [proposee, proposer] });

    } else if (isDivorce) {
        if (!userIsMarried(m.sender)) return await conn.reply(m.chat, '《✧》 No estás casado con nadie.', m);

        const partner = marriages[m.sender];
        delete marriages[m.sender];
        delete marriages[partner];
        saveMarriages();

        await conn.reply(m.chat, `✐ ${conn.getName(m.sender)} y ${conn.getName(partner)} se han divorciado. 💔`, m);
    }
}

handler.before = async (m, { conn }) => {
    if (m.isBaileys || !m.text) return;
    
    const txt = m.text.trim().toLowerCase();
    if (!(m.sender in confirmation)) return;

    const { proposer, timeout } = confirmation[m.sender];

    if (txt === 'no') {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        return await conn.reply(m.chat, '*《✧》 Han rechazado tu propuesta de matrimonio.*', m);
    }

    if (txt === 'si' || txt === 'sí') {
        clearTimeout(timeout);
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages();

        const successMsg = `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩
¡Se han Casado! ฅ^•ﻌ•^ฅ*:･ﾟ✧

*•.¸♡ Esposo:* ${conn.getName(proposer)}
*•.¸♡ Esposa:* ${conn.getName(m.sender)}

\`Disfruten de su luna de miel\`
✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`;

        await conn.reply(m.chat, successMsg, m, { mentions: [proposer, m.sender] });
        delete confirmation[m.sender];
    }
};

handler.tags = ['fun'];
handler.help = ['marry *@usuario*', 'divorce'];
handler.command = ['marry', 'divorce'];
handler.group = true;

export default handler;
