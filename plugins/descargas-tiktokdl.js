import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 

function loadMarriages() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });
    const raw = fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    return raw;
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const userIsMarried = (user) => !!marriages[user];

const handler = async (m, { conn, command, text }) => {
    const sender = m.sender;

    // --- COMANDO: MARRY ---
    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
        if (!proposee) return m.reply('*🐍 Etiqueta o responde a alguien para proponer un vínculo.*');
        if (proposee === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*');
        if (userIsMarried(sender)) return m.reply(`*⚠️ Ya estás unido a:* ${conn.getName(marriages[sender])}`);
        if (userIsMarried(proposee)) return m.reply(`*⚠️ Esa persona ya está casada con:* ${conn.getName(marriages[proposee])}`);

        proposals[proposee] = sender;

        let txt = `*─── [ 💍 𝓑𝓐𝓡𝓑𝓞𝓩𝓐 - 𝓑𝓞𝓓𝓐 ] ───*\n\n`;
        txt += `*👤 @${sender.split`@`[0]}* le ha pedido matrimonio a *@${proposee.split`@`[0]}*.\n\n`;
        txt += `*¿Aceptas sellar tu destino?*\n\n`;
        txt += `> *⚠️ Para aceptar responde con: .si*\n`;
        txt += `> *⚠️ Para rechazar responde con: .no*\n\n`;
        txt += `*⌛ Tienes 60 segundos.*`;

        return conn.reply(m.chat, txt, m, { mentions: [sender, proposee] });
    }

    // --- COMANDO: SI (Aceptar) ---
    if (/^si$/i.test(command)) {
        if (!proposals[sender]) return; // Si no tiene propuestas, no hace nada
        
        const proposer = proposals[sender];
        marriages[sender] = proposer;
        marriages[proposer] = sender;
        saveMarriages();
        delete proposals[sender];

        let win = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 𝓢𝓔𝓛𝓛𝓐𝓓𝓞 ] ───*\n\n`;
        win += `🎊 *@${proposer.split`@`[0]}* y *@${sender.split`@`[0]}* ahora están casados.\n\n`;
        win += `> *Felicidades por su nueva vida.* ✨\n\n`;
        win += `> *Barboza Bot*`;

        return conn.sendMessage(m.chat, { text: win, mentions: [proposer, sender] }, { quoted: m });
    }

    // --- COMANDO: NO (Rechazar) ---
    if (/^no$/i.test(command)) {
        if (!proposals[sender]) return;
        const proposer = proposals[sender];
        delete proposals[sender];
        return m.reply(`*💔 Vínculo rechazado.* *@${sender.split`@`[0]}* ha decidido seguir solo.`, null, { mentions: [sender] });
    }

    // --- COMANDO: DIVORCE ---
    if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*⚠️ No tienes a nadie de quien divorciarte.*');
        const partner = marriages[sender];
        delete marriages[sender];
        delete marriages[partner];
        saveMarriages();
        return m.reply(`*🌑 Vínculo roto.* Ahora ambos son libres.\n\n> *Barboza Bot*`);
    }

    // --- COMANDO: PARTNER ---
    if (/^partner|pareja$/i.test(command)) {
        const target = m.mentionedJid[0] || m.quoted?.sender || sender;
        if (!userIsMarried(target)) return m.reply(`*👤 @${target.split`@`[0]} camina en soledad.*`, null, { mentions: [target] });
        return m.reply(`*💍 @${target.split`@`[0]} está unido a @${marriages[target].split`@`[0]}*`, null, { mentions: [target, marriages[target]] });
    }
};

handler.help = ['marry', 'si', 'no', 'divorce', 'partner'];
handler.tags = ['fun'];
handler.command = ['marry', 'si', 'no', 'divorce', 'partner', 'pareja'];
handler.group = true;

export default handler;
