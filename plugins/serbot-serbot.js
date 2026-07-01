import { makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { pino } from 'pino';
import fs from 'fs';
import path from 'path';
import NodeCache from 'node-cache';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let id = m.sender.split('@')[0];
    let pathJadiBot = `./tmp/subbot_${id}`;
    if (!fs.existsSync(pathJadiBot)) fs.mkdirSync(pathJadiBot, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(pathJadiBot);
    const msgRetryCache = new NodeCache();
    
    let { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        version,
        browser: ['YUPRADEV-SUBBOT', 'Chrome', '1.0.0']
    });

    // --- LÓGICA DE VINCULACIÓN ---
    if (!sock.authState.creds.registered) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        let code = await sock.requestPairingCode(id);
        await conn.reply(m.chat, `🛸 *[ SUB-BOT YUPRADEV ]* 🌌\n\n> *Código:* ${code}\n\n📌 *Instrucciones:* Vincula en "Dispositivos vinculados" -> "Vincular con número".`, m);
    }

    // --- AUTORECONEXIÓN Y GESTIÓN ---
    const connectionUpdate = async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Reconectando SubBot...");
                // Aquí se reintenta la conexión
                return await handler(m, { conn, args, usedPrefix, command }); 
            }
        }
        
        if (connection === 'open') {
            await conn.reply(m.chat, `✅ *SubBot conectado exitosamente.*`, m);
        }
    };

    sock.ev.on('connection.update', connectionUpdate);
    sock.ev.on('creds.update', saveCreds);
};

handler.help = ['code'];
handler.tags = ['subbot'];
handler.command = /^code$/i;
export default handler;
