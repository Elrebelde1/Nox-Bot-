let handler = async (m, { conn }) => {
    // 1. Validar que exista un mensaje citado
    if (!m.quoted) return m.reply('😏 ¿A qué le hablas? Responde a un mensaje de "Ver una sola vez".');

    // 2. Extraer el mensaje real (manejando V2 de ViewOnce)
    let q = m.quoted.msg || m.quoted;
    let viewOnce = q.viewOnce || m.quoted.viewOnce || q.type === 'viewOnceMessage' || q.type === 'viewOnceMessageV2';

    if (!viewOnce) return m.reply('🙄 Eso no es un mensaje de "Ver una sola vez". No me hagas perder el tiempo.');

    try {
        // 3. Intento de descarga con manejo de errores
        let buffer = await m.quoted.download();
        
        if (!buffer) throw new Error('Buffer vacío');

        // 4. Identificar si es video o imagen y enviar
        if (/video/.test(q.mimetype || m.quoted.mtype)) {
            return conn.sendFile(m.chat, buffer, 'error.mp4', q.caption || '⚡ *SISTEMA: BY BARBOZA*', m);
        } else {
            return conn.sendFile(m.chat, buffer, 'error.jpg', q.caption || '⚡ *SISTEMA: BY BARBOZA*', m);
        }

    } catch (e) {
        console.error(e);
        m.reply('⚡ *ERROR:* No se pudo recuperar el archivo. Probablemente sea muy antiguo o el mensaje ya fue procesado por el servidor.');
    }
}

handler.command = ['readviewonce', 'read', 'readvo', 'rvo', 'ver'];

export default handler;
