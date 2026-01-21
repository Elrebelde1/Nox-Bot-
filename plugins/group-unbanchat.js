import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, isAdmin, isROwner }) => {
    // 1. Verificación de permisos
    if (!(isAdmin || isROwner)) {
        if (global.dfail) return global.dfail('admin', m, conn)
        throw '⚠️ Este comando solo puede ser utilizado por *Administradores*.'
    }

    let chat = global.db.data.chats[m.chat]
    
    // 2. Lógica de activación (Cambiamos el return por un aviso visual)
    let yaEstabaActivo = !chat.isBanned
    chat.isBanned = false

    // 3. Gestión de la imagen (Segura)
    let catalogoImg
    const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
    
    if (existsSync(pathImg)) {
        catalogoImg = readFileSync(pathImg)
    } else {
        catalogoImg = { url: 'https://files.catbox.moe/t7uytz.png' }
    }

    // 4. Construcción del mensaje
    let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ ✨ *${yaEstabaActivo ? 'BOT YA ACTIVO' : 'BOT ACTIVADO'}* ✨\n`
    txt += `┃━━━━━━━━━━━━━━━━━━┃\n`
    txt += `┃ 📝 *Estado:* Operativo\n`
    txt += `┃ 🛡️ *Admin:* ${m.pushName}\n`
    txt += `┃ ✅ *Catálogo Actualizado*\n`
    txt += `┗━━━━━━━━━━━━━━━━━━┛\n\n`
    txt += `> *Use .menu para ver los comandos disponibles.*`

    // 5. Envío del mensaje con catálogo
    await conn.sendMessage(m.chat, {
        image: catalogoImg.buffer ? catalogoImg : (catalogoImg.url ? { url: catalogoImg.url } : catalogoImg),
        caption: txt,
        contextInfo: {
            externalAdReply: {
                title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Sʏsᴛᴇᴍ',
                body: '🔋 Catálogo de Servicios',
                sourceUrl: 'https://github.com/Barboza-Team',
                thumbnail: catalogoImg.buffer ? catalogoImg : (catalogoImg.url ? { url: catalogoImg.url } : catalogoImg),
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true // Hace que el catálogo se vea mejor
            }
        }
    }, { quoted: m })

    await m.react(yaEstabaActivo ? '✅' : '🔋')
}

handler.help = ['desbanearbot']
handler.tags = ['group']
handler.command = ['desbanearbot', 'unbanchat']
handler.group = true 

export default handler
