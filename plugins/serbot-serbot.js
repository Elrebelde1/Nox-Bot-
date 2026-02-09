import { startModBot } from '../lib/mods.js'
import fs from 'fs'
import path from 'path'

let commandFlags = {}

let handler = async (m, { args, conn }) => {
    const client = conn 
    const prefa = ''
    const sender = m.sender
    const phone = sender.split('@')[0]

    // Ya no se requiere validar 'token' ni su existencia en la base de datos

    const basePath = path.join('./Sessions/Mods')
    const activeBots = fs.existsSync(basePath)
        ? fs.readdirSync(basePath).filter((dir) => {
            const credsPath = path.join(basePath, dir, 'creds.json')
            return fs.existsSync(credsPath)
        })
        : []

    // Verificamos si el usuario ya tiene una sesión activa en la carpeta de Mods
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

    const rtx = `✿ *Vincula el Socket usando el código QR.*\n\nSigue las instrucciones:\n✎ *Más opciones › Dispositivos vinculados › Vincular un nuevo dispositivo › Escanea el código QR.*\n\n_Recuerda que es recomendable no usar tu cuenta principal para registrar un socket._\n↺ El código es válido por 60 segundos.`
    const rtx2 = `✿ *Vincula el Socket usando el código de 8 dígitos.*\n\nSigue las instrucciones:\n✎ *Más opciones › Dispositivos vinculados › Vincular un nuevo dispositivo › Vincular con el número de teléfono › Introduce el código de 8 dígitos.*\n\n_Recuerda que es recomendable no usar tu cuenta principal para registrar un socket._\n↺ El código es válido por 60 segundos.`

    const body = m.body || m.text || ''
    // Detectamos si es codemod basándonos en el mensaje actual
    const isCode = m.text.toLowerCase().includes('codemod')
    const caption = isCode ? rtx2 : rtx

    await startModBot(m, client, caption, isCode, phone, m.chat, commandFlags, true)
}

handler.command = ['serbot', 'code']
handler.group = true

export default handler
