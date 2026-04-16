import fs from 'fs';
import path from 'path';

// Configuración de la Base de Datos
const dbPath = path.resolve('media/game/marry.json');

// Función para asegurar que el archivo y la carpeta existan
const checkDB = () => {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ marriages: [] }, null, 2));
};

// Funciones de lectura y escritura seguras
const readDB = () => {
    checkDB();
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch {
        return { marriages: [] };
    }
};

const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

let proposals = new Map();

const handler = async (m, { conn, command, participants }) => {
    const db = readDB();
    const sender = m.sender;
    const chat = m.chat;

    // Helper: Buscar si alguien ya está casado
    const getMarriage = (jid) => db.marriages.find(mt => mt.u1 === jid || mt.u2 === jid);

    try {
        if (command === 'marry') {
            const target = m.quoted?.sender || m.mentionedJid?.[0];
            if (!target) throw 'Debes etiquetar o responder al mensaje de tu futuro lazo.';
            if (target === sender) throw 'No puedes formar un lazo contigo mismo... eso es soledad.';
            
            if (getMarriage(sender)) throw 'Ya tienes un lazo activo. Rómpelo antes de buscar otro.';
            if (getMarriage(target)) throw 'Esa persona ya juró lealtad a otro clan.';

            proposals.set(target, { proposer: sender, time: Date.now() });

            let txt = `   ♱ ──── 𓆩 🍷 𓆪 ──── ♱\n`;
            txt += `*𝐏𝐑𝐎𝐏𝐔𝐄𝐒𝐓𝐀 𝐃𝐄 𝐒𝐀𝐍𝐆𝐑𝐄*\n\n`;
            txt += `🦅 @${sender.split('@')[0]} busca unir su destino al tuyo @${target.split('@')[0]}.\n\n`;
            txt += `¿Aceptarás este pacto?\n`;
            txt += `> Responde con *.si* o *.no*`;
            
            return conn.reply(chat, txt, m, { mentions: [sender, target] });
        }

        if (command === 'si') {
            const prop = proposals.get(sender);
            if (!prop) return; // Ignorar si no hay propuesta para él

            // Doble check por si se casaron con otro mientras esperaba
            if (getMarriage(sender) || getMarriage(prop.proposer)) {
                proposals.delete(sender);
                throw 'Uno de los dos ya ha formado un lazo recientemente.';
            }

            db.marriages.push({
                u1: prop.proposer,
                u2: sender,
                date: Date.now()
            });

            writeDB(db);
            proposals.delete(sender);

            return conn.reply(chat, `𓄿 ─── ✦ ─── 𓄿\n💍 *𝐋𝐀𝐙𝐎 𝐄𝐓𝐄𝐑𝐍𝐎 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐎*\n\n🌌 El destino ha sido sellado bajo la luna roja.\n𓄿 ─── ✦ ─── 𓄿`, m);
        }

        if (command === 'no') {
            if (proposals.has(sender)) {
                proposals.delete(sender);
                return conn.reply(chat, '🐍 *Has rechazado el lazo. La oscuridad te espera.*', m);
            }
        }

        if (command === 'marrylist') {
            const groupIds = participants.map(p => p.id);
            const active = db.marriages.filter(mt => groupIds.includes(mt.u1) && groupIds.includes(mt.u2));

            let txt = `   ♱ ─── 𓆩 🍷 𓆪 ─── ♱\n`;
            txt += `  *𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐃𝐄 𝐋𝐀𝐙𝐎𝐒*\n\n`;

            if (active.length === 0) {
                txt += `_No hay pactos de sangre en este sector._ 🌌`;
            } else {
                active.forEach((mt, i) => {
                    const days = Math.floor((Date.now() - mt.date) / 86400000);
                    txt += `*${i + 1}.* @${mt.u1.split('@')[0]} ⚔️ @${mt.u2.split('@')[0]}\n`;
                    txt += `   ╰ ⏳ *Lealtad:* ${days} días\n\n`;
                });
            }
            return conn.reply(chat, txt, m, { mentions: active.flatMap(mt => [mt.u1, mt.u2]) });
        }

        if (command === 'divorce') {
            const mt = getMarriage(sender);
            if (!mt) throw 'No tienes ningún lazo que cortar.';

            db.marriages = db.marriages.filter(m => m !== mt);
            writeDB(db);

            return conn.reply(chat, `🗡️ *Lazo cortado.* Has elegido el camino del odio.`, m);
        }

        if (command === 'partner') {
            const mt = getMarriage(sender);
            if (!mt) throw 'Caminas solo en las sombras.';
            const partner = mt.u1 === sender ? mt.u2 : mt.u1;
            const days = Math.floor((Date.now() - mt.date) / 86400000);

            return conn.reply(chat, `🦇 *Tu Lazo:* @${partner.split('@')[0]}\n⌛ *Tiempo:* ${days} días`, m, { mentions: [partner] });
        }

    } catch (e) {
        return conn.reply(chat, `⚙️ *Aviso:* ${e}`, m);
    }
};

handler.help = ['marry', 'si', 'no', 'divorce', 'marrylist', 'partner'];
handler.tags = ['fun'];
handler.command = ['marry', 'si', 'no', 'divorce', 'marrylist', 'partner'];
handler.group = true;

export default handler;
