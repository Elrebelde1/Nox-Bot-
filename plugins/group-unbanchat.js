import { readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, isAdmin, isROwner }) => {
    // Verificación de permisos
    if (!(isAdmin || isROwner)) {
        if (global.dfail) return global.dfail('admin', m, conn)
        throw '⚠️ Este comando solo puede ser utilizado por *Administradores*.'
    }

    let chat = global.db.data.chats[m.chat]
    if (!chat.isBanned) return m.reply('✅ El bot ya está activo y operativo en este grupo.')

    // Cambiar estado a NO baneado
    chat.isBanned = false

    // Intentar leer la imagen del catálogo local
    let catalogoImg
    try {
        catalogoImg = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'))
    } catch (e) {
        // Enlace de respaldo si no se encuentra el archivo físico
        catalogoImg = 'https://files.catbox.moe/t7uytz.png'
    }

    let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ ✨ *BOT ACTIVADO* ✨\n`
    txt += `┃━━━━━━━━━━━━━━━━━━┃\n`
    txt += `┃ 📝 *Estado:* Operativo\n`
    txt += `┃ 🛡️ *Admin:* ${m.pushName}\n`
    txt += `┃ ✅ *Listo para usar*\n`
    txt += `┗━━━━━━━━━━━━━━━━━━┛`

    // Enviar mensaje con imagen y configuración de anuncio
    await conn.sendMessage(m.chat, {
        image: catalogoImg.length ? catalogoImg : { url: catalogoImg },
        caption: txt,
        contextInfo: {
            externalAdReply: {
                title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Sʏsᴛᴇᴍ',
                body: '🔋 Sistema Restaurado',
                sourceUrl: 'https://github.com/Barboza-Team',
                thumbnail: catalogoImg.length ? catalogoImg : { url: catalogoImg },
                mediaType: 1,
                showAdAttribution: true
            }
        }
    }, { quoted: m })

    await m.react('🔋')
}

handler.help = ['desbanearbot']
handler.tags = ['group']
handler.command = ['desbanearbot', 'unbanchat']
handler.group = true 

export default handler
