import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
    // Ruta de la imagen local con validación
    const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
    let menuImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' }

    let txt = `『 🎴 *𝐒𝐀𝐒𝐔𝐊𝐄 𝐁𝐎𝐓 | 𝐄𝐃𝐈𝐂𝐓𝐎* 🎴 』\n`
    txt += `\n*◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤*\n`
    txt += `  ⚔️ *ORDENANZA PARA LÍDERES* ⚔️\n`
    txt += `*◥◣◥◣◥◣◥◣◥◣◥◣◥◣◥◣◥◣*\n\n`

    txt += `│ 💠 *ESTATUTO I:* La palabra del líder es ley, pero la falta de respeto a la escuadra rival causa sanción inmediata.\n\n`
    
    txt += `│ 💠 *ESTATUTO II:* Puntualidad militar. 10 minutos de retraso y la victoria se entrega al oponente.\n\n`
    
    txt += `│ 💠 *ESTATUTO III:* Prohibido el uso de archivos externos, scripts o cualquier ventaja desleal. Honor ante todo.\n\n`
    
    txt += `│ 💠 *ESTATUTO IV:* El líder debe garantizar que sus jugadores estén correctamente registrados en la lista.\n\n`
    
    txt += `│ 💠 *ESTATUTO V:* Abandono de sala sin causa justificada resultará en veto permanente del clan.\n\n`

    txt += `*【 ❗ 】 EL INCUMPLIMIENTO ANULA LA GLORIA*\n\n`
    
    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `   ✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑺𝒖𝒑𝒓𝒆𝒎𝒂𝒄𝒊𝒂 𝑼𝒄𝒉𝒊𝒉𝒂 ✨\n`
    txt += `*◈────────── • ☄️ • ──────────◈*`

    const fkontak = {
        "key": {
            "participants":"0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "EdictoLider"
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

handler.help = ['liderazgo']
handler.tags = ['clanes']
handler.command = /^(liderazgo|edicto|lideres|bases)$/i
handler.register = true

export default handler
