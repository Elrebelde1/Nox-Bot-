import { startModBot } from '../../lib/mods.js'
import fs from 'fs'
import path from 'path'

let commandFlags = {}

let handler = async (m, { conn, command }) => {
    const client = conn 
    const sender = m.sender
    const phone = sender.split('@')[0]

    const basePath = path.join('./Sessions/Mods')
    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true })

    const activeBots = fs.readdirSync(basePath).filter((dir) => {
        const credsPath = path.join(basePath, dir, 'creds.json')
        return fs.existsSync(credsPath)
    })

    const isConnected = activeBots.includes(phone)
    if (isConnected) {
        return client.reply(
            m.chat,
            `✐ Ya tienes una sesión activa (@${phone}).`,
            m,
            { mentions: [sender] }
        )
    }

    commandFlags[m.sender] = true

    const rtx = `✿ *Vincula por QR* ...`
    const rtx2 = `✿ *Vincula por Código* ...`

    // Cambiamos la lógica aquí para evitar errores de lectura
    const isCode = command === 'codemod'
    const caption = isCode ? rtx2 : rtx

    try {
        await startModBot(m, client, caption, isCode, phone, m.chat, commandFlags, true)
    } catch (e) {
        console.error(e)
        m.reply('❌ Ocurrió un error al intentar iniciar el bot.')
    }
}

handler.command = ['qrmod', 'codemod']
handler.group = true

export default handler
