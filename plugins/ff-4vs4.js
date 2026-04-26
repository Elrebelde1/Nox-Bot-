import fg from 'api-dylux'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, args, command, usedPrefix}) => {
  if (!args[0]) throw `
╭─❍ *🔱 RETO 4 VS 4 🔱*
│
│⏳ *Horario:*
│🇲🇽 MÉXICO:
│🇨🇴 COLOMBIA:
│
│🎮 *Modalidad:*
│👥 *Jugadores:*
│
│🏆 *Escuadra 1:*
│   👑 •
│   🥷🏻 •
│   🥷🏻 •
│   🥷🏻 •
│
│🧱 *Suplentes:*
│   🥷🏻 •
│   🥷🏻 •
╰───────────────❍
`

  const fkontak = {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'AlienMenu'
    },
    message: {
      locationMessage: {
        name: '🛸 INVOCACIÓN GRUPAL | Sasuke Bot MD',
        jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer(),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Sasuke;;;\nFN:Sasuke Bot\nORG:Kaneki Developers\nEND:VCARD'
      }
    }
  }

  // Enviar mensaje de texto inicial
  await conn.sendMessage(m.chat, {
    text: '🎯 *Reto grupal activo | Sasuke Bot MD*',
  }, { quoted: fkontak})

  // Mensaje visual principal (La lista 4vs4)
  // Guardamos el mensaje enviado en una variable 'sent'
  const sent = await conn.sendMessage(m.chat, {
    image: { url: 'https://cdn.russellxz.click/16b3faeb.jpeg'},
    caption: `╭─❍ *4 VS 4 | RETO SASUKE* 🔥\n│\n│⏳ *Horario:*\n│🇲🇽 MÉXICO: ${args[0]}\n│🇨🇴 COLOMBIA: ${args[0]}\n│\n│🎮 *Modalidad:*\n│👥 *Jugadores:*\n│\n│🏆 *Escuadra 1:*\n│   👑 • \n│   🥷🏻 • \n│   🥷🏻 • \n│   🥷🏻 • \n│\n│🧱 *Suplentes:*\n│   🥷🏻 • \n│   🥷🏻 • \n╰───────────────❍`,
    mentions: []
  }, { quoted: fkontak})

  // --- LÓGICA DE REACCIÓN AUTOMÁTICA AL PROPIO MENSAJE ---
  // Reaccionamos con el corazón (Titular) y el pulgar (Suplente)
  // Usamos un pequeño delay para que no sea instantáneo y parezca más natural
  
  setTimeout(async () => {
      // Reacción de ❤️
      await conn.sendMessage(m.chat, { 
          react: { text: "❤️", key: sent.key } 
      })
      
      // Reacción de 👍 (opcional, puedes poner ambas o elegir una)
      await conn.sendMessage(m.chat, { 
          react: { text: "👍", key: sent.key } 
      })
  }, 1500) 
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true

export default handler
