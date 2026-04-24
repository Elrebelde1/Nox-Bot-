import { rmSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
    // 1. REACCIÓN DE ESPERA
    if (m.react) await m.react('🧹')

    // 2. DEFINIR CARPETAS A LIMPIAR (Las más comunes en bots MD)
    const tmpDirs = [
        join(process.cwd(), 'tmp'),
        join(process.cwd(), 'temp'),
        join(process.cwd(), 'storage/temp') // Por si usas esta ruta
    ]

    let archivosBorrados = 0

    try {
        tmpDirs.forEach(dir => {
            if (readdirSync(dir)) {
                const files = readdirSync(dir)
                for (const file of files) {
                    // Evitamos borrar el archivo .gitignore si existe
                    if (file !== '.gitignore') {
                        rmSync(join(dir, file), { recursive: true, force: true })
                        archivosBorrados++
                    }
                }
            }
        })

        // 3. MENSAJE DE ÉXITO ESTILO UCHIHA
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙲𝙻𝙴𝙰𝙽𝙴𝚁* ♆ 〕─╮\n│\n`
        txt += `│ 🧹 *𝙻𝙸𝙼𝙿𝙸𝙴𝚉𝙰 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙰*\n`
        txt += `│ ✨ *𝙰𝚛𝚌𝚑𝚒𝚟𝚘𝚜 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚍𝚘𝚜:* ${archivosBorrados}\n`
        txt += `│ 🚀 *𝙴𝚜𝚝𝚊𝚍𝚘:* 𝙱𝚘𝚝 𝚘𝚙𝚝𝚒𝚖𝚒𝚣𝚊𝚍𝚘\n│\n`
        txt += `│ 🌑 "𝙻𝚊 𝚋𝚊𝚜𝚞𝚛𝚊 𝚑𝚊 𝚜𝚒𝚍𝚘 𝚋𝚘𝚛𝚛𝚊𝚍𝚊"\n╰────────────────────────────╯`

        await conn.sendMessage(m.chat, { 
            text: txt,
            footer: "By Barboza-Team ⚡",
            buttons: [
                { buttonId: `${usedPrefix}menu`, buttonText: { displayText: "🏠 Menú Principal" }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, `🛑 *Error:* No se pudo completar la limpieza.`, m)
    }
}

handler.help = ['cleartmp', 'clean']
handler.tags = ['owner'] // Lo pongo en owner porque es de mantenimiento
handler.command = /^(cleartmp|clean|limpiar|borrardatos)$/i
handler.rowner = true // Solo tú (el dueño) deberías poder usarlo

export default handler
