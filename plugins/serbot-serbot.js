import { startModBot } from '../../lib/mods.js'
import fs from 'fs'
import path from 'path'

let commandFlags = {}

let handler = async (m, { conn, command }) => {
    const client = conn
    const sender = m.sender
    const phone = sender.split('@')[0]

    const rtx = `✿ *Vincula el Socket usando el código QR.*\n\nSigue las instrucciones:\n✎ *Más opciones › Dispositivos vinculados › Vincular un nuevo dispositivo › Escanea el código QR.*\n\n_Recuerda que es recomendable no usar tu cuenta principal para registrar un socket._\n↺ El código es válido por 60 segundos.`
    const rtx2 = `✿ *Vincula el Socket usando el código de 8 dígitos.*\n\nSigue las instrucciones:\n✎ *Más opciones › Dispositivos vinculados › Vincular un nuevo dispositivo › Vincular con el número de teléfono › Introduce el código de 8 dígitos.*\n\n_Recuerda que es recomendable no usar tu cuenta principal para registrar un socket._\n↺ El código es válido por 60 segundos.`

    const isCode = command === 'codemod'
    const caption = isCode ? rtx2 : rtx

    commandFlags[m.sender] = true

    await startModBot(m, client, caption, isCode, phone, m.chat, commandFlags, true)
}

handler.command = ['qrmod', 'codemod']
handler.group = true

export default handler
