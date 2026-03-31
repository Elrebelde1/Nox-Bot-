import { readFileSync } from 'fs'
import { join } from 'path'
import speed from 'performance-now'
import { exec } from 'child_process'

let handler = async (m, { conn }) => {
    // 1. Carga de la imagen de catálogo
    const img = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'))
    
    // 2. Cálculo de latencia
    let timestamp = speed()
    let latensi = speed() - timestamp

    // 3. Ejecución de Neofetch
    exec(`neofetch --stdout`, (error, stdout, stderr) => {
        let child = stdout.toString("utf-8")
        let info = child.replace(/Memory:/, "Ram:")
        
        // 4. Diseño del Mensaje (Sasuke Style)
        let doc = `
┏━━━━━━━『 𝐒𝐀𝐒𝐔𝐊𝐄 𝐁𝐎𝐓 』━━━━━━━┓
┃
┃  🚀 *LATENCIA:* ${latensi.toFixed(4)} ms
┃  👤 *CREADOR:* Barboza
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

『 📋 *ESTADO DEL SISTEMA* 』

${info}
        `.trim()

        // 5. Envío con la imagen solicitada
        conn.sendMessage(m.chat, { 
            image: img, 
            caption: doc 
        }, { quoted: m })
    })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'speed'] // Agregué speed como alias
handler.register = true

export default handler
