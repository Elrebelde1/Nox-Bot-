import MessageType from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import fs from "fs"

const fkontak = {
  key: {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
    fromMe: false,
    id: 'SasukeEmojiKitchen'
  },
  message: {
    contactMessage: {
      displayName: '⛩️ 𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 ⛩️\n🏮 _𝘑𝘶𝘵𝘴𝘶: 𝘍𝘶𝘴𝘪ó𝘯 𝘥𝘦 𝘌𝘮𝘰𝘫𝘪𝘴_',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sasuke;Uchiha;;;\nFN:⛩️ Sasuke Uchiha\nORG:Clan Uchiha\nTEL;type=CELL;type=VOICE;waid=1234567890:+1 234 567 890\nEND:VCARD`
    }
  }
}

const fetchJson = (url, options) => new Promise(async (resolve, reject) => {
  fetch(url, options)
    .then(response => response.json())
    .then(json => {
      resolve(json)
    })
    .catch((err) => {
      reject(err)
    })
})

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`🏮 *𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵* 🏮\n⚠️ _Ejemplo:_ *${usedPrefix + command}* 👁️‍🗨️+⚡`)
  
  let [emoji, emoji2] = text.split`+`
  let anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji)}_${encodeURIComponent(emoji2)}`)
  
  for (let res of anu.results) {
    let stiker = await sticker(false, res.url, global.packname, global.author)
    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: fkontak })
  }
}

handler.help = ['emojimix *<emoji+emoji>*']
handler.tags = ['sticker']
handler.command = ['emojimix'] 
handler.register = false

export default handler
