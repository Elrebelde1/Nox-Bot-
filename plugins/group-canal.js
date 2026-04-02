import fs from 'fs';

const archivoRegistro = './chats_ya_notificados.json';
let yaNotificados = new Set(
  fs.existsSync(archivoRegistro)
    ? JSON.parse(fs.readFileSync(archivoRegistro))
    : []
);

const enviarAvisoCanal = async (conn, notifyChat = null) => {
  // Mensaje ultra-corto para evitar el "Leer más"
  const mensaje = `✨ *NUEVAS MEJORAS - BARBOZA* 🐐

🚀 *¡SÍGUENOS!*
1️⃣ https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I
2️⃣ https://whatsapp.com/channel/0029VbBbaFCAO7RL7UEhBD2F

📦 *LO NUEVO:*
• #Play / #Sound (3 APIs) 🎵
• #Mediafire (100MB) 📂
• #Bratv Animado 🎭
• #Ver / #Tiktok Fix 📸
• #Welcome / #Ping ⚡

🛡️ *Powered By Barboza-Team*`;

  const chats = Object.entries(conn.chats).filter(([jid, chat]) => jid && chat.isChats);
  let usuarios = [];
  let grupos = [];

  if (notifyChat) await conn.sendMessage(notifyChat, { text: '📢 *Difundiendo...*' });

  for (let [jid] of chats) {
    if (yaNotificados.has(jid)) continue;
    const isGroup = jid.endsWith('@g.us');
    try {
      await conn.sendMessage(jid, { text: mensaje });
      if (isGroup) grupos.push(jid);
      else usuarios.push(jid);
      yaNotificados.add(jid);
    } catch (e) {
      console.log(`❌ Error en ${jid}`);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  fs.writeFileSync(archivoRegistro, JSON.stringify([...yaNotificados], null, 2));

  let resumen = `✅ *Enviado a:* ${usuarios.length + grupos.length} chats`;
  if (notifyChat) await conn.sendMessage(notifyChat, { text: resumen });

  return { usuarios, grupos };
};

const handler = async (m, { conn, isOwner }) => {
  if (!isOwner) throw '❌ Solo el *Propietario* puede usar esto.';
  await enviarAvisoCanal(conn, m.chat);
};

handler.help = ['canal'];
handler.tags = ['owner'];
handler.command = ['canal'];
handler.owner = true;

export default handler;
