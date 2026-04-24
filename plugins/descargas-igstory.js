import { rmSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, usedPrefix, command }) => {
    if (m.react) await m.react('🧹')

    const tmpDirs = [
        join(process.cwd(), 'tmp'),
        join(process.cwd(), 'temp'),
        join(process.cwd(), 'storage/temp')
    ]

    let archivosBorrados = 0

    try {
        for (const dir of tmpDirs) {
            // Validamos si la carpeta existe antes de intentar leerla
            if (existsSync(dir)) {
                const files = readdirSync(dir)
                for (const file of files) {
                    if (file !== '.gitignore') {
                        try {
                            rmSync(join(dir, file), { recursive: true, force: true })
                            archivosBorrados++
                        } catch (e) {
                            // Si un archivo está siendo usado, lo ignora y sigue con el siguiente
                            continue 
                        }
                    }
                }
            }
        }

        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙲𝙻𝙴𝙰𝙽𝙴𝚁* ♆ 〕─╮\n│\n`
        txt += `│ 🧹 *𝙻𝙸𝙼𝙿𝙸𝙴𝚉𝙰 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙰*\n`
        txt += `│ ✨ *𝙰𝚛𝚌𝚑𝚒𝚟𝚘𝚜 𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚍𝚘𝚜:* ${archivosBorrados}\n`
        txt += `│ 🚀 *𝙴𝚜𝚝𝚊𝚍𝚘:* 𝚂𝚒𝚜𝚝𝚎𝚖𝚊 𝙾𝚙𝚝𝚒𝚖𝚒𝚣𝚊𝚍𝚘\n│\n`
        txt += `│ 🌑 "𝙻𝚊 𝚘𝚜𝚌𝚞𝚛𝚒𝚍𝚊𝚍 𝚜𝚎 𝚑𝚊 𝚒𝚍𝚘"\n╰────────────────────────────╯`

        await conn.sendMessage(m.chat, { 
            text: txt,
            footer: "By Barboza-Team ⚡",
            buttons: [{ buttonId: `${usedPrefix}menu`, buttonText: { displayText: "🏠 Menú" }, type: 1 }],
            headerType: 1
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.log("Error en limpieza: ", e)
        if (m.react) await m.react('❌')
        // Si borró algo antes del error, igual te avisa
        conn.reply(m.chat, `🛑 *Aviso:* Se limpiaron ${archivosBorrados} archivos, pero algunos estaban protegidos.`, m)
    }
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = /^(cleartmp|clean|limpiar)$/i
handler.rowner = true 

export default handler
