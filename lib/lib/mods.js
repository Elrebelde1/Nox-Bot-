import pkg from '@whiskeysockets/baileys'
const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode
} = pkg
import pino from 'pino'
import fs from 'fs'
import chalk from 'chalk'
import qrcode from 'qrcode'
import { smsg } from './simple.js'
import moment from 'moment-timezone'

if (!global.conns) global.conns = []
let reintentos = {}

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

async function startModBot(
  m,
  client,
  caption = '',
  isCode = false,
  phone = '',
  chatId = '',
  commandFlags = {},
  isCommand = false,
) {
  const id = phone || (m?.sender || '').split('@')[0]
  const sessionFolder = `./ModSessions/${id}`
  const senderId = m?.sender

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: 'silent' })

  // console.info = () => {} 
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: ['Windows', 'Chrome'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    keepAliveIntervalMs: 45000,
    maxIdleTimeMs: 60000,
  })

  sock.isInit = false
  sock.ev.on('creds.update', saveCreds)
  // commandFlags[m.sender] = true

  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
    } else return jid
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) sock.isInit = false

    if (connection === 'open') {
      sock.isInit = true
      sock.userId = cleanJid(sock.user?.id?.split('@')[0])
      const botDir = sock.userId + '@s.whatsapp.net'
      if (!globalThis.db.data.settings[botDir]) {
        globalThis.db.data.settings[botDir] = {}
      }
      if (!globalThis.db.data.settings[botDir].botmod) {
        globalThis.db.data.settings[botDir].botmod = true
      }
      globalThis.db.data.settings[botDir].botmod = true
      globalThis.db.data.settings[botDir].botprem = false

globalThis.db.data.settings[botDir].type = 'Mod'

      if (!global.conns.find((c) => c.userId === sock.userId)) {
        global.conns.push(sock)
      }

if (m && client && isCommand && commandFlags[senderId]) {

client.sendMessage(m.chat, { text: `✎ Has conectado un nuevo Socket de tipo *Mod*.` }, { quoted: m })
delete commandFlags[senderId]

}

      delete reintentos[sock.userId || id]

console.log(chalk.gray(`[ ✿  ]  MOD-BOT conectado: ${sock.userId}`))

    }

    if (connection === 'close') {
      const botId = sock.userId || id
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0
      const intentos = reintentos[botId] || 0
      reintentos[botId] = intentos + 1

      if ([401, 403].includes(reason)) {
        if (intentos < 5) {
          console.log(
            chalk.gray(
              `[ ✿  ]  MOD-BOT ${botId} Conexión cerrada (código ${reason}) intento ${intentos}/5 → Reintentando...`,
            ),
          )
          setTimeout(() => {
            startModBot(m, client, caption, isCode, phone, chatId, {}, isCommand)
          }, 3000)
        } else {
          console.log(
            chalk.gray(`[ ✿  ]  MOD-BOT ${botId} Falló tras 5 intentos. Eliminando sesión.`),
          )
          try {
            fs.rmSync(sessionFolder, { recursive: true, force: true })
          } catch (e) {
            console.error(`[ ✿  ] No se pudo eliminar la carpeta ${sessionFolder}:`, e)
          }
          delete reintentos[botId]
        }
        return
      }

      if (
        [
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.timedOut,
          DisconnectReason.connectionReplaced,
        ].includes(reason)
      ) {
        // console.log(chalk.gray(`[ ✿  ]  MOD-BOT ${botId} desconectado → Reconectando...`))
        setTimeout(() => {
          startModBot(m, client, caption, isCode, phone, chatId, {}, isCommand)
        }, 3000)
        return
      }

      setTimeout(() => {
        startModBot(m, client, caption, isCode, phone, chatId, {}, isCommand)
      }, 3000)
    }

    if (qr && m && !isCode && client && commandFlags[senderId]) {
      try {
        const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 })
        const msg = await client.sendMessage(m.chat, { image: qrBuffer, caption }, { quoted: m })
        delete commandFlags[senderId]
        setTimeout(() => client.sendMessage(m.chat, { delete: msg.key }).catch(() => {}), 60000)
      } catch (err) {
        console.error('QR Error', err)
      }
    }

    if (qr && isCode && phone && client && chatId && commandFlags[senderId]) {
      try {
        let codeGen = await sock.requestPairingCode(phone, 'ABCD1234')
        const msg = await client.reply(chatId, caption, m)
        codeGen = codeGen.match(/.{1,4}/g)?.join('-')
        const code = await client.sendMessage(chatId, { text: codeGen }, { quoted: m })
        delete commandFlags[senderId]
        setTimeout(() => client.sendMessage(m.chat, { delete: msg.key }).catch(() => {}), 60000)
        setTimeout(() => client.sendMessage(m.chat, { delete: code.key }).catch(() => {}), 60000)
      } catch (err) {
        console.error('Código: ', err)
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (let raw of messages) {
      if (!raw.message) continue
      let msg = smsg(sock, raw)
      try {
       const handler = await import('../handler.js')
       handler.default(sock, msg, messages)
      } catch (err) {
        console.log(chalk.gray(`[ ❀  ]  Mod » ${err}`))
      }
    }
  })  

  process.on('uncaughtException', console.error)
  return sock
}

export { startModBot }