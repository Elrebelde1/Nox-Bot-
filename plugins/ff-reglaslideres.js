import { readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
    // Cargar imagen local (miniurl.jpg)
    let menuImg
    try {
        menuImg = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'))
    } catch {
        menuImg = { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' }
    }

    let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    txt += `   ⚔️  𝐑𝐄𝐆𝐋𝐀𝐒 𝐃𝐄 𝐋Í𝐃𝐄𝐑𝐄𝐒  ⚔️\n`
    txt += `╚════════════════════╝\n\n`

    txt += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ 📜 *CÓDIGO DE HONOR* \n`
    txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

    txt += `> 🥷🏻 *1. RESPETO ABSOLUTO:* No insultos entre líderes ni a la escuadra contraria.\n\n`
    
    txt += `> 🏮 *2. PUNTUALIDAD:* Líder que no tenga su escuadra lista en 10 min, pierde por default.\n\n`
    
    txt += `> ⚡ *3. TRANSPARENCIA:* Prohibido el uso de archivos (Reedit/Hacks). Si hay duda, se pide grabación.\n\n`
    
    txt += `> 🛡️ *4. LIDERAZGO:* El líder es responsable del comportamiento de sus 4 u 8 jugadores.\n\n`
    
    txt += `> 🚫 *5. TÓXICOS:* Cero toxicidad en el grupo de versus o serán baneados de futuros retos.\n\n`

    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `   ❗ *INCUMPLIR ES EXPULSIÓN* ❗\n`
    txt += `*◈────────── • ☄️ • ──────────◈*\n\n`

    txt += `✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒊𝒔𝒄𝒊𝒑𝒍𝒊𝒏𝒂 𝒚 𝑮𝒍𝒐𝒓𝒊𝒂 ✨`

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
