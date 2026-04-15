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

    // --- [ COMANDO: MARRY ] ---
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

    // --- [ COMANDO: DIVORCE (ACTUALIZADO) ] ---
    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes ningún vínculo que romper.*');
        
        const partner = marriages[sender];
        
        // Eliminamos los datos de ambos
        delete marriages[sender];
        delete marriages[partner];
        saveMarriages();

        const divorceTxt = `*🌑 Vínculo roto:* Ahora ambos son libres.\n\n> *@${sender.split`@`[0]}* y *@${partner.split`@`[0]}* han terminado su compromiso.\n> *Barboza Bot*`;

        // Responde al mensaje actual y etiqueta a la ex-pareja
        return conn.sendMessage(m.chat, { 
            text: divorceTxt, 
            mentions: [sender, partner] 
        }, { quoted: m });
    }

    // --- [ COMANDO: PARTNER / PAREJA ] ---
    if (/^partner|pareja$/i.test(command)) {
        const target = m.mentionedJid[0] || m.quoted?.sender || sender;
        if (!userIsMarried(target)) return m.reply(`*👤 @${target.split`@`[0]} camina en soledad.*`, null, { mentions: [target] });
        return m.reply(`*💍 @${target.split`@`[0]} está unido a @${marriages[target].split`@`[0]}*`, null, { mentions: [target, marriages[target]] });
    }

    // --- [ COMANDO: MARRYLIST ] ---
    if (/^marrylist$/i.test(command)) {
        let couples = Object.entries(marriages);
        if (couples.length === 0) return m.reply('*😶 No hay vínculos registrados.*');
        let txt = `*─── [ 💘 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`;
        let seen = new Set();
        let count = 0;
        for (let [user, partner] of couples) {
            if (!seen.has(user) && !seen.has(partner)) {
                seen.add(user); seen.add(partner);
                count++;
                txt += `*${count}.* @${user.split`@`[0]} ⚔️ @${partner.split`@`[0]}\n`;
            }
        }
        txt += `\n*✨ Total:* ${count}\n*Barboza Bot*`;
        return conn.reply(m.chat, txt, m, { mentions: Array.from(seen) });
    }
};

handler.before = async (m) => {
    if (!m.text || !m.quoted || m.isBaileys) return;
    if (!confirmation[m.sender]) return;

    const { proposer, timeout, msgId } = confirmation[m.sender];
    if (m.quoted.id !== msgId) return;

    const txt = m.text.trim().toLowerCase();

    if (/^no$/i.test(txt)) {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];
        return conn.reply(m.chat, '*💔 Vínculo rechazado.* El destino ha sido negado.', m);
    }

    if (/^acepto$/i.test(txt)) {
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages();

        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];

        const winTxt = `*─── [ 💍 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ───*\n\n🎊 *@${proposer.split`@`[0]}* y *@${m.sender.split`@`[0]}* han aceptado unir sus caminos 💞\n\n> *Barboza Bot*`;
        return conn.sendMessage(m.chat, { text: winTxt, mentions: [proposer, m.sender] }, { quoted: m });
    }
};

handler.help = ['marry', 'divorce', 'partner', 'marrylist'];
handler.tags = ['fun'];
handler.command = ['marry', 'divorce', 'partner', 'pareja', 'marrylist'];
handler.group = true;

export default handler;
