import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let rtx = `
╔═══『 🌀 𝚂𝙰𝚂𝚄𝙺𝙴 - 𝚀𝚁 』═══╗

🔗 *Conexión Sub-Bot Temporal (QR)*

📱 Escanea este código QR desde otro dispositivo
para vincularte como *Sub-Bot Temporal*.

➤ ① Abre WhatsApp en tu celular principal
➤ ② Ve a *Dispositivos vinculados* -> *Vincular dispositivo*
➤ ③ Escanea este código QR
`;

let rtx2 = `
『 𝙲𝙾𝙳𝙸𝙶𝙾 𝟾 𝙳𝙸𝙶𝙸𝚃𝙾𝚂 』

🔐 *Conexión Sub-Bot Temporal (Código)*

📲 Usa este código de 8 dígitos para vincularte:
`;

let imagenUrl = 'https://qu.ax/Ny958';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!global.conns) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let user = m.sender.split('@')[0]
  let folderJadi = global.jadi || 'jadibots'
  let pathJadiBot = path.join(`./${folderJadi}/`, user)

  if (!fs.existsSync(pathJadiBot)){
    fs.mkdirSync(pathJadiBot, { recursive: true })
  }

  let mcode = command === 'code' || (args[0] && args[0].includes('code'))
  
  await JadiBot({
    pathJadiBot,
    m,
    conn,
    args,
    usedPrefix,
    command: mcode ? 'code' : 'serbot',
    phoneNumber: user
  })
} 

handler.help = ['serbot', 'code']
handler.tags = ['serbot']
handler.command = ['serbot', 'code']
export default handler 

export async function JadiBot(options) {
  let { pathJadiBot, m, conn, args, usedPrefix, command, phoneNumber } = options
  let mcode = command === 'code' || (args[0] && args[0].includes('code'))

  const pathCreds = path.join(pathJadiBot, "creds.json")
  if (!fs.existsSync(pathJadiBot)){
    fs.mkdirSync(pathJadiBot, { recursive: true })
  }

  try {
    let { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { 
        creds: state.creds, 
        keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
      },
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Bot(Sub Bot)', 'Chrome', '2.0.0'],
      version: version,
      generateHighQualityLinkPreview: true
    };

    let sock = await makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, qr } = update
      
      if (qr && !mcode) {
        if (m?.chat) {
          let qrBuffer = await qrcode.toBuffer(qr, { scale: 8 })
          await conn.sendMessage(m.chat, { image: qrBuffer, caption: rtx.trim() }, { quoted: m })
        }
        return
      } 

      if (qr && mcode) {
        try {
          let secret = await sock.requestPairingCode(phoneNumber)
          secret = secret?.match(/.{1,4}/g)?.join("-") || secret
          
          if (m?.chat) {
            await conn.sendMessage(m.chat, { image: { url: imagenUrl }, caption: rtx2, quoted: m })
            await conn.reply(m.chat, `*${secret}*`, m)
          }
        } catch (e) {
          console.error("Error pidiendo código de emparejamiento:", e)
          if (m?.chat) conn.reply(m.chat, "⚠️ Error al generar el código de 8 dígitos. Intenta de nuevo.", m)
        }
      }

      if (connection === 'close') {
        let reason = lastDisconnect?.error?.output?.statusCode
        if (reason && reason !== DisconnectReason.loggedOut) {
          console.log(chalk.yellow(`[RECONECTANDO SUB-BOT] Razón: ${reason}`))
          setTimeout(() => creloadHandler(true), 5000)
        }
      }

      if (connection === 'open') {
        console.log(chalk.cyanBright(`[SUB-BOT CONECTADO] (+${phoneNumber}))`))
        sock.isInit = true
        if (!global.conns.includes(sock)) global.conns.push(sock)

        if (m?.chat) {
          await conn.sendMessage(m.chat, { text: `✅ ¡Conectado exitosamente como Sub-Bot!`, mentions: [m.sender] }, { quoted: m })
        }
      }
    }

    let handlerModule = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Handler && Object.keys(Handler).length) handlerModule = Handler
      } catch (e) {
        console.error('Error recargando handler:', e)
      }

      if (restatConn) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        sock = await makeWASocket(connectionOptions)
      }

      sock.ev.off("messages.upsert", sock.handler || (() => {}))
      sock.ev.off("connection.update", sock.connectionUpdate || (() => {}))
      sock.ev.off('creds.update', sock.credsUpdate || (() => {}))

      sock.handler = handlerModule.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock)

      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
    }

    await creloadHandler(false)

  } catch (e) {
    console.error("Error general en JadiBot:", e)
    if (m?.chat) conn.reply(m.chat, "⚠️ Ocurrió un error al iniciar el proceso de Sub-Bot.", m)
  }
}
