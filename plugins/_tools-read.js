let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply('😏 ¿A qué le hablas? Responde a un mensaje de "Ver una sola vez".');

    let q = m.quoted.msg || m.quoted;
    if (!q.viewOnce && !m.quoted.viewOnce) return m.reply('🙄 Eso no es un mensaje de "Ver una sola vez".');

    try {
        let buffer = await m.quoted.download();
        if (!buffer) throw new Error();

        if (/video/.test(q.mimetype || m.quoted.mtype)) {
            return conn.sendFile(m.chat, buffer, 'video.mp4', q.caption || '⚡ *BY BARBOZA*', m);
        } else {
            return conn.sendFile(m.chat, buffer, 'image.jpg', q.caption || '⚡ *BY BARBOZA*', m);
        }

    } catch (e) {
        m.reply('⚡ *ERROR:* No se pudo recuperar el archivo. Llave de medios vacía o expirada.');
    }
}

handler.command = ['readviewonce', 'read', 'readvo', 'rvo', 'ver'];

export default handler;
