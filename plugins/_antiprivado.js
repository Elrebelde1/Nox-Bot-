export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;

  // Extraer el texto de forma segura para evitar errores
  const txt = (m.text || m.msg?.caption || m.msg || '').toLowerCase();
  
  // Lista de palabras que permiten que el chat NO sea bloqueado
  const keywords = ['piedra', 'papel', 'tijera', 'serbot', 'jadibot'];
  if (keywords.some(word => txt.includes(word))) return !0;

  const bot = global.db.data.settings[this.user.jid] || {};

  // Si la configuración antiPrivate está activa y NO es el dueño...
  if (bot.antiPrivate && !isOwner && !isROwner) {
    // Es recomendable enviar un mensaje rápido antes de bloquear
    // await this.reply(m.chat, 'El chat privado está prohibido para este bot.', m);
    await this.updateBlockStatus(m.chat, 'block');
    return !0;
  }

  return !1;
}
