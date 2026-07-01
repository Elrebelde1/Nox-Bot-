import { makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { pino } from 'pino';
import fs from 'fs';
import NodeCache from 'node-cache';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let id = m.sender.split('@')[0];
    let pathJadiBot = `./tmp/subbot_${id}`;
    let isConnected = false; // Flag para controlar el mensaje único

    if (fs.existsSync(pathJadiBot)) {
        fs.rmSync(pathJadiBot, { recursive: true, force: true });
    }
    fs.mkdirSync(pathJadiBot, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(pathJadiBot);
    const msgRetryCache = new NodeCache();
    let { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) 
        },
        version,
        browser: ['Ubuntu', 'Chrome', '110.0.5585.95'],
        msgRetryCache
    });

    if (!sock.authState.creds.registered) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
            let secret = await sock.requestPairingCode(id);
            let formattedSecret = secret.match(/.{1,4}/g)?.join("-");
            
            await conn.reply(m.chat, `🛸 *[ SUB-BOT YUPRADEV ]* 🌌\n\n> *Código:* ${formattedSecret}\n\n📌 *Instrucciones:* Vincula en "Dispositivos vinculados" -> "Vincular con número".`, m);
        } catch (e) {
            await conn.reply(m.chat, `❌ *Error:* ${e.message}`, m);
        }
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open' && !isConnected) {
            isConnected = true; // Bloqueamos mensajes futuros
            await conn.reply(m.chat, `✅ *SubBot YUPRADEV conectado exitosamente.*`, m);
        } else if (connection === 'close') {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                // Si se cierra, reseteamos el flag por si necesita reconectar
                isConnected = false;
                await handler(m, { conn, args, usedPrefix, command });
            }
        }
    });
};

handler.help = ['code'];
handler.tags = ['inteligencia artificial'];
handler.command = /^code$/i;
export default handler;
