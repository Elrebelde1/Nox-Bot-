const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import * as ws from 'ws';
const { exec } = await import('child_process');
import { makeWASocket } from '../lib/simple.js';
import { fileURLToPath } from 'url';
import { startSub, checkSubBots } from '../lib/resetsb.js';

// Inicialización de servicios
await startSub();
setInterval(() => { checkSubBots(); }, 30000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JBOptions = {};

if (!(global.conns instanceof Array)) global.conns = [];

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!globalThis.db.data.settings[conn.user.jid]?.jadibotmd) {
        return m.reply(`❌ Este comando está desactivado en la configuración actual.`);
    }

    const subBots = global.conns.filter((c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED);
    if (subBots.length >= 100) { // Límite razonable de subbots
        return m.reply(`⚠️ No hay espacios disponibles para nuevos Sub-Bots en este momento.`);
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let id = `${who.split`@`[0]}`;
    let pathJadiBot = path.join(`./${global.jadi || 'Data/Sesiones/Subbots'}/`, id);

    if (!fs.existsSync(pathJadiBot)) {
        fs.mkdirSync(pathJadiBot, { recursive: true });
    }

    JBOptions.pathJadiBot = pathJadiBot;
    JBOptions.m = m;
    JBOptions.conn = conn;
    JBOptions.args = args;
    JBOptions.usedPrefix = usedPrefix;
    JBOptions.command = command;
    JBOptions.fromCommand = true;

    await JadiBot(JBOptions);
    global.db.data.users[m.sender].Subs = Date.now();
};

handler.help = ['serbot', 'code'];
handler.tags = ['serbot'];
handler.command = ['serbot', 'code'];
export default handler;

export async function JadiBot(options) {
    let { pathJadiBot, m, conn, args, usedPrefix, command } = options;
    const mcode = command === 'code' || args.includes('--code');
    
    const rtx = `╔═══『 🌀 𝚂𝙰𝚂𝚄𝙺𝙴 - 𝚀𝚁 』═══╗\n\n🔗 *Conexión Sub-Bot QR*\n\n📱 Escanea para vincularte.\n\n⏳ *Expira en 45 segundos.*`;
    const rtx2 = `╔══『 𝙲𝙾𝙳𝙸𝙶𝙾 𝙳𝙴 𝚅𝙸𝙽𝙲𝚄𝙻𝙰𝙲𝙸𝙾𝙽 』══╗\n\n🔐 Usa este código de 8 dígitos para conectarte como Sub-Bot.\n\n⚠️ Si ya tienes una sesión, ciérrala antes.`;

    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(pathJadiBot);
    const msgRetryCache = new NodeCache();

    const connectionOptions = {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) 
        },
        msgRetryCache,
        browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Sasuke Bot MD', 'Safari', '2.0.0'],
        version,
        generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions);
    let isInit = true;

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        
        // Manejo de QR
        if (qr && !mcode) {
            let txtQR = await conn.sendMessage(m.chat, {
                image: await qrcode.toBuffer(qr, { scale: 8 }),
                caption: rtx
            }, { quoted: m });
            setTimeout(() => { conn.sendMessage(m.chat, { delete: txtQR.key }).catch(() => {}) }, 45000);
        }

        // Manejo de Código de Emparejamiento
        if (qr && mcode) {
            let secret = await sock.requestPairingCode(options.phoneNumber || (m.sender.split`@`[0]));
            secret = secret.match(/.{1,4}/g)?.join("-");
            
            await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m });
            await conn.sendMessage(m.chat, { text: secret }, { quoted: m });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
            console.log(chalk.yellow(`[!] Conexión cerrada en ${path.basename(pathJadiBot)}. Razón: ${reason}`));

            if (reason === DisconnectReason.restartRequired || reason === 408) {
                await creloadHandler(true);
            } else if (reason === 401 || reason === 405 || reason === 403) {
                // Sesión inválida o cuenta en soporte
                console.log(chalk.red(`[X] Sesión de ${path.basename(pathJadiBot)} eliminada.`));
                fs.rmSync(pathJadiBot, { recursive: true, force: true });
            } else {
                await creloadHandler(true);
            }
        }

        if (connection === 'open') {
            sock.isInit = true;
            global.conns.push(sock);
            console.log(chalk.green(`\n✅ Sub-Bot +${path.basename(pathJadiBot)} Activo`));

            if (options.fromCommand) {
                await conn.sendMessage(m.chat, { 
                    text: `✅ *¡Conectado exitosamente!*\n\n@${m.sender.split('@')[0]} ya eres parte de la familia Sasuke Bot.`,
                    mentions: [m.sender] 
                }, { quoted: m });
            }
            await joinChannels(sock);
        }
    }

    // Intervalo de limpieza para evitar sesiones muertas en memoria
    const checkAlive = setInterval(async () => {
        if (!sock.user && sock.ws.socket?.readyState === ws.CLOSED) {
            clearInterval(checkAlive);
            let i = global.conns.indexOf(sock);
            if (i >= 0) global.conns.splice(i, 1);
        }
    }, 60000);

    let handlerFile = await import('../handler.js');
    let creloadHandler = async function (restatConn) {
        try {
            const Handler = await import(`../handler.js?update=${Date.now()}`);
            if (Object.keys(Handler || {}).length) handlerFile = Handler;
        } catch (e) { console.error(e); }

        if (restatConn) {
            try { sock.ws.close(); } catch {}
            sock.ev.removeAllListeners();
            sock = makeWASocket(connectionOptions);
        }

        sock.handler = handlerFile.handler.bind(sock);
        sock.connectionUpdate = connectionUpdate.bind(sock);
        sock.credsUpdate = saveCreds.bind(sock, true);

        sock.ev.on("messages.upsert", sock.handler);
        sock.ev.on("connection.update", sock.connectionUpdate);
        sock.ev.on("creds.update", sock.credsUpdate);
        
        return true;
    };

    creloadHandler(false);
}

async function joinChannels(conn) {
    if (!global.ch) return;
    for (const channelId of Object.values(global.ch)) {
        await conn.newsletterFollow(channelId).catch(() => {});
    }
}
