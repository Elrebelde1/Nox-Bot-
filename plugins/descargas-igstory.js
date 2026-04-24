import { rmSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
    if (m.react) await m.react('🧹')

    // Agregué más rutas que suelen llenarse de basura en los bots MD
    const tmpDirs = [
        join(process.cwd(), 'tmp'),
        join(process.cwd(), 'temp'),
        join(process.cwd(), 'storage/temp'),
        join(process.cwd(), 'sessions'), // A veces se guardan archivos basura aquí
        join(process.cwd(), 'src/tmp')   // Otra ruta común
    ]

    let archivosBorrados = 0

    try {
        for (const dir of tmpDirs) {
            if (existsSync(dir)) {
                const files = readdirSync(dir)
                for (const file of files) {
                    // NO BORRAR la sesión real ni archivos críticos
                    if (file !== '.gitignore' && file !== 'creds.json' && !file.includes('app-state')) {
                        try {
                            rmSync(join(dir, file), { recursive: true, force: true })
                            archivosBorrados++
                        } catch (e) {
                            continue 
                        }
                    }
                }
            }
        }

        if (archivosBorrados === 0) {
            return conn.reply(m.chat, '✨ *El bot ya está limpio.* No se encontraron archivos temporales para eliminar.', m)
        }

        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙲𝙻𝙴𝙰𝙽𝙴𝚁* ♆ 〕─╮\n│\n`
        txt += `│ 🧹 *𝙻𝙸𝙼𝙿𝙸𝙴𝚉𝙰 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙰*\n`
        txt += `│ ✨ *𝙰𝚛𝚌𝚑𝚒𝚟𝚘𝚜 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚍𝚘𝚜:* ${archivosBorrados}\n`
        txt += `│ 🚀 *𝙴𝚜𝚝𝚊𝚍𝚘:* 𝚂𝚒𝚜𝚝𝚎𝚖𝚊 𝙾𝚙𝚝𝚒𝚖𝚒𝚣𝚊𝚍𝚘\n│\n`
        txt += `│ 🌑 "𝙻𝚊 𝚋𝚊𝚜𝚞𝚛𝚊 𝚑𝚊 𝚜𝚒𝚍𝚘 𝚍𝚎𝚜𝚝𝚛𝚞𝚒𝚍𝚊"\n╰────────────────────────────╯`

        await conn.sendMessage(m.chat, { 
            text: txt,
            footer: "By Barboza-Team ⚡"
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.log(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, `🛑 *Error:* Ocurrió un fallo durante la limpieza.`, m)
    }
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = /^(cleartmp|clean|limpiar)$/i
handler.rowner = true 

export default handler
