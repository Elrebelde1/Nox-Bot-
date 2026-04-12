import { jidNormalizedUser } from '@whiskeysockets/baileys';
import { getRealJid } from '../identifier.js';

export default function(conn) {
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m || !m.key.remoteJid.endsWith('@g.us')) return;

            const chatJid = m.key.remoteJid;
            const sender = await getRealJid(conn, m.key.participant || m.author || m.key.remoteJid, m);

            const chat = await global.Chat.findOne({ id: chatJid });
            if (!chat || !chat.antiStatus) return;

            const isStatusMention = !!m.message?.groupStatusMentionMessage || 
                                   m.message?.groupStatusMentionMessage?.message?.protocolMessage?.type === 'STATUS_MENTION_MESSAGE';

            if (isStatusMention) {
                const groupMetadata = await conn.groupMetadata(chatJid).catch(() => null);
                if (!groupMetadata) return;

                const participants = groupMetadata.participants || [];

                const getAdminStatus = (targetJid, targetLid) => {
                    const p = participants.find(p => 
                        jidNormalizedUser(p.id) === jidNormalizedUser(targetJid) || 
                        (p.lid && jidNormalizedUser(p.lid) === jidNormalizedUser(targetJid)) ||
                        (targetLid && jidNormalizedUser(p.id) === jidNormalizedUser(targetLid)) ||
                        (p.lid && targetLid && jidNormalizedUser(p.lid) === jidNormalizedUser(targetLid))
                    );
                    return !!(p?.admin || p?.isCommunityAdmin);
                };

                const isBotAdmin = getAdminStatus(conn.user.id, conn.user.lid);
                const isAdmin = getAdminStatus(sender);
                const isOwner = global.owner.some(([num]) => num.replace(/\D/g, '') === sender.split('@')[0]);

                if (isAdmin || isOwner) return;

                if (isBotAdmin) {
                    await conn.sendMessage(chatJid, { delete: m.key });
                    await conn.sendMessage(chatJid, { 
                        text: `*「 ANTI ESTADOS 」*\n\n> @${sender.split('@')[0]}, no se permiten los estados en este grupo. La opción anti estado está activa por lo tanto este mensaje fue eliminado.`, 
                        mentions: [sender] 
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    });
}