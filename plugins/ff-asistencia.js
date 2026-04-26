// Sistema de Asistencia Uchiha - Barboza Developer
let handler = async (m, { conn, command, usedPrefix }) => {
    // Inicializamos el objeto global si no existe
    conn.asistencia = conn.asistencia ? conn.asistencia : {}
    let id = m.chat

    if (command === 'asistencia' || command === 'abrirlista') {
        if (conn.asistencia[id]) return m.reply(`🛑 *𝙔𝙖 𝙝𝙖𝙮 𝙪𝙣𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙖.*\n𝙐𝙨𝙖 *${usedPrefix}cerrarlista* 𝙥𝙖𝙧𝙖 𝙩𝙚𝙧𝙢𝙞𝙣𝙖𝙧𝙡𝙖.`)
        
        // Creamos la lista vacía
        conn.asistencia[id] = []
        
        let caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   📋  *𝙋𝘼𝙎𝙀 𝘿𝙀 𝘼𝙎𝙄𝙎𝙏𝙀𝙉𝘾𝙄𝘼* \n╚════════════════════╝\n\n¡𝙇𝙖 𝙡𝙞𝙨𝙩𝙖 𝙚𝙨𝙩𝙖́ 𝙖𝙗𝙞𝙚𝙧𝙩𝙖! 𝘼𝙣𝙤́𝙩𝙚𝙣𝙨𝙚 𝙮𝙖.\n\n📝 *𝘾𝙊𝙈𝘼𝙉𝘿𝙊:* ${usedPrefix}𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙚\n\n*◈────────── • ☄️ • ──────────◈*`
        return conn.reply(m.chat, caption, m)
    }

    if (command === 'presente') {
        if (!conn.asistencia[id]) return m.reply('🛑 *𝙉𝙤 𝙝𝙖𝙮 𝙣𝙞𝙣𝙜𝙪𝙣𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙖.*')
        
        let user = m.sender
        if (conn.asistencia[id].includes(user)) return m.reply('⚠️ *𝙔𝙖 𝙚𝙨𝙩𝙖́𝙨 𝙚𝙣 𝙡𝙖 𝙡𝙞𝙨𝙩𝙖.*')

        conn.asistencia[id].push(user)
        await m.react('✅')
        return m.reply(`✅ @${user.split('@')[0]} *𝘼𝙣𝙤𝙩𝙖𝙙𝙤.*`, null, { mentions: [user] })
    }

    if (command === 'cerrarlista' || command === 'verlista') {
        if (!conn.asistencia[id]) return m.reply('🛑 *𝙉𝙤 𝙝𝙖𝙮 𝙡𝙞𝙨𝙩𝙖 𝙖𝙘𝙩𝙞𝙫𝙖.*')
        
        let lista = conn.asistencia[id]
        if (lista.length === 0) {
            delete conn.asistencia[id]
            return m.reply('❌ *𝙇𝙖 𝙡𝙞𝙨𝙩𝙖 𝙨𝙚 𝙘𝙚𝙧𝙧𝙤́ 𝙫𝙖𝙘𝙞́𝙖.*')
        }

        let textoAsistencia = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   📊  *𝘼𝙎𝙄𝙎𝙏𝙀𝙉𝘾𝙄𝘼 𝙁𝙄𝙉𝘼𝙇* \n╚════════════════════╝\n\n`
        
        lista.forEach((u, i) => {
            textoAsistencia += `${i + 1}. 👤 @${u.split('@')[0]}\n`
        })

        textoAsistencia += `\n✨ *𝙏𝙊𝙏𝘼𝙇:* ${lista.length}\n*◈────────── • ☄️ • ──────────◈*`

        await conn.sendMessage(m.chat, { text: textoAsistencia, mentions: lista }, { quoted: m })
        
        if (command === 'cerrarlista') delete conn.asistencia[id]
    }
}

handler.help = ['asistencia', 'presente', 'cerrarlista']
handler.tags = ['clan']
handler.command = /^(asistencia|abrirlista|presente|cerrarlista|verlista)$/i

export default handler
