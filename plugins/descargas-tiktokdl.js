import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry.js');
let marriages = loadMarriages();
let proposals = {}; 
const confirmation = {};

function loadMarriages() {
    if (!fs.existsSync(path.dirname(marriagesFile))) {
        fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });
    }
    const raw = fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
    return raw;
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const userIsMarried = (user) => Object.hasOwn(marriages, user);

const handler = async (m, { conn, command, usedPrefix }) => {
    const isPropose = /^(marry|casar)$/i.test(command);
    const isDivorce = /^(divorce|divorciar)$/i.test(command);
    const isPartner = /^(partner|pareja)$/i.test(command);

    try {
        const sender = m.sender;

        if (isPropose) {
            const proposee = m.quoted?.sender || m.mentionedJid?.[0];
            const proposer = sender;

            if (!proposee) {
                if (userIsMarried(proposer)) {
                    return await conn.reply(m.chat, `*💍 Ya estás unido a:* ${conn.getName(marriages[proposer])}\n> Usa *${usedPrefix}divorce* para romper el vínculo.`, m);
                }
                throw new Error('*Etiqueta o responde al mensaje de alguien para proponer matrimonio.*');
            }

            if (proposer === proposee) throw new Error('No puedes casarte contigo mismo.');
            if (userIsMarried(proposer)) throw new Error(`Ya tienes un vínculo activo con *${conn.getName(marriages[proposer])}*`);
            if (userIsMarried(proposee)) throw new Error(`*${conn.getName(proposee)}* ya está en un compromiso con otra persona.`);
            if (proposals[proposer]) throw new Error('Ya tienes una propuesta en curso. Espera respuesta.');

            proposals[proposer] = proposee;

            const confirmationMessage = `
       :¨ ·.· ¨:  ﹏﹏﹏🜲﹏﹏﹏   :¨ ·.· ¨:
        "·.. 𝐏𝐫𝐨𝐩𝐮𝐞𝐬𝐭𝐚 𝐝' 𝐦𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨 ..·"

💕 \`${conn.getName(proposer)}\` ha declarado su amor por \`${conn.getName(proposee)}\` 💕

¿Aceptas sellar este vínculo eterno?
> El destino espera tu palabra...

 💕✨  𝗥𝗘𝗦𝗣𝗢𝗡𝗗𝗘𝗥   ✨💕
       ╔══════╦══════╗
       ║  acepto  ║ rechazo  ║
       ╚══════╩══════╝
> Responde directamente a este mensaje.
> Sasuke Bot`;

            const weddingMsg = await conn.reply(m.chat, confirmationMessage, m, { mentions: [proposer, proposee] });

            confirmation[proposee] = {
                proposer,
                weddingMsgId: weddingMsg.key.id,
                timeout: setTimeout(() => {
                    conn.sendMessage(m.chat, { text: '⏰ *Tiempo agotado.* El destino no esperó por nadie.\n\n> Sasuke Bot' }, { quoted: m });
                    delete confirmation[proposee];
                    delete proposals[proposer];
                }, 60000)
            };

        } else if (isDivorce) {
            if (!userIsMarried(sender)) throw new Error('No tienes ningún vínculo que romper.');

            const partner = marriages[sender];
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages();

            await conn.reply(m.chat, `💔 *Vínculo roto:* ${conn.getName(sender)} y ${conn.getName(partner)} han disuelto su contrato.\n> Sasuke Bot`, m);

        } else if (isPartner) {
            if (!userIsMarried(sender)) throw new Error('Caminas en soledad. No estás casado.');
            return await conn.reply(m.chat, `💍 Tu compañero/a actual es: *${conn.getName(marriages[sender])}*`, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `⚠️ ${error.message}`, m);
    }
};

handler.before = async (m, { conn }) => {
    if (!m.text || m.isBaileys) return;
    if (!confirmation[m.sender]) return;

    const { proposer, timeout, weddingMsgId } = confirmation[m.sender];
    
    // Verificar que esté respondiendo al mensaje de la boda
    const cited = m.message.extendedTextMessage?.contextInfo?.stanzaId;
    if (cited !== weddingMsgId) return;

    const txt = m.text.toLowerCase().trim();

    if (txt === 'rechazo') {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];
        return conn.sendMessage(m.chat, { text: '💔 *La propuesta fue rechazada.*\n\n> Sasuke Bot' }, { quoted: m });
    }

    if (txt === 'acepto') {
        marriages[proposer] = m.sender;
        marriages[m.sender] = proposer;
        saveMarriages();

        clearTimeout(timeout);
        delete confirmation[m.sender];
        delete proposals[proposer];

        const finalMsg = `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n💍 *¡EL VÍNCULO SE HA SELLADO!*\n\n🎊 ${conn.getName(proposer)} y ${conn.getName(m.sender)} ahora están unidos eternamente 💞\n\n¡Felicidades!\n✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n\n> Sasuke Bot`;
        
        conn.sendMessage(m.chat, { text: finalMsg }, { quoted: m });
    }
};

handler.tags = ['fun'];
handler.help = ['marry', 'divorce', 'partner'];
handler.command = ['marry', 'casar', 'divorce', 'divorciar', 'partner', 'pareja'];
handler.group = true;

export default handler;
