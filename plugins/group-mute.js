let mutedUsers = new Set();

let handler = async (m, { conn, command, participants }) => {
    let mentionedJid = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    if (!mentionedJid) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n🚩 Etiqueta a una persona o responde a un mensaje.`);
    
    let isUserAdmin = participants.find(p => p.id === mentionedJid)?.admin;
    if (isUserAdmin) return m.reply(`⚠️ *No puedes mutear a un administrador.*`);
    if (mentionedJid === conn.user.jid) return m.reply(`⚠️ *No puedo realizar esta acción conmigo mismo.*`);

    if (command === "mute") {
        mutedUsers.add(mentionedJid);
        conn.reply(m.chat, `✅ *Usuario muteado:* @${mentionedJid.split('@')[0]}`, m, { mentions: [mentionedJid] });
    } else if (command === "unmute") {
        mutedUsers.delete(mentionedJid);
        conn.reply(m.chat, `✅ *Usuario desmuteado:* @${mentionedJid.split('@')[0]}`, m, { mentions: [mentionedJid] });
    }
};

handler.before = async (m, { conn, isAdmin }) => {
    if (mutedUsers.has(m.sender) && !isAdmin) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (e) {
            console.error(e);
        }
    }
};

handler.help = ['mute', 'unmute'].map(v => v + ' @user');
handler.tags = ['grupos'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
