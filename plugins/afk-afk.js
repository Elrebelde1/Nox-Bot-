// 1. EL DETECTOR (Se ejecuta con cada mensaje en el chat)
export async function before(m, { conn }) {
    if (!global.db || !global.db.data || !global.db.data.users) return true;

    const user = global.db.data.users[m.sender];

    // SI TÚ ESTÁS AFK Y ESCRIBES ALGO, SE TE QUITA EL AFK
    if (user && user.afk > -1) {
        const timestamp = new Date() - user.afk;
        const tiempoAfk = formatTime(timestamp);

        conn.reply(
            m.chat, 
            `『 ＲＥＧＲＥＳＯ 』\n\n> ᴇʟ ᴜsᴜᴀʀɪᴏ *${conn.getName(m.sender)}* ʏᴀ ɴᴏ ᴇsᴛᴀ ᴀғᴋ.\n\n*⏱️ ᴛɪᴇᴍᴘᴏ ɪɴᴀᴄᴛɪᴠᴏ:* ${tiempoAfk}`, 
            m
        );
        user.afk = -1;
        user.afkReason = '';
    }

    // SI ALGUIEN TE ETIQUETA O TE RESPONDE UN MENSAJE MIENTRAS ESTÁS AFK
    const jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
    for (const jid of jids) {
        const afkUser = global.db.data.users[jid];
        if (afkUser && afkUser.afk > -1) {
            const timestamp = new Date() - afkUser.afk;
            const tiempoAfk = formatTime(timestamp);
            const nombre = conn.getName(jid);

            conn.reply(
                m.chat, 
                `『 ＵＳＵＡＲＩＯ  ＯＣＵＰＡＤＯ 』\n\n💤 El usuario *${nombre}* está usando el modo AFK y no está disponible.\n\n*☣️ ᴍᴏᴛɪᴠᴏ:* ${afkUser.afkReason}\n*⏱️ ᴛɪᴇᴍᴘᴏ ɪɴᴀᴄᴛɪᴠᴏ:* ${tiempoAfk}`, 
                m
            );
        }
    }
    return true;
}

// 2. EL COMANDO (Solo se ejecuta cuando pones .afk)
const handler = async (m, { text }) => {
    const user = global.db.data.users[m.sender];
    user.afk = + new Date();
    user.afkReason = text || 'Comiendo / Ocupado';

    conn.fakeReply(
        m.chat, 
        `『 ＡＦＫ 』\n\n> ᴇʟ ᴜsᴜᴀʀɪᴏ *${conn.getName(m.sender)}* ᴇsᴛᴀ ɪɴᴀᴄᴛɪᴠᴏ.\n\n\`💤 ＮＯ ＬＯＳ ＥＴＩＱＵＥＴＥ 💤\`\n*☣️ ᴍᴏᴛɪᴠᴏ :* ${user.afkReason}`, 
        '0@s.whatsapp.net', 
        `💤 NO MOLESTAR 💤`, 
        'status@broadcast', 
        null, 
        fake
    );
};

// Función para el tiempo
function formatTime(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor((ms % 3600000) / 60000);
    let s = Math.floor((ms % 60000) / 1000);
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
}

handler.help = ['afk [motivo]'];
handler.tags = ['main'];
handler.command = /^afk$/i;

export default handler;
