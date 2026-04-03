export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;

  const keywords = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'jadibot'];
  if (keywords.some(word => m.text.includes(word))) return !0;

  const bot = global.db.data.settings[this.user.jid] || {};

  if (bot.antiPrivate && !isOwner && !isROwner) {
    await this.updateBlockStatus(m.chat, 'block');
    return !0;
  }

  return !1;
}