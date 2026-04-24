const handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return;

  await m.react('🔄');
  
  await conn.reply(m.chat, '🌀 *Reiniciando Sasuke Bot MD...*\n\n> El proceso se detendrá y el host lo iniciará automáticamente. Dame unos segundos para volver.', m);

  // Un pequeño retraso para que el mensaje llegue a WhatsApp antes de matar el proceso
  setTimeout(() => {
    process.exit();
  }, 2000);
};

handler.help = ['reset'];
handler.tags = ['owner'];
handler.command = /^(reset|reiniciar|restart)$/i;
handler.owner = true;

export default handler;
