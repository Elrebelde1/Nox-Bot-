export async function before(m, { conn, isOwner, isROwner }) {
  // Ignorar si el mensaje es del propio bot o si es en un grupo
  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;

  const bot = global.db.data.settings[this.user.jid] || {};

  // Si el antiPrivate está activo y quien escribe NO es el dueño, bloquear.
  if (bot.antiPrivate && !isOwner && !isROwner) {
    await this.updateBlockStatus(m.chat, 'block');
    return !0;
  }

  return !1;
}
