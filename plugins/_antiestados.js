import { jidNormalizedUser } from '@whiskeysockets/baileys';

export default function(conn) {
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m || !m.key.remoteJid.endsWith('@g.us')) return;

            const chatJid = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;

            const chat = global.db.data.chats[chatJid];
            if (!chat || !chat.antiEstados) return;

            const isStatusMention = !!(
                m.message?.groupStatusMentionMessage || 
                m.message?.protocolMessage?.type === 'STATUS_MENTION_MESSAGE' ||
                m.message?.protocolMessage?.type === 31 ||
                m.message?.extendedTextMessage?.contextInfo?.externalAdReply?.renderLargerThumbnail === false && 
                m.message?.extendedTextMessage?.contextInfo?.externalAdReply?.showAdAttribution === false
            );

            if (isStatusMention) {
                const groupMetadata = await conn.groupMetadata(chatJid).catch(() => null);
                if (!groupMetadata) return;

                const participants = groupMetadata.participants || [];

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
                    await conn.groupParticipantsUpdate(chatJid, [sender], 'remove');
                    await conn.sendMessage(chatJid, { 
                        text: `*「 ANTI ESTADOS 」*\n\n> @${sender.split('@')[0]} fue eliminado por etiquetar un estado.`, 
                        mentions: [sender] 
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    });
}
