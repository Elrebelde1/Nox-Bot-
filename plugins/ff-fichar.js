// Sistema de Fichaje Uchiha - Barboza Developer
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Estructura de la base de datos (se guarda en el bot)
    conn.fichas = conn.fichas ? conn.fichas : {}
    let user = m.sender

    if (command === 'registrar' || command === 'fichar') {
        let [nombre, id, rango, rol] = text.split(',')
        if (!nombre || !id || !rango || !rol) return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ❌  *𝙀𝙍𝙍𝙊𝙍 𝘿𝙀 𝙍𝙀𝙂𝙄𝙎𝙏𝙍𝙊* \n╚════════════════════╝\n\n𝙈𝙚𝙩𝙚 𝙩𝙪𝙨 𝙙𝙖𝙩𝙤𝙨 𝙖𝙨𝙞́:\n${usedPrefix + command} 𝙉𝙤𝙢𝙗𝙧𝙚, 𝙄𝘿, 𝙍𝙖𝙣𝙜𝙤, 𝙍𝙤𝙡\n\n*𝙀𝙟𝙚𝙢𝙥𝙡𝙤:* ${usedPrefix + command} 𝙎𝙖𝙨𝙪𝙠𝙚𝙁𝙁, 54321, 𝙃𝙚𝙧𝙤𝙞𝙘𝙤, 𝙍𝙪𝙨𝙝`)

        conn.fichas[user] = {
            nombre: nombre.trim(),
            id: id.trim(),
            rango: rango.trim(),
            rol: rol.trim(),
            fecha: new Date().toLocaleDateString()
        }

        return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ✅  *𝙁𝙄𝘾𝙃𝘼𝙅𝙀 𝘾𝙊𝙈𝙋𝙇𝙀𝙏𝘼𝘿𝙊* \n╚════════════════════╝\n\n¡𝘽𝙞𝙚𝙣𝙫𝙚𝙣𝙞𝙙𝙤 𝙖 𝙡𝙖 𝙀𝙡𝙞𝙩𝙚, *${nombre.trim()}*!`)
    }

    if (command === 'mificha' || command === 'perfil') {
        let ficha = conn.fichas[user]
        if (!ficha) return m.reply(`🛑 *𝙉𝙤 𝙚𝙨𝙩𝙖́𝙨 𝙧𝙚𝙜𝙞𝙨𝙩𝙧𝙖𝙙𝙤.* 𝙐𝙨𝙖 𝙚𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 *${usedPrefix}𝙛𝙞𝙘𝙝𝙖𝙧* 𝙥𝙧𝙞𝙢𝙚𝙧𝙤.`)

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
}

handler.help = ['fichar', 'mificha']
handler.tags = ['clan']
handler.command = /^(fichar|registrar|mificha|perfil)$/i

export default handler
