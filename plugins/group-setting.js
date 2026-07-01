// Handler para abrir/cerrar grupo con mensaje personalizado
const handler = async (m, { conn, command }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos';
  if (!m.isAdmin) throw 'Necesitas ser admin para usar este comando';

  let action;
  let estado;
  if (command === 'grupo abrir') {
    action = 'not_announcement'; // Todos pueden enviar mensajes
    estado = '📢 Grupo actualmente *abierto*';
  } else if (command === 'grupo cerrar') {
    action = 'announcement'; // Solo admins pueden enviar mensajes
    estado = '🔒 Grupo actualmente *cerrado*';
  } else {
    throw 'Comando inválido. Usa .grupo abrir o .grupo cerrar';
  }

  await conn.groupSettingUpdate(m.chat, action);

  // Mensaje con mención al usuario que ejecutó la acción
  await conn.sendMessage(m.chat, {
    text: `${estado}\nPor: @${m.sender.split('@')[0]}`,
    mentions: [m.sender]
  });
};

handler.command = /^grupo (abrir|cerrar)$/i;
handler.tags = ['gc']
handler.help = ['grupo abrir','grupo cerrar']
handler.group = true;
handler.admin = true;

export default handler;