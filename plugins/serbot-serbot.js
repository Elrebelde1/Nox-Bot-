import { startModBot } from '../lib/mods.js'
import fs from 'fs'
import path from 'path'

let commandFlags = {}

let handler = async (m, { args, conn }) => {
    const client = conn 
    const sender = m.sender
    const phone = sender.split('@')[0]

    const basePath = path.join('./Sessions/Mods')
    const activeBots = fs.existsSync(basePath)
        ? fs.readdirSync(basePath).filter((dir) => {
            const credsPath = path.join(basePath, dir, 'creds.json')
            return fs.existsSync(credsPath)
        })
        : []

    // Verificamos si el usuario ya tiene una sesión activa
    const isConnected = activeBots.includes(phone)

    if (isConnected) {
        return client.reply(
            m.chat,
            `✐ Ya tienes una sesión activa de Bot Mod vinculada a tu número (@${phone}).`,
            m,
            { mentions: [sender] }
        )
    }

    commandFlags[m.sender] = true

    // Mensajes de instrucción
    const rtx = `✿ *Vincula el Bot usando el código QR.*\n\nSigue las instrucciones:\n✎ *Dispositivos vinculados › Vincular un dispositivo.*\n\n↺ El código es válido por 60 segundos.`
    const rtx2 = `✿ *Vincula el Bot usando el código de 8 dígitos.*\n\nSigue las instrucciones:\n✎ *Dispositivos vinculados › Vincular con el número de teléfono.*\n\n↺ El código es válido por 60 segundos.`

    const isCode = m.text.toLowerCase().includes('code')
    const caption = isCode ? rtx2 : rtx

    // Ejecutamos la función startModBot
    // Nota: Asegúrate de que tu función startModBot en '../lib/mods.js' 
    // acepte un callback o maneje el envío del mensaje final.
    
    try {
        await startModBot(m, client, caption, isCode, phone, m.chat, commandFlags, true)
        
        /* IMPORTANTE: El mensaje de "Bienvenido a la familia" normalmente 
           se debe enviar DESDE dentro de 'startModBot' cuando el evento 
           'connection.update' marca 'open'. 
           
           Si quieres que este comando lo confirme, lo ideal es que 
           el subbot recién creado envíe el mensaje al loguearse.
        */
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Ocurrió un error al intentar iniciar el subbot.')
    }
}

handler.command = ['serbot', 'code']
handler.group = true

export default handler
