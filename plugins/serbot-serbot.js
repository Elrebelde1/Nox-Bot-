const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
import { startSub, checkSubBots } from '../lib/resetsb.js';

await startSub();

setInterval(() => {
  checkSubBots();
}, 30000);

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

let rtx = `
╔═══『 🌀 𝚂𝙰𝚂𝚄𝙺𝙴 - 𝚀𝚁 』═══╗

🔗 *Conexión Sub-Bot Temporal (QR)*

📱 Escanea este código QR desde otro dispositivo
para vincularte como *Sub-Bot Temporal* en esta sesión.

🧭 Pasos ninja:
➤ ① Abre WhatsApp en otro celular o PC
➤ ② Ve a *Dispositivos vinculados*
➤ ③ Escanea el código QR

⏳ *Este código expira en 54 segundos*
¡Muévete como el viento, shinobi!
`;

let rtx2 = `
『 𝙲𝙾𝙳𝙸𝙶𝙾 𝟾 𝙳𝙸𝙶𝙸𝚃𝙾𝚂 』

🔐 *Conexión Sub-Bot Temporal (Código)*

📲 Usa este código de 8 dígitos para vincularte
como *Sub-Bot Temporal* en esta sesión.

🧭 Pasos A Seguir:
➤ ① Abre WhatsApp y ve a *Dispositivos vinculados*
➤ ② Selecciona *Vincular con número de teléfono*
➤ ③ Ingresa el código proporcionado

⚠ Si ya estás conectado en otra sesión,
se recomienda cerrarla para evitar errores o bloqueos.
`;

let imagenUrl = 'https://qu.ax/Ny958';
let emoji2 = '🍁';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const JBOptions = {}

if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (global.db?.data?.settings?.[conn.user.jid]?.jadibotmd === false) return m.reply(`♡ Comando desactivado temporalmente.`)
  
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws?.socket && conn.ws?.socket?.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length
  if (subBotsCount === 10000) {
    return m.reply(`${emoji2} No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  
  // Arreglo de variable 'jadi' si no existe globalmente
  let folderJadi = global.jadi || 'jadibots'
  let pathJadiBot = path.join(`./${folderJadi}/`, id)

  if (!fs.existsSync(pathJadiBot)){
    fs.mkdirSync(pathJadiBot, { recursive: true })
  }

  JBOptions.pathJadiBot = pathJadiBot
  JBOptions.m = m
  JBOptions.conn = conn
  JBOptions.args = args
  JBOptions.usedPrefix = usedPrefix
  JBOptions.command = command
  JBOptions.fromCommand = true
  
  await JadiBot(JBOptions)
  if (global.db?.data?.users?.[m.sender]) {
    global.db.data.users[m.sender].Subs = new Date * 1
  }
} 

handler.help = ['serbot','code']
handler.tags = ['serbot']
handler.command = ['serbot','code']
export default handler 

export async function JadiBot(options) {
  let { pathJadiBot, m, conn, args, usedPrefix, command } = options
  const mcode = command === 'code' ? true : args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
  
  if (command === 'code') {
    command = 'qr'; 
    args.unshift('code')
  }

  let txtCode, codeBot, txtQR
  if (mcode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "")?.trim()
    if (args[1]) args[1] = args[1]?.replace(/^--code$|^code$/, "")?.trim()
    if (args[0] == "") args[0] = undefined
  }

  const pathCreds = path.join(pathJadiBot, "creds.json")
  if (!fs.existsSync(pathJadiBot)){
    fs.mkdirSync(pathJadiBot, { recursive: true })
  }

  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    if (m?.chat) conn.reply(m.chat, `Use correctamente el comando » ${usedPrefix + command} code`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    let { version } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
      msgRetry,
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Bot(Sub Bot)', 'Chrome','2.0.0'],
      version: version,
      generateHighQualityLinkPreview: true
    };

    // Await agregado para resolver la Promesa de makeWASocket
    let sock = await makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false
      
      if (qr && !mcode) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx.trim(),
          }, { quoted: m })
        } else {
          return 
        }
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
        }
        return
      } 

      if (qr && mcode) {
        let secret = await sock.requestPairingCode(options.phoneNumber || (m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")

        if (options.fromCommand === false) {
          if (global.webResolve) global.webResolve(secret)
        }

        if (m?.chat) {
          txtCode = await conn.sendMessage(m.chat, {
            image: { url: imagenUrl },
            caption: rtx2,
            quoted: m,
          });
          codeBot = await conn.reply(m.chat, `${secret}`, m);
        }
        console.log(secret)
      }

      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
      }
      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (connection === 'close') {
        if (reason === 428 || reason === 408 || reason === 515) {
          await creloadHandler(true).catch(console.error)
        }
        if (reason === 405 || reason === 401 || reason === 403) {
          fs.rmdirSync(pathJadiBot, { recursive: true })
        }
        if (reason === 500) {
          return creloadHandler(true).catch(console.error)
        }
      }

      if (connection == `open`) {
        let userName = sock.authState?.creds?.me?.name || 'Sub-Bot'
        console.log(chalk.bold.cyanBright(`\n[SUB-BOT] ${userName} (+${path.basename(pathJadiBot)}) conectado.`))
        sock.isInit = true
        global.conns.push(sock)
        await joinChannels(sock)

        if (options.fromCommand) {
          m?.chat ? await conn.sendMessage(m.chat, { text: `@${m.sender.split('@')[0]}, sub-bot conectado exitosamente.`, mentions: [m.sender] }, { quoted: m }) : ''
        }
      }
    }

    let handlerModule = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handlerModule = Handler
      } catch (e) {
        console.error('⚠️ Error cargando handler: ', e)
      }
      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = await makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }
      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }

      sock.handler = handlerModule.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      isInit = false
      return true
    }
    creloadHandler(false)
  })
}

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60)
  return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
  if (!global.ch) return
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}

export async function assistant_accessJadiBot(opts) {
  return new Promise((resolve) => {
    global.webResolve = resolve;
    const subBotOptions = {
      pathJadiBot: path.join(`./${global.jadi || 'jadibots'}/`, opts.phoneNumber),
      m: null,
      conn: opts.conn,
      args: ['code'],
      usedPrefix: '/',
      command: 'code',
      fromCommand: false,
      phoneNumber: opts.phoneNumber
    };
    JadiBot(subBotOptions);
  });
}
