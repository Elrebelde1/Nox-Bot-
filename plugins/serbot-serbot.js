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
        printQRInTerminal: false,
        auth: state,
        browser: ['SubBot-YUPRADEV', 'Chrome', '1.0.0']
    });

    // Esta parte es vital: el socket necesita un tiempo para saludar al servidor
    if (!sock.authState.creds.registered) {
        // Esperamos a que la conexión esté abierta antes de pedir el código
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            let code = await sock.requestPairingCode(id);
            
            // Enviamos el código en un mensaje independiente
            await conn.reply(m.chat, `🛸 *[ SUB-BOT YUPRADEV ]* 🌌\n\n> *Código de vinculación generado:*`, m);
            await conn.reply(m.chat, code, m); 
            
            await conn.reply(m.chat, `📌 *Pasos:*\n1. Ve a "Dispositivos vinculados".\n2. "Vincular con número".\n3. Ingresa el código superior.`, m);
            
        } catch (e) {
            console.error(e);
            conn.reply(m.chat, `❌ *Error:* No se pudo generar el código. Intenta de nuevo.`, m);
        }
    }

    sock.ev.on('creds.update', saveCreds);
    
    // Mensaje de éxito al vincular
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            conn.sendMessage(m.chat, { text: `✅ *SubBot YUPRADEV vinculado exitosamente.*` }, { quoted: m });
        }
    });
};

handler.help = ['code'];
handler.tags = ['subbot'];
handler.command = /^code$/i;
export default handler;
