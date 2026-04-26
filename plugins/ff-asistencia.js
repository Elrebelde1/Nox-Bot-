// Sistema de Asistencia Uchiha - Barboza Developer
let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.asistencia = conn.asistencia ? conn.asistencia : {}
    let id = m.chat

    // 1. ABRIR LA LISTA (Solo Admins)
    if (command === 'asistencia' || command === 'abrirlista') {
        if (conn.asistencia[id]) return m.reply('🛑 *𝙔𝙖 𝙝𝙖𝙮 𝙪𝙣𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙖.* 𝙐𝙨𝙖 *.𝙘𝙚𝙧𝙧𝙖𝙧𝙡𝙞𝙨𝙩𝙖* 𝙥𝙧𝙞𝙢𝙚𝙧𝙤.')
        
        conn.asistencia[id] = []
        let caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   📋  *𝙋𝘼𝙎𝙀 𝘿𝙀 𝘼𝙎𝙄𝙎𝙏𝙀𝙉𝘾𝙄𝘼* ╚════════════════════╝

¡𝙇𝙖 𝙡𝙞𝙨𝙩𝙖 𝙚𝙨𝙩𝙖́ 𝙖𝙗𝙞𝙚𝙧𝙩𝙖! 𝙏𝙞𝙚𝙣𝙚𝙣 𝙩𝙞𝙚𝙢𝙥𝙤 𝙥𝙖𝙧𝙖 𝙖𝙣𝙤𝙩𝙖𝙧𝙨𝙚.

📝 *𝘾𝙊𝙈𝘼𝙉𝘿𝙊:* ${usedPrefix}𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙚
⚠️ *𝘼𝙏𝙀𝙉𝘾𝙄𝙊́𝙉:* 𝙎𝙤𝙡𝙤 𝙪𝙣𝙖 𝙫𝙚𝙯 𝙥𝙤𝙧 𝙥𝙚𝙧𝙨𝙤𝙣𝙖.

*◈────────── • ☄️ • ──────────◈*
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂`

        return conn.reply(m.chat, caption, m)
    }

    // 2. DAR EL PRESENTE
    if (command === 'presente') {
        if (!conn.asistencia[id]) return m.reply('🛑 *𝙉𝙤 𝙝𝙖𝙮 𝙣𝙞𝙣𝙜𝙪𝙣𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙖 𝙚𝙣 𝙚𝙨𝙩𝙚 𝙢𝙤𝙢𝙚𝙣𝙩𝙤.*')
        
        let user = m.sender
        if (conn.asistencia[id].includes(user)) return m.reply('⚠️ *𝙔𝙖 𝙩𝙚 𝙖𝙣𝙤𝙩𝙖𝙨𝙩𝙚 𝙚𝙣 𝙡𝙖 𝙡𝙞𝙨𝙩𝙖.*')

        conn.asistencia[id].push(user)
        await m.react('✅')
        return m.reply(`✅ @${user.split('@')[0]} *𝙖𝙣𝙤𝙩𝙖𝙙𝙤 𝙚𝙣 𝙡𝙖 𝙡𝙞𝙨𝙩𝙖.*`, null, { mentions: [user] })
    }

    // 3. CERRAR Y MOSTRAR RESULTADOS
    if (command === 'cerrarlista' || command === 'verasistencia') {
        if (!conn.asistencia[id]) return m.reply('🛑 *𝙉𝙤 𝙝𝙖𝙮 𝙪𝙣𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙘𝙩𝙞𝙫𝙖.*')
        
        let lista = conn.asistencia[id]
        if (lista.length === 0) {
            delete conn.asistencia[id]
            return m.reply('❌ *𝙇𝙖 𝙡𝙞𝙨𝙩𝙖 𝙨𝙚 𝙘𝙚𝙧𝙧𝙤́ 𝙫𝙖𝙘𝙞́𝙖. 𝙉𝙖𝙙𝙞𝙚 𝙙𝙞𝙤 𝙚𝙡 𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙚.*')
        }

        let total = lista.length
        let textoAsistencia = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   📊  *𝙍𝙀𝙎𝙐𝙈𝙀𝙉 𝘿𝙀 𝙇𝙄𝙎𝙏𝘼* ╚════════════════════╝\n\n`
        
        lista.map((u, i) => {
            textoAsistencia += `${i + 1}. 👤 @${u.split('@')[0]}\n`
        })

        textoAsistencia += `\n✨ *𝙏𝙊𝙏𝘼𝙇 𝘼𝘾𝙏𝙄𝙑𝙊𝙎:* ${total}\n`
        textoAsistencia += `*◈────────── • ☄️ • ──────────◈*`

        await conn.sendMessage(m.chat, { text: textoAsistencia, mentions: lista }, { quoted: m })
        
        // Si el comando fue cerrar, borramos la lista de la memoria
        if (command === 'cerrarlista') delete conn.asistencia[id]
    }
}

handler.help = ['asistencia', 'presente', 'cerrarlista']
handler.tags = ['admin']
handler.command = /^(asistencia|abrirlista|presente|cerrarlista|verasistencia)$/i
handler.admin = true // Solo los admins del grupo pueden abrir/cerrar

export default handler
