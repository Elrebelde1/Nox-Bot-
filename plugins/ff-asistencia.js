// Sistema de Asistencia Simple - Barboza Developer
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.asistencia = conn.asistencia ? conn.asistencia : {}
    let id = m.chat

    // 1. ABRIR ASISTENCIA
    if (command === 'asistencia') {
        conn.asistencia[id] = []
        
        let caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   📋  *𝙋𝘼𝙎𝙀 𝘿𝙀 𝘼𝙎𝙄𝙎𝙏𝙀𝙉𝘾𝙄𝘼* \n╚════════════════════╝\n\n1. \n2. \n3. \n4. \n5. \n6. \n\n📝 *𝙀𝙨𝙘𝙧𝙞𝙗𝙚:* ${usedPrefix}𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙚\n*◈────────── • ☄️ • ──────────◈*`
        return conn.reply(m.chat, caption, m)
    }

    // 2. ANOTARSE
    if (command === 'presente') {
        if (!conn.asistencia[id]) return m.reply('🛑 *𝙉𝙤 𝙝𝙖𝙮 𝙡𝙞𝙨𝙩𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙖.*')
        
        let user = m.sender
        if (conn.asistencia[id].includes(user)) return m.reply('⚠️ *𝙔𝙖 𝙚𝙨𝙩𝙖́𝙨 𝙖𝙣𝙤𝙩𝙖𝙙𝙤.*')

        conn.asistencia[id].push(user)
        await m.react('✅')
        return m.reply(`✅ @${user.split('@')[0]} *𝘼𝙣𝙤𝙩𝙖𝙙𝙤 𝙚𝙣 𝙡𝙖 𝙡𝙞𝙨𝙩𝙖.*`, null, { mentions: [user] })
    }

    // 3. VER LA LISTA
    if (command === 'lista') {
        if (!conn.asistencia[id] || conn.asistencia[id].length === 0) return m.reply('🛑 *𝙇𝙖 𝙡𝙞𝙨𝙩𝙖 𝙚𝙨𝙩𝙖́ 𝙫𝙖𝙘𝙞́𝙖 𝙤 𝙣𝙤 𝙝𝙖𝙮 𝙪𝙣𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙖.*')
        
        let lista = conn.asistencia[id]
        let textoAsistencia = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   📊  *𝙇𝙄𝙎𝙏𝘼 𝘼𝘾𝙏𝙐𝘼𝙇* \n╚════════════════════╝\n\n`
        
        // El bot va llenando los espacios según se anotan
        for (let i = 0; i < 6; i++) {
            if (lista[i]) {
                textoAsistencia += `${i + 1}. 👤 @${lista[i].split('@')[0]}\n`
            } else {
                textoAsistencia += `${i + 1}. \n`
            }
        }

        textoAsistencia += `\n*◈────────── • ☄️ • ──────────◈*`

        await conn.sendMessage(m.chat, { text: textoAsistencia, mentions: lista }, { quoted: m })
    }
}

handler.help = ['asistencia', 'presente', 'lista']
handler.tags = ['clan']
handler.command = /^(asistencia|presente|lista)$/i

export default handler
