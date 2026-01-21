import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, isAdmin, isROwner }) => {
    // Verificación de permisos
    if (!(isAdmin || isROwner)) {
        if (global.dfail) return global.dfail('admin', m, conn)
        throw '⚠️ Este comando solo puede ser utilizado por *Administradores*.'
    }

    let chat = global.db.data.chats[m.chat]
    chat.isBanned = false // Aseguramos que se active

    // Gestión de la imagen del catálogo
    let catalogoImg
    const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
    
    if (existsSync(pathImg)) {
        catalogoImg = readFileSync(pathImg)
    } else {
        // Enlace de respaldo por si no encuentra la imagen en la carpeta
        catalogoImg = { url: 'https://files.catbox.moe/t7uytz.png' }
    }

    // Texto solicitado
    let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ ✨ *BOT YA ACTIVO* ✨\n`
    txt += `┃━━━━━━━━━━━━━━━━━━┃\n`
    txt += `┃ 📝 *Estado:* Operativo\n`
    txt += `┃ 🛡️ *Admin:* ${m.pushName}\n`
    txt += `┃ ✅ *Catálogo Actualizado*\n`
    txt += `┗━━━━━━━━━━━━━━━━━━┛\n\n`
    txt += `> *Use .menu para ver los comandos disponibles.*`

    // Envío limpio: Solo imagen y texto (sin publicidad de externalAdReply)
    await conn.sendMessage(m.chat, {
        image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url },
        caption: txt
    }, { quoted: m })

    await m.react('✅')
}

handler.help = ['desbanearbot']
handler.tags = ['group']
handler.command = ['desbanearbot', 'unbanchat']
handler.group = true 

export default handler
