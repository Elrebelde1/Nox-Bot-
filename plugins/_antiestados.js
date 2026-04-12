import { jidNormalizedUser } from '@whiskeysockets/baileys';

export default function(conn) {
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m || !m.key.remoteJid.endsWith('@g.us')) return;

            const chatJid = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;

            // Uso directo de tu base de datos global
            const chat = global.db.data.chats[chatJid];
            if (!chat || !chat.antiEstados) return;

            // Detección simplificada de mención de estado
            const isStatusMention = !!m.message?.groupStatusMentionMessage;

            if (isStatusMention) {
                const groupMetadata = await conn.groupMetadata(chatJid).catch(() => null);
                if (!groupMetadata) return;

                const participants = groupMetadata.participants || [];

                // Verificación de Admin/BotAdmin
                const getAdminStatus = (targetJid) => {
                    const p = participants.find(p => jidNormalizedUser(p.id) === jidNormalizedUser(targetJid));
                    return !!(p?.admin || p?.isCommunityAdmin);
                };

                const isBotAdmin = getAdminStatus(conn.user.id);
                const isAdmin = getAdminStatus(sender);
                const isOwner = global.owner.some(([num]) => num.replace(/\D/g, '') === sender.split('@')[0]);

                if (isAdmin || isOwner) return;

                if (isBotAdmin) {
                    await conn.sendMessage(chatJid, { delete: m.key });
                    await conn.sendMessage(chatJid, { 
                        text: `*「 ANTI ESTADOS 」*\n\n> @${sender.split('@')[0]}, no se permiten los estados en este grupo.`, 
                        mentions: [sender] 
                    });
                }
            }
        } catch (e) {
            console.error('Error en antiEstados:', e);
        }
    });
}
