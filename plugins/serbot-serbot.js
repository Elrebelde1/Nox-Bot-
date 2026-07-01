import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { pino } from 'pino';
import fs from 'fs';

let handler = async (m, { conn }) => {
    let id = m.sender.split('@')[0];
    let authFolder = `./tmp/subbot_${id}`;
    
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['SubBot-YUPRADEV', 'Chrome', '1.0.0']
    });

    // Escuchamos la actualización de conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'connecting') {
            // Esperando...
        } else if (connection === 'open') {
            conn.reply(m.chat, `✅ *SubBot vinculado correctamente.*`, m);
        } else if (connection === 'close') {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                // Aquí podrías añadir lógica de reconexión
            }
        }
    });

    // CORRECCIÓN: Solicitamos el código solo cuando el socket está listo
    try {
        if (!sock.authState.creds.registered) {
            // Esperamos un segundo para asegurar que el socket inicie bien
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let code = await sock.requestPairingCode(m.sender.split('@')[0]);
            
            let message = `🛸 *[ SUB-BOT YUPRADEV ]* 🌌\n\n`;
            message += `> *Tu código de vinculación:* \n\n`;
            message += `*${code}*\n\n`;
            message += `📌 *Instrucciones:*\n`;
            message += `1. Ve a "Dispositivos vinculados".\n`;
            message += `2. "Vincular un dispositivo".\n`;
            message += `3. "Vincular con el número de teléfono".\n`;
            message += `4. Introduce el código de arriba.`;
            
            await conn.reply(m.chat, message, m);
        }
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `❌ *Error al generar el código:* ${e.message}`, m);
    }

    sock.ev.on('creds.update', saveCreds);
};

handler.help = ['code'];
handler.tags = ['subbot'];
handler.command = /^code$/i;
export default handler;
