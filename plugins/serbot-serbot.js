import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { pino } from 'pino';
import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command }) => {
    let id = m.sender.split('@')[0];
    let authFolder = `./tmp/subbot_${id}`;
    
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['SubBot-YUPRADEV', 'Chrome', '1.0.0']
    });

    if (!sock.authState.creds.registered) {
        let code = await sock.requestPairingCode(m.sender.split('@')[0]);
        m.reply(`🛸 *[ SUB-BOT YUPRADEV ]* 🌌\n\n> *Tu código de vinculación es:*\n\n*${code}*\n\n*Pasos:*\n1. Ve a Dispositivos vinculados.\n2. Selecciona "Vincular con número".\n3. Pon el código.`);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            conn.reply(m.chat, `✅ *SubBot vinculado exitosamente!*\n\n> *Conexión establecida con éxito. El bot ya está activo.*`, m);
        } else if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                // Aquí puedes añadir lógica de reconexión si el bot se cae
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
};

handler.help = ['code'];
handler.tags = ['subbot'];
handler.command = /^code$/i;
export default handler;
