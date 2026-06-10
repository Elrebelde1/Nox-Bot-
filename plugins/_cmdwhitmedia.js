const { proto, generateWAMessage } = (await import('@whiskeysockets/baileys')).default;

export async function all(m, chatUpdate) {
  if (m.isBaileys || !m.message || !m.msg || !m.msg.fileSha256) return;
  if (!(Buffer.from(m.msg.fileSha256).toString('base64') in global.db.data.sticker)) return;

  const hash = global.db.data.sticker[Buffer.from(m.msg.fileSha256).toString('base64')];
  const { text: pluginName, mentionedJid } = hash;

  // Transformamos el nombre del archivo (menu.js) en un comando ejecutable (.menu)
  const prefijoInyectado = '.'; 
  const comandoLimpio = pluginName.replace('.js', '').trim();
  const textoEjecutable = `${prefijoInyectado}${comandoLimpio}`;

  // Creamos el objeto de mensaje falso inyectando el comando real en el flujo de Baileys
  const messages = await generateWAMessage(m.chat, { text: textoEjecutable, mentions: mentionedJid }, {
    userJid: this.user.id,
    quoted: m.quoted && m.quoted.fakeObj,
  });

  messages.key.fromMe = m.isBaileys || (m.sender === this.user?.jid);
  messages.key.id = m.key.id;
  messages.pushName = m.pushName;
  if (m.isGroup) messages.participant = m.sender;
  
  const msg = {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)],
    type: 'append',
  };

  // Emitimos el evento de vuelta al handler principal del bot para que procese el comando .menu
  this.ev.emit('messages.upsert', msg);
}
