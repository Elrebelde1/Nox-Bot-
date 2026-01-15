let handler = async (m, { conn, text, command }) => {
let id = text ? text : m.chat  
let chat = global.db.data.chats[m.chat]

// Desactivar bienvenida temporalmente para que no se bugee al salir
chat.welcome = false

let videoUrl = 'https://files.catbox.moe/ywgm94.mp4'

try {
    // Enviar el video con el mensaje como subtítulo (caption)
    await conn.sendMessage(id, { 
        video: { url: videoUrl }, 
        caption: `🚩 *sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀*\n\nAbandona El Grupo, Fué Genial Estar Aquí 👋` 
    })

    // Salir del grupo
    await conn.groupLeave(id)
    
} catch (e) {
    // Si algo falla, reactivamos la bienvenida y avisamos
    chat.welcome = true
    await m.reply(`❌ Ocurrió un error al intentar salir.`)
    console.log(e)
}
}

handler.command = /^(salir|leavegc|salirdelgrupo|leave)$/i
handler.group = true
handler.rowner = true

export default handler
