import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner }) => {
    // Inicializar la base de datos si no existe
    global.db.data.reglasClan = global.db.data.reglasClan || { texto: "⚠️ *No se han configurado reglas todavía.*" }

    // CONFIGURAR REGLAS (Solo Admins)
    if (command === 'setreglas') {
        if (!(isAdmin || isOwner)) return m.reply('❌ *Solo los administradores pueden usar este comando.*')
        if (!text) throw `⚠️ *Debes escribir las reglas que quieres guardar.*\n\n*Ejemplo:*\n${usedPrefix + command} 1. No ser tóxico\n2. No ser bobo`
        
        global.db.data.reglasClan.texto = text
        return m.reply('✅ *¡Reglamento guardado con éxito!*')
    }

    // BORRAR REGLAS (Solo Admins)
    if (command === 'borrareglas' || command === 'delreglas') {
        if (!(isAdmin || isOwner)) return m.reply('❌ *Solo los administradores pueden usar este comando.*')
        global.db.data.reglasClan.texto = "⚠️ *No se han configurado reglas todavía.*"
        return m.reply('🗑️ *El reglamento ha sido eliminado correctamente.*')
    }

    // MOSTRAR REGLAS (Cualquiera puede verlo)
    const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
    let menuImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' }

    let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
    txt += `   ⚔️  𝐑𝐄𝐆𝐋𝐀𝐌𝐄𝐍𝐓𝐎 𝐎𝐅𝐈𝐂𝐈𝐀𝐋  ⚔️\n`
    txt += `╚════════════════════╝\n\n`

    txt += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
    txt += `${global.db.data.reglasClan.texto}\n`
    txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

    txt += `*◈────────── • ☄️ • ──────────◈*\n`
    txt += `   ✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒊𝒔𝒄𝒊𝒑𝒍𝒊𝒏𝒂 𝒚 𝑮𝒍𝒐𝒓𝒊𝒂 ✨\n`
    txt += `*◈────────── • ☄️ • ──────────◈*`

    const fkontak = {
        "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Rules" },
        "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
        "participant": "0@s.whatsapp.net"
    }

    await conn.sendMessage(m.chat, { 
        image: menuImg, 
        caption: txt 
    }, { quoted: fkontak })
}

handler.help = ['reglas', 'setreglas', 'borrareglas']
handler.tags = ['clanes']
handler.command = /^(reglas|setreglas|borrareglas|delreglas|normas)$/i
handler.group = true

export default handler
