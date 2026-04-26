// Sistema de Fichaje Uchiha - Barboza Developer
let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.fichas = conn.fichas ? conn.fichas : {}
    let user = m.sender

    // 1. LÓGICA DE BORRADO
    if (command === 'borrarficha' || command === 'eliminarperfil') {
        if (!conn.fichas[user]) return m.reply('🛑 *𝙉𝙤 𝙩𝙞𝙚𝙣𝙚𝙨 𝙣𝙞𝙣𝙜𝙪𝙣𝙖 𝙛𝙞𝙘𝙝𝙖 𝙧𝙚𝙜𝙞𝙨𝙩𝙧𝙖𝙙𝙖.*')
        
        delete conn.fichas[user]
        return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   🗑️  *𝙍𝙀𝙂𝙄𝙎𝙏𝙍𝙊 𝙀𝙇𝙄𝙈𝙄𝙉𝘼𝘿𝙊* \n╚════════════════════╝\n\n𝙏𝙪 𝙛𝙞𝙘𝙝𝙖 𝙝𝙖 𝙨𝙞𝙙𝙤 𝙗𝙤𝙧𝙧𝙖𝙙𝙖 𝙙𝙚𝙡 𝙨𝙞𝙨𝙩𝙚𝙢𝙖. 𝙔𝙖 𝙥𝙪𝙚𝙙𝙚𝙨 𝙧𝙚𝙜𝙞𝙨𝙩𝙧𝙖𝙧𝙩𝙚 𝙙𝙚 𝙣𝙪𝙚𝙫𝙤.`)
    }

    // 2. LÓGICA DE REGISTRO
    if (command === 'registrar' || command === 'fichar') {
        let [nombre, id, rango, rol] = text.split(',')
        if (!nombre || !id || !rango || !rol) return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ❌  *𝙀𝙍𝙍𝙊𝙍 𝘿𝙀 𝙍𝙀𝙂𝙄𝙎𝙏𝙍𝙊* \n╚════════════════════╝\n\n𝙈𝙚𝙩𝙚 𝙩𝙪𝙨 𝙙𝙖𝙩𝙤𝙨 𝙖𝙨𝙞́:\n${usedPrefix + command} 𝙉𝙤𝙢𝙗𝙧𝙚, 𝙄𝘿, 𝙍𝙖𝙣𝙜𝙤, 𝙍𝙤𝙡`)

        conn.fichas[user] = {
            nombre: nombre.trim(),
            id: id.trim(),
            rango: rango.trim(),
            rol: rol.trim(),
            fecha: new Date().toLocaleDateString()
        }

        return await enviarFicha(m, conn, user)
    }

    // 3. LÓGICA DE VER PERFIL
    if (command === 'mificha' || command === 'perfil') {
        if (!conn.fichas[user]) return m.reply(`🛑 *𝙉𝙤 𝙚𝙨𝙩𝙖́𝙨 𝙧𝙚𝙜𝙞𝙨𝙩𝙧𝙖𝙙𝙤.* 𝙐𝙨𝙖 𝙚𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${usedPrefix}𝙛𝙞𝙘𝙝𝙖𝙧* 𝙥𝙧𝙞𝙢𝙚𝙧𝙤.`)
        
        return await enviarFicha(m, conn, user)
    }
}

async function enviarFicha(m, conn, user) {
    let ficha = conn.fichas[user]
    let textoFicha = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   🥷🏻  *𝙁𝙄𝘾𝙃𝘼 𝘿𝙀 𝙂𝙐𝙀𝙍𝙍𝙀𝙍𝙊* ╚════════════════════╝

👤 *𝙉𝙊𝙈𝘽𝙍𝙀:* ${ficha.nombre}
🆔 *𝙄𝘿:* ${ficha.id}
🏆 *𝙍𝘼𝙉𝙂𝙊:* ${ficha.rango}
⚔️ *𝙍𝙊𝙇:* ${ficha.rol}
📅 *𝙐𝙉𝙄𝘿𝙊:* ${ficha.fecha}

*◈────────── • ☄️ • ──────────◈*
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 ✨`

    await conn.sendMessage(m.chat, { 
        image: { url: 'https://files.catbox.moe/qmmttw.jpg' }, 
        caption: textoFicha,
        footer: '𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂-𝑻𝒆𝒂𝒎 ⚡'
    }, { quoted: m })
}

handler.help = ['fichar', 'mificha', 'borrarficha']
handler.tags = ['clan']
handler.command = /^(fichar|registrar|mificha|perfil|borrarficha|eliminarperfil)$/i

export default handler
