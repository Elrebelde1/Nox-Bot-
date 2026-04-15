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
    const sender = m.sender;

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 [ ERROR ] ➔ Responde al mensaje de alguien para proponer un vínculo.*');
        if (proposee === sender) return m.reply('*🤨 No puedes sellar un vínculo contigo mismo.*');
        if (userIsMarried(sender)) return m.reply(`*⚠️ Ya estás unido a:* ${conn.getName(marriages[sender])}`);
        if (userIsMarried(proposee)) return m.reply(`*⚠️ Esa persona ya tiene un destino sellado.*`);

        proposals[sender] = proposee;

        const confirmationMessage = `
*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*

*👤 @${sender.split`@`[0]}* solicita un vínculo con *@${proposee.split`@`[0]}*.

¿Aceptas unir tu destino en este matrimonio virtual? 💍

*💕✨  𝗥𝗘𝗦𝗣𝗢𝗡𝗗𝗘𝗥   ✨💕*
> Responde a este mensaje con:
> *Acepto* (Para confirmar)
> *No* (Para rechazar)

*⌛ Tienes 60 segundos.*
*Barboza Bot*`.trim();

        const sentMsg = await conn.reply(m.chat, confirmationMessage, m, { mentions: [sender, proposee] });

        confirmation[proposee] = {
            proposer: sender,
            msgId: sentMsg.key.id,
            timeout: setTimeout(() => {
                if (confirmation[proposee]) {
                    conn.sendMessage(m.chat, { text: '*⏰ Tiempo agotado. El vínculo no se concretó.*\n\n> Barboza Bot' }, { quoted: sentMsg });
                    delete confirmation[proposee];
                    delete proposals[sender];
                }
            }, 60000)
        };
    }

    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes ningún vínculo que romper.*');
        const partner = marriages[sender];
        delete marriages[sender];
        delete marriages[partner];
        saveMarriages();
        return m.reply(`*🌑 Vínculo roto:* Ahora ambos son libres.\n\n> Barboza Bot`);
    }

    if (/^partner|pareja$/i.test(command)) {
        const target = m.mentionedJid[0] || m.quoted?.sender || sender;
        if (!userIsMarried(target)) return m.reply(`*👤 @${target.split`@`[0]} camina en soledad.*`, null, { mentions: [target] });
        return m.reply(`*💍 @${target.split`@`[0]} está unido a @${marriages[target].split`@`[0]}*`, null, { mentions: [target, marriages[target]] });
    }
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys) return;
    if (!confirmation[m.sender]) return;

    const { proposer, timeout, msgId } = confirmation[m.sender];
    
    if (m.quoted.id !== msgId) return;

    const txt = m.text.trim().toLowerCase();

    // --- RESPUESTA: NO ---
    if (/^no$/i.test(txt)) {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];
        return conn.reply(m.chat, '*💔 Vínculo rechazado.* El destino ha sido negado.', m);
    }

    // --- RESPUESTA: ACEPTO ---
    if (/^acepto$/i.test(txt)) {
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages();

        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];

        const winTxt = `*─── [ 💍 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ───*\n\n🎊 *@${proposer.split`@`[0]}* y *@${m.sender.split`@`[0]}* han aceptado unir sus caminos 💞\n\n> *Que nadie se interponga en su destino.*\n> *Barboza Bot*`;
        
        return conn.sendMessage(m.chat, { text: winTxt, mentions: [proposer, m.sender] }, { quoted: m });
    }
};

handler.help = ['marry', 'divorce', 'partner'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'partner', 'pareja'];
handler.group = true;

export default handler;
