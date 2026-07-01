import { exec } from "child_process"

const handler = async (m, { conn }) => {
    const owner = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"

    if (m.react) await m.react('🌀')

    await conn.reply(m.chat, '🌌 *NOX SYSTEM* ➔ Actualizando módulos del repositorio...', m)

    exec('git pull', async (err, stdout, stderr) => {
        if (err) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🌌 *NOX ERROR* ➔ Fallo en la actualización.\n\n\`\`\`${err.message}\`\`\``, m)
        }

        if (stdout.includes('Already up to date.')) {
            if (m.react) await m.react('🌌')
            return conn.reply(m.chat, `🌌 *NOX SYSTEM* ➔ El sistema ya se encuentra en su versión más reciente.\n\n👑 ${owner}`, m)
        }

        if (m.react) await m.react('🌌')
        return conn.reply(m.chat, `🌌 *NOX SYSTEM* ➔ Actualización aplicada con éxito.\n\n*Cambios:*\n\`\`\`${stdout}\`\`\`\n\n👑 ${owner}`, m)
    })
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = /^(update|actualizar)$/i
handler.rowner = true

export default handler
