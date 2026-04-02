import fs from 'fs';

const archivoRegistro = './grupos_ya_notificados.json';
let yaNotificados = new Set(
  fs.existsSync(archivoRegistro)
    ? JSON.parse(fs.readFileSync(archivoRegistro))
    : []
);

const enviarAvisoCanal = async (conn, notifyChat = null) => {
  // Mensaje ultra-corto optimizado
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

  // Filtramos SOLO grupos (@g.us)
  const chats = Object.entries(conn.chats).filter(([jid, chat]) => jid && jid.endsWith('@g.us') && chat.isChats);
  let grupos = [];

  if (notifyChat) await conn.sendMessage(notifyChat, { text: '📢 *Difundiendo en grupos...*' });

  for (let [jid] of chats) {
    if (yaNotificados.has(jid)) continue;

    try {
      await conn.sendMessage(jid, { text: mensaje });
      grupos.push(jid);
      yaNotificados.add(jid);
    } catch (e) {
      console.log(`❌ Error en grupo: ${jid}`);
    }
    // Delay de medio segundo entre grupos para evitar saturación
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  fs.writeFileSync(archivoRegistro, JSON.stringify([...yaNotificados], null, 2));

  let resumen = `✅ *Difusión terminada*\n👥 Grupos nuevos: ${grupos.length}`;
  if (notifyChat) await conn.sendMessage(notifyChat, { text: resumen });

  return { grupos };
};

const handler = async (m, { conn, isOwner }) => {
  if (!isOwner) throw '❌ Solo el *Owner* puede usar este comando.';
  await enviarAvisoCanal(conn, m.chat);
};

handler.help = ['canal'];
handler.tags = ['owner'];
handler.command = ['canal'];
handler.owner = true;

export default handler;
