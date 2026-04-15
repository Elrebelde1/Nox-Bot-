import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('media/game/marry_family.json');

// --- GESTIÓN DE BASE DE DATOS ---
function loadDB() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true });
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
}

function saveDB(data) {
    fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));
}

let confirmation = {};

const handler = async (m, { conn, command, text, usedPrefix }) => {
    let db = loadDB();
    const sender = m.sender;
    const userIsMarried = (user) => Object.hasOwn(db, user);

    switch (command) {
        case 'marry':
            const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);
            if (!proposee) return m.reply('💠 *Responde o etiqueta a alguien para proponerle matrimonio y comenzar tu legado.*');
            if (proposee === sender) return m.reply('Hmp... El camino del Uchiha es solitario, pero no puedes casarte contigo mismo.');
            if (userIsMarried(sender)) return m.reply(`Ya tienes un vínculo con *${conn.getName(db[sender].partner)}*. Úsalo o rómpelo.`);
            if (userIsMarried(proposee)) return m.reply('Esa persona ya pertenece a otra dinastía.');

            confirmation[proposee] = {
                proposer: sender,
                timeout: setTimeout(() => {
                    conn.reply(m.chat, `*⏰ Tiempo agotado.* La propuesta de @${sender.split('@')[0]} se ha desvanecido.`, m, { mentions: [sender] });
                    delete confirmation[proposee];
                }, 60000)
            };

            const msgMarry = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓓𝓞-𝓑𝓞𝓓𝓐 ] ───*\n\n*👤 @${sender.split('@')[0]}* propone unir destinos con *@${proposee.split('@')[0]}*.\n\n> *Escribe:* "si" para aceptar o "no" para rechazar.\n\n*“¿Caminarás conmigo en esta oscuridad?”*`;
            await conn.reply(m.chat, msgMarry, m, { mentions: [sender, proposee] });
            break;

        case 'divorce':
            if (!userIsMarried(sender)) return m.reply('No tienes ningún vínculo que disolver.');
            const ex = db[sender].partner;
            delete db[sender];
            delete db[ex];
            saveDB(db);
            await conn.reply(m.chat, `*🌑 Vínculo disuelto.* La dinastía ha caído y los registros han sido borrados.`, m);
            break;

        case 'pareja':
            if (!userIsMarried(sender)) return m.reply('No tienes pareja. Camina solo hasta encontrar tu destino.');
            let dataP = db[sender];
            let msgP = `*❤️ [ 𝓔𝓢𝓣𝓐𝓓𝓞 𝓓𝓔 𝓟𝓐𝓡𝓔𝓙𝓐 ]*\n\n*🥷 Compañero/a:* @${dataP.partner.split('@')[0]}\n*⏳ Tiempo:* ${new Date(dataP.date).toLocaleDateString()}\n*✨ Estado:* Vínculo Eterno`;
            conn.reply(m.chat, msgP, m, { mentions: [dataP.partner] });
            break;

        case 'amor':
            if (!userIsMarried(sender)) return m.reply('Primero debes tener una pareja para medir su compatibilidad.');
            let lovePercent = Math.floor(Math.random() * 100) + 1;
            let heart = lovePercent > 70 ? '💖' : lovePercent > 40 ? '🧡' : '💔';
            let comment = lovePercent > 80 ? "Un vínculo tan fuerte como el Susanoo." : lovePercent > 50 ? "Su camino ninja está sincronizado." : "Necesitan más entrenamiento emocional.";
            conn.reply(m.chat, `*${heart} [ 𝓝𝓘𝓥𝓔𝓛 𝓓𝓔 𝓐𝓜𝓞𝓡 ]*\n\n*Pareja:* @${sender.split('@')[0]} & @${db[sender].partner.split('@')[0]}\n*Compatibilidad:* ${lovePercent}%\n\n> ${comment}`, m, { mentions: [sender, db[sender].partner] });
            break;

        case 'marrylist':
            let couples = Object.keys(db);
            if (couples.length === 0) return m.reply('*❌ No hay matrimonios registrados en el pergamino.*');
            let listStr = `*─── [ 💍 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`, seen = new Set(), count = 1;
            for (let user of couples) {
                if (!seen.has(user)) {
                    let p = db[user].partner;
                    listStr += `*${count++}.* @${user.split('@')[0]} ♾️ @${p.split('@')[0]}\n`;
                    seen.add(user); seen.add(p);
                }
            }
            conn.reply(m.chat, listStr, m, { mentions: Array.from(seen) });
            break;

        case 'adoptar':
            if (!userIsMarried(sender)) return m.reply('Debes estar casado para registrar hijos en tu legado.');
            if (!text) return m.reply(`*🍼 Uso:* ${usedPrefix}${command} [Nombre del hijo]`);
            if (!db[sender].children) db[sender].children = [];
            db[sender].children.push(text);
            db[db[sender].partner].children = db[sender].children;
            saveDB(db);
            m.reply(`*✨ @${sender.split('@')[0]} y @${db[sender].partner.split('@')[0]} han integrado a "${text}" a su familia.*`, null, { mentions: [sender, db[sender].partner] });
            break;

        case 'adoptar_mascota':
            if (!userIsMarried(sender)) return m.reply('Solo los matrimonios pueden cuidar de una mascota familiar.');
            let [tipo, ...nombrePet] = text.split(' ');
            let icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' };
            if (!icons[tipo?.toLowerCase()] || !nombrePet.length) return m.reply(`*🐾 Uso:* ${usedPrefix}adoptar_mascota [perro/gato/conejo/zorro] [nombre]`);
            
            let petObj = { type: icons[tipo.toLowerCase()], name: nombrePet.join(' '), hunger: 50 };
            db[sender].pet = petObj;
            db[db[sender].partner].pet = petObj;
            saveDB(db);
            m.reply(`*✨ ¡Nueva Mascota! Han adoptado a ${petObj.name} ${petObj.type}.*`);
            break;

        case 'familia':
            if (!userIsMarried(sender)) return m.reply('No tienes una dinastía registrada.');
            let f = db[sender];
            let fam = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n`;
            fam += `*🥷 Padres:* @${sender.split('@')[0]} & @${f.partner.split('@')[0]}\n`;
            fam += `*👶 Hijos:* ${f.children?.length ? f.children.join(', ') : 'Ninguno'}\n`;
            if (f.pet) {
                fam += `*🐾 Mascota:* ${f.pet.name} ${f.pet.type}\n`;
                fam += `*🍖 Hambre:* ${f.pet.hunger}% ${f.pet.hunger < 20 ? '⚠️ (Hambriento)' : ''}\n`;
            }
            conn.reply(m.chat, fam, m, { mentions: [sender, f.partner] });
            break;

        case 'alimentar':
            if (!db[sender]?.pet) return m.reply('No tienes mascotas en tu familia.');
            let pet = db[sender].pet;
            if (pet.hunger >= 100) return m.reply(`*✋ ${pet.name} ya está satisfecho.*`);
            pet.hunger = Math.min(100, pet.hunger + 25);
            db[sender].pet = pet;
            db[db[sender].partner].pet = pet;
            saveDB(db);
            m.reply(`*🍖 Has alimentado a ${pet.name}. Hambre: ${pet.hunger}%*`);
            break;
    }
};

handler.before = async (m, { conn }) => {
    if (m.isBaileys || !m.text || !confirmation[m.sender]) return;
    const { proposer, timeout } = confirmation[m.sender];
    const txt = m.text.toLowerCase().trim();

    if (txt === 'no') {
        clearTimeout(timeout);
        delete confirmation[m.sender];
        return conn.reply(m.chat, `*💔 Propuesta rechazada.* "No eres digno de mi tiempo."`, m);
    }

    if (txt === 'si' || txt === 'sí') {
        clearTimeout(timeout);
        let db = loadDB();
        let data = { partner: proposer, date: Date.now(), children: [], pet: null };
        db[m.sender] = data;
        db[proposer] = { partner: m.sender, date: Date.now(), children: [], pet: null };
        saveDB(db);
        delete confirmation[m.sender];

        const wedding = `*─── [ 💍 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ───*\n\n*⚡ ¡Vínculo Eterno!* @${proposer.split('@')[0]} y @${m.sender.split('@')[0]} se han unido.\n\n*"Cargaré con tu odio y moriremos juntos... o viviremos como esposos."*`;
        return conn.reply(m.chat, wedding, m, { mentions: [proposer, m.sender] });
    }
};

handler.help = ['marry', 'divorce', 'pareja', 'amor', 'marrylist', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar'];
handler.tags = ['fun'];
handler.command = /^(marry|divorce|pareja|amor|marrylist|adoptar|adoptar_mascota|familia|alimentar)$/i;
handler.group = true;

export default handler;
