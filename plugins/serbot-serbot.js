import { startModBot } from '../../lib/mods.js'
import fs from 'fs'
import path from 'path'

let commandFlags = {}

let handler = async (m, { args, conn }) => {
    const client = conn 
    const token = args[0]
    const prefa = ''

    /*if (!token) return m.reply(`「✿」Si ya tienes un token mod, puedes registrar un *Bot* de tipo *Mod* usando los comandos:\n\n*✎ ${prefa}qrmod [Token]*\n*✎ ${prefa}codemod [Token]*\n\n> ✰ Para obtener un token, puedes visitar las siguientes paginas oficiales:\n> ❖ https://stellarwa.xyz\n> ❖ https://shadowwa.xyz`)

    if (token.length !== 8) return m.reply('《✧》 El token proporcionado no es válido, por favor verifícalo e inténtalo de nuevo.\n> ✎ Un token válido debe tener una longitud de 8 caracteres.')

    const tokenData = global.db.data.tokensmod?.[token]
    const now = Date.now()
    if (!tokenData) return m.reply(`《✧》 El token \`${token}\` especificado no se encuentra registrado, verifica que sea correcto y vuelve a intentarlo.`)
    if (tokenData.expires < now) return m.reply('《✧》 Este token ha expirado.')
*/

    const sender = m.sender
    const phone = sender.split('@')[0]

    const basePath = path.join('./Sessions/Mods')
    const activeBots = fs.existsSync(basePath)
        ? fs.readdirSync(basePath).filter((dir) => {
            const credsPath = path.join(basePath, dir, 'creds.json')
            return fs.existsSync(credsPath)
        })
        : []

    /* const activeUser = tokenData.active
    const activeNumber = activeUser?.split('@')[0]
    const isConnected = activeUser && activeBots.includes(activeNumber)
    const isSameUser = activeUser === sender

    if (activeUser) {
        if (isConnected && !isSameUser) {
            return client.reply(
                m.chat,
                `✐ Este token ya está siendo usado por otro bot activo: @${activeNumber}\n> Si crees que esto es un error o te han robado el token, contacta con un moderador.`,
                m,
                { mentions: [activeUser] }
            )
        }
        if (!isConnected && !isSameUser) {
            tokenData.active = sender
        }
    } else {
        tokenData.active = sender
    }
*/

    commandFlags[m.sender] = true

    const rtx = `✿ *Vincula el Socket usando el código QR.*\n\nSigue las instrucciones:\n✎ *Más opciones › Dispositivos vinculados › Vincular un nuevo dispositivo › Escanea el código QR.*\n\n_Recuerda que es recomendable no usar tu cuenta principal para registrar un socket._\n↺ El código es válido por 60 segundos.`
    const rtx2 = `✿ *Vincula el Socket usando el código de 8 dígitos.*\n\nSigue las instrucciones:\n✎ *Más opciones › Dispositivos vinculados › Vincular un nuevo dispositivo › Vincular con el número de teléfono › Introduce el código de 8 dígitos.*\n\n_Recuerda que es recomendable no usar tu cuenta principal para registrar un socket._\n↺ El código es válido por 60 segundos.`

    const body = m.body || m.text || ''
    const prefix = body.charAt(0)
    const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
    const isCode = /^(codemod)$/.test(command)
    const caption = isCode ? rtx2 : rtx

    await startModBot(m, client, caption, isCode, phone, m.chat, commandFlags, true)
}

handler.command = ['qrmod', 'codemod']
handler.group = true

export default handler