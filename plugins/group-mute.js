
const mutedUsersByChat = new Map();

function normalizeJid(jid) {
    if (!jid) return null;
    let digits = jid.replace(/[^0-9]/g, '');
    if (digits.startsWith("521")) digits = "52" + digits.slice(3);
    return digits ? digits + '@s.whatsapp.net' : null;
}

function getOwnerNumbers() {
    return (global.owner || []).map(n => normalizeJid(n));
}

function getBotNumbers(conn) {
    return [normalizeJid(conn?.user?.id)];
}

let handler = async (m, { conn, command, isAdmin, isBotAdmin }) => {
    if (!isBotAdmin) return conn.reply(m.chat, '🤖⚠️ *El bot necesita ser administrador.*', m);
    if (!isAdmin) return conn.reply(m.chat, '🛑 *Este comando es solo para admins.*', m);

    let user = m.quoted ? m.quoted.sender : null;
    if (!user) return conn.reply(m.chat, '📌 *Debes responder al mensaje de la persona.*', m);

    const normalizedUser = normalizeJid(user);
    const ownerNumbers = getOwnerNumbers();
    const botNumbers = getBotNumbers(conn);

    if (ownerNumbers.includes(normalizedUser)) return conn.reply(m.chat, '👑✨ *No puedes mutear al propietario.*', m);
    if (botNumbers.includes(normalizedUser)) return conn.reply(m.chat, '🤖💫 *No me puedo mutear yo mismo.*', m);

    if (!mutedUsersByChat.has(m.chat)) mutedUsersByChat.set(m.chat, new Map());
    let mutedMap = mutedUsersByChat.get(m.chat);

    if (command === "mute") {
        mutedMap.set(normalizedUser, { warnings: 0 });
        conn.reply(m.chat, `🔇 *Usuario muteado:* @${normalizedUser.split('@')[0]}\n🚫 *Evite enviar o reaccionar a mensajes.*`, m, { mentions: [normalizedUser] });
    } else if (command === "unmute") {
        if (normalizedUser === normalizeJid(m.sender)) return conn.reply(m.chat, '🙅‍♂️ *No puedes desmutearte a ti mismo.*', m);
        mutedMap.delete(normalizedUser);
        conn.reply(m.chat, `🔊 *Usuario desmuteado:* @${normalizedUser.split('@')[0]}\n✅ *Tus mensajes ya no serán eliminados.*`, m, { mentions: [normalizedUser] });
    }
};

handler.before = async (m, { conn }) => {
    const normalizedSender = normalizeJid(m.sender);
    const ownerNumbers = getOwnerNumbers();
    const botNumbers = getBotNumbers(conn);

    if (ownerNumbers.includes(normalizedSender) || botNumbers.includes(normalizedSender)) return;

    let mutedMap = mutedUsersByChat.get(m.chat);
    if (mutedMap && mutedMap.has(normalizedSender)) {
        try {
            if (m.key) {
                await conn.sendMessage(m.chat, { delete: m.key });
            }
        } catch {
            try {
                if (m.key) {
                    await conn.sendMessage(m.chat, {
                        delete: {
                            remoteJid: m.chat,
                            fromMe: !!m.key?.fromMe,
                            id: m.key?.id,
                            participant: m.key?.participant || m.sender
                        }
                    });
                }
            } catch {}
        }

        let userData = mutedMap.get(normalizedSender);
        userData.warnings += 1;

        if (userData.warnings >= 3) {
            conn.reply(m.chat, `🚨 *Advertencia 3/3*\n❌ *Usuario expulsado por spam mientras estaba muteado:* @${normalizedSender.split('@')[0]}`, m, { mentions: [normalizedSender] });
            mutedMap.delete(normalizedSender);
            await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");
        } else {
            conn.reply(m.chat, `⚠️ *Advertencia ${userData.warnings}/3:* @${normalizedSender.split('@')[0]}\n⛔ *Estás muteado, no puedes hablar. Si insistes serás eliminado.*`, m, { mentions: [normalizedSender] });
        }
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['grupos'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;