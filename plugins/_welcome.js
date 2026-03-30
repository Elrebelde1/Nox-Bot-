import { WAMessageStubType } from '@whiskeysockets/baileys';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.bienvenida) return true;

    const img = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'));
    const userJid = m.messageStubParameters?.[0] || m.key.participant || m.participant;
    if (!userJid) return true;

    const userTag = `@${userJid.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || 'Sin reglas, pero no molestes.';
    const membersCount = groupMetadata.participants.length;
    const owner = `@${groupMetadata.owner?.split('@')[0] || 'Nadie'}`;

    let txt = '';

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      txt = chat.customWelcome ? chat.customWelcome.replace(/@user/gi, userTag).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) : 
      `😏 *Vaya, alguien nuevo...*\n\nBienvenido ${userTag} a *${groupName}*.\n\n🔥 *DATOS DEL GRUPO:*\n│ 👤 *Miembro:* #${membersCount}\n│ 👑 *Admin Supremo:* ${owner}\n│ 📝 *Info:* ${groupDesc}\n\n> Intenta no hacer que te echen rápido.`;
    } 
    
    else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
      txt = chat.customBye ? chat.customBye.replace(/@user/gi, userTag).replace(/@group/gi, groupName) : 
      `🏃‍♂️ *Uno menos, ni falta que hacía.*\n\n${userTag} no aguantó el nivel de *${groupName}*.\n\n📉 *Quedamos:* ${membersCount} sobrevivientes.`;
    } 
    
    else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      txt = chat.customKick ? chat.customKick.replace(/@user/gi, userTag).replace(/@group/gi, groupName) : 
      `⚡ *ELIMINADO POR INÚTIL*\n\n${userTag} fue borrado de la existencia en *${groupName}*.\n\n🚮 *Causa:* Estorbaba.\n👥 *Población actual:* ${membersCount}`;
    }

    if (txt) {
      await conn.sendMessage(m.chat, { image: img, caption: txt, mentions: [userJid, groupMetadata.owner] });
    }

  } catch (e) {
    console.error(e);
  }
}
