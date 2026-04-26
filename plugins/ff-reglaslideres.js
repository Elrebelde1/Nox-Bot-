import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
    // 1. Definir la ruta de la imagen
    const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
    
    // 2. Cargar imagen con validación para que no falle si no existe
    let menuImg
    if (existsSync(pathImg)) {
        menuImg = readFileSync(pathImg)
    } else {
        menuImg = { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' } // Imagen de respaldo
    }

    let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    txt += `   ⚔️  𝐑𝐄𝐆𝐋𝐀𝐒 𝐃𝐄 𝐋Í𝐃𝐄𝐑𝐄𝐒  ⚔️\n`
    txt += `╚════════════════════╝\n\n`

    txt += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ 📜 *CÓDIGO DE HONOR* \n`
    txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

    txt += `> 🥷🏻 *1. RESPETO ABSOLUTO:* Prohibido insultos entre líderes o a escuadras contrarias.\n\n`
    
    txt += `> 🏮 *2. PUNTUALIDAD:* Máximo 10 min de espera o se declara victoria por default.\n\n`
    
    txt += `> ⚡ *3. TRANSPARENCIA:* Cero uso de archivos (Reedit/Hacks). Se puede pedir grabación de pantalla.\n\n`
    
    txt += `> 🛡️ *4. RESPONSABILIDAD:* Cada líder responde por el comportamiento de sus jugadores.\n\n`
    
    txt += `> 🚫 *5. CERO TOXICIDAD:* Comportamientos antideportivos causarán baneo de próximos retos.\n\n`

    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `   ❗ *INCUMPLIR ES EXPULSIÓN* ❗\n`
    txt += `*◈────────── • ☄️ • ──────────◈*\n\n`

    txt += `✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒊𝒔𝒄𝒊𝒑𝒍𝒊𝒏𝒂 𝒚 𝑮𝒍𝒐𝒓𝒊𝒂 ✨`

    // Mensaje de contacto falso (fkontak)
    const fkontak = {
        "key": {
            "participants":"0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "ReglasLideres"
        },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    }

    // Enviar mensaje
    await conn.sendMessage(m.chat, { 
        image: menuImg, 
        caption: txt 
    }, { quoted: fkontak })
}

handler.help = ['reglaslideres']
handler.tags = ['freefire']
handler.command = /^(reglaslideres|reglas|lideres)$/i
handler.register = true

export default handler
