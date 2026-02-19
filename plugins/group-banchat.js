import { readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, isAdmin, isROwner }) => {
    // Verificación de permisos
    if (!(isAdmin || isROwner)) {
        if (global.dfail) return global.dfail('admin', m, conn)
        throw '⚠️ Este comando solo puede ser utilizado por *Administradores*.'
    }

    let chat = global.db.data.chats[m.chat]
    if (chat.isBanned) return m.reply('🔒 El bot ya está desactivado en este grupo.')

    // Cambiar estado a baneado
    chat.isBanned = true

    // Intentar leer la imagen del catálogo local
    let catalogoImg
    try {
        catalogoImg = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'))
    } catch (e) {
        // Imagen de respaldo si no encuentra el archivo
        catalogoImg = 'https://files.catbox.moe/t7uytz.png'
    }

    let txt = `✨ *𝐄𝐒𝐓𝐀𝐃𝐎: 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎* ✨\n\n`
    txt += `*❒ Bot:* Sasuke Bot\n`
    txt += `*❒ Acción:* Chat Restringido\n`
    txt += `*❒ Nota:* El bot ya no responderá aquí hasta que un administrador use el comando de activación.\n\n`
    txt += `> 🥷 _Sesión finalizada en este sector._`

    // Enviar mensaje con la imagen del catálogo
    await conn.sendMessage(m.chat, {
        image: catalogoImg.length ? catalogoImg : { url: catalogoImg },
        caption: txt,
        contextInfo: {
            externalAdReply: {
                title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Sʏsᴛᴇᴍ',
                body: '🔒 Chat Restringido',
                sourceUrl: 'https://github.com/Barboza-Team',
                thumbnail: catalogoImg.length ? catalogoImg : { url: catalogoImg },
                mediaType: 1,
                showAdAttribution: true
            }
        }
    }, { quoted: m })

    await m.react('🔒')
}

handler.help = ['banearbot']
handler.tags = ['group']
handler.command = ['banearbot', 'banchat']
handler.group = true 
handler.owner = true;
export default handler
