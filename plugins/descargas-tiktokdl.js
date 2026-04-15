import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.json'); // Cambiado a .json para evitar errores de lectura

// Función para cargar matrimonios
function loadMarriages() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
}

// Función para guardar matrimonios
function saveMarriages(data) {
    fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));
}

let proposals = {}; 
let confirmation = {};

const handler = async (m, { conn, command }) => {
    let marriages = loadMarriages();
    const sender = m.sender;
    const userIsMarried = (user) => Object.hasOwn(marriages, user);

    if (/^marry$/i.test(command)) {
        const proposee = m.quoted?.sender;
        const proposer = sender;

        if (!proposee) {
            if (userIsMarried(proposer)) {
                return await conn.reply(m.chat, `*Hmp... Ya estás atado a un vínculo con ${conn.getName(marriages[proposer])}.*\n> No rompas el contrato tan fácilmente.`, m);
            }
            return m.reply('*Mira a los ojos de tu objetivo (responde a su mensaje) para proponerle matrimonio.*');
        }

        if (proposer === proposee) return m.reply('*¿Crees que el amor propio es suficiente para un Sharingan? No puedes casarte contigo mismo.*');
        if (userIsMarried(proposer)) return m.reply(`*Ya posees un vínculo con ${conn.getName(marriages[proposer])}. Corta ese hilo antes de buscar otro.*`);
        if (userIsMarried(proposee)) return m.reply(`*Esa persona ya está bajo el Genjutsu matrimonial de ${conn.getName(marriages[proposee])}.*`);
        if (confirmation[proposee]) return m.reply('*Ya hay una oferta sobre la mesa para esa persona. Espera.*');

        confirmation[proposee] = {
            proposer,
            timeout: setTimeout(() => {
                conn.reply(m.chat, `*⌛ El tiempo se ha agotado...*\n\nLa propuesta de @${proposer.split('@')[0]} se ha desvanecido en las sombras.`, m, { mentions: [proposer] });
                delete confirmation[proposee];
            }, 60000)
        };

        const proposerName = conn.getName(proposer);
        const proposeeName = conn.getName(proposee);
        
        const confirmationMessage = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 𝓤𝓒𝓗𝓘𝓗𝓐 ] ───*\n\n*👤 ${proposerName}* quiere restaurar su clan contigo, *${proposeeName}*.\n\n¿Aceptarás este camino de ninja o lo rechazarás?\n\n> *Escribe:* "si" o "no" para responder.\n\n*“La oscuridad es el único lugar donde puedo estar... ¿vienes conmigo?”*`;
        
        await conn.reply(m.chat, confirmationMessage, m, { mentions: [proposer, proposee] });

    } else if (/^divorce$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*No tienes ningún vínculo que romper. Eres un ninja errante.*');

        const partner = marriages[sender];
        delete marriages[sender];
        delete marriages[partner];
        saveMarriages(marriages);

        await conn.reply(m.chat, `*🌑 El vínculo se ha roto...*\n\n@${sender.split('@')[0]} y @${partner.split('@')[0]} ahora son extraños de nuevo. El camino de la venganza sigue solo.`, m, { mentions: [sender, partner] });

    } else if (/^partner$/i.test(command)) {
        if (!userIsMarried(sender)) return m.reply('*Caminas solo en las sombras... No tienes pareja.*');
        return await conn.reply(m.chat, `*♾️ Tu destino está unido a:* ${conn.getName(marriages[sender])}`, m);
    }
};

// --- GESTOR DE RESPUESTAS (CORREGIDO) ---
handler.before = async (m, { conn }) => {
    if (m.isBaileys || !m.text) return;
    if (!confirmation[m.sender]) return;

    const { proposer, timeout } = confirmation[m.sender];
    const txt = m.text.toLowerCase().trim();

    if (txt === 'no') {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        return conn.reply(m.chat, `*💔 Has rechazado el vínculo.* \n\n"Tal como pensé... no eres lo suficientemente fuerte para estar a mi lado".`, m);
    }

    if (txt === 'si' || txt === 'sí') {
        let marriages = loadMarriages();
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages(marriages);

        clearTimeout(timeout);
        delete confirmation[m.sender];

        const bodaMsg = `*─── [ 🎊 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ───*\n\n*⚡ ¡El vínculo ha sido sellado!*\n\n@${proposer.split('@')[0]} y @${m.sender.split('@')[0]} han unido sus caminos.\n\n*"Cargaré con todo tu odio y moriremos juntos... o viviremos como esposos."*\n\n*¡Felicidades!* 💍`;
        
        return conn.reply(m.chat, bodaMsg, m, { mentions: [proposer, m.sender] });
    }
};

handler.tags = ['fun'];
handler.help = ['marry', 'divorce', 'partner'];
handler.command = ['marry', 'divorce', 'partner'];
handler.group = true;

export default handler;
