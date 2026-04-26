import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
    // Ruta de la imagen local
    const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
    
    // Cargar imagen con respaldo por si falla la ruta
    let menuImg
    if (existsSync(pathImg)) {
        menuImg = readFileSync(pathImg)
    } else {
        menuImg = { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' } 
    }

    let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    txt += `   ⚔️  𝐁𝐀𝐒𝐄𝐒 𝐏𝐀𝐑𝐀 𝐋Í𝐃𝐄𝐑𝐄𝐒  ⚔️\n`
    txt += `╚════════════════════╝\n\n`

    txt += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ 📜 *REGLAMENTO OFICIAL* \n`
    txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

    txt += `> 🥷🏻 *1. RESPETO:* No se tolera toxicidad ni insultos en el chat de versus.\n\n`
    
    txt += `> 🏮 *2. ESPERA:* Máximo 10 minutos de tolerancia. Pasado el tiempo es victoria automática.\n\n`
    
    txt += `> ⚡ *3. LEGALIDAD:* Uso de hacks, macros o archivos es ban inmediato del clan.\n\n`
    
    txt += `> 🛡️ *4. ESPECIFICACIONES:* Solo se permiten los jugadores anotados en la lista oficial.\n\n`
    
    txt += `> 🚫 *5. DESCALIFICACIÓN:* Líder que abandone el versus sin terminar las salas, queda vetado.\n\n`

    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `   ❗ *EL HONOR ES NUESTRA LEY* ❗\n`
    txt += `*◈────────── • ☄️ • ──────────◈*\n\n`

    txt += `✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑳𝒂 𝒗𝒐𝒛 𝒅𝒆𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 ✨`

    // Mensaje de contacto falso
    const fkontak = {
        "key": {
            "participants":"0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "BasesLideres"
        },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    }

    await conn.sendMessage(m.chat, { 
        image: menuImg, 
        caption: txt 
    }, { quoted: fkontak })
}

handler.help = ['bases']
handler.tags = ['clanes']
handler.command = /^(bases|normas|reglaslider)$/i
handler.register = true

export default handler
