import { exec } from "child_process"

const handler = async (m, { conn }) => {
    const owner = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"

    try {
        await conn.sendMessage(m.chat, { react: { text: '🌀', key: m.key } })
    } catch {}

    await conn.sendMessage(m.chat, { text: '🌌 *NOX SYSTEM* ➔ Actualizando módulos del repositorio...' }, { quoted: m })

    exec('git pull', async (err, stdout, stderr) => {
        if (err) {
            try {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            } catch {}
            return conn.sendMessage(m.chat, { text: `🌌 *NOX ERROR* ➔ Fallo en la actualización.\n\n\`\`\`${err.message}\`\`\`` }, { quoted: m })
        }

        if (stdout.includes('Already up to date.')) {
            try {
                await conn.sendMessage(m.chat, { react: { text: '🌌', key: m.key } })
            } catch {}
            return conn.sendMessage(m.chat, { text: `🌌 *NOX SYSTEM* ➔ El sistema ya se encuentra en su versión más reciente.\n\n👑 ${owner}` }, { quoted: m })
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: '🌌', key: m.key } })
        } catch {}
        return conn.sendMessage(m.chat, { text: `🌌 *NOX SYSTEM* ➔ Actualización aplicada con éxito.\n\n*Cambios:*\n\`\`\`${stdout}\`\`\`\n\n👑 ${owner}` }, { quoted: m })
    })
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = /^(update|actualizar|fix)$/i
handler.rowner = true

export default handler
