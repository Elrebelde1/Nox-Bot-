// Sistema de Asistencia de Élite (15 Cupos) - Barboza Developer
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.asistencia = conn.asistencia ? conn.asistencia : {}
    let id = m.chat

    // 1. ABRIR ASISTENCIA (Prepara la lista del 1 al 15)
    if (command === 'asistencia') {
        conn.asistencia[id] = []
        
        let caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   📋  *𝙉𝙐𝙀𝙑𝘼 𝙇𝙄𝙎𝙏𝘼 𝘼𝘽𝙄𝙀𝙍𝙏𝘼* ╚════════════════════╝

𝙎𝙚 𝙝𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙤 𝙚𝙡 𝙧𝙚𝙜𝙞𝙨𝙩𝙧𝙤 𝙥𝙖𝙧𝙖 𝙡𝙤𝙨 15 𝙜𝙪𝙚𝙧𝙧𝙚𝙧𝙤𝙨.

📝 *𝙀𝙨𝙘𝙧𝙞𝙗𝙚:* ${usedPrefix}𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙚
📊 *𝘾𝙝𝙚𝙘𝙖 𝙡𝙖 𝙡𝙞𝙨𝙩𝙖:* ${usedPrefix}𝙡𝙞𝙨𝙩𝙖

*◈────────── • ☄️ • ──────────◈*`
        return conn.reply(m.chat, caption, m)
    }

    // 2. ANOTARSE (Guarda al usuario en la memoria)
    if (command === 'presente') {
        if (!conn.asistencia[id]) return m.reply('🛑 *𝙉𝙤 𝙝𝙖𝙮 𝙣𝙞𝙣𝙜𝙪𝙣𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙗𝙞𝙚𝙧𝙩𝙖.*')
        
        let user = m.sender
        if (conn.asistencia[id].includes(user)) return m.reply('⚠️ *𝙔𝙖 𝙚𝙨𝙩𝙖́𝙨 𝙖𝙣𝙤𝙩𝙖𝙙𝙤 𝙚𝙣 𝙡𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙘𝙩𝙪𝙖𝙡.*')
        if (conn.asistencia[id].length >= 15) return m.reply('🚫 *𝙇𝙖 𝙡𝙞𝙨𝙩𝙖 𝙮𝙖 𝙚𝙨𝙩𝙖́ 𝙡𝙡𝙚𝙣𝙖 (15/15).*')

        conn.asistencia[id].push(user)
        await m.react('✅')
        return m.reply(`✅ @${user.split('@')[0]} *𝙝𝙖 𝙙𝙖𝙙𝙤 𝙚𝙡 𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙚.*`, null, { mentions: [user] })
    }

    // 3. VER LA LISTA (Muestra los 15 espacios)
    if (command === 'lista') {
        if (!conn.asistencia[id]) return m.reply('🛑 *𝙉𝙤 𝙝𝙖𝙮 𝙪𝙣𝙖 𝙡𝙞𝙨𝙩𝙖 𝙖𝙘𝙩𝙞𝙫𝙖 𝙚𝙣 𝙚𝙨𝙩𝙚 𝙜𝙧𝙪𝙥𝙤.*')
        
        let lista = conn.asistencia[id]
        let textoAsistencia = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   📊  *𝙇𝙄𝙎𝙏𝘼 𝘿𝙀 𝘼𝙎𝙄𝙎𝙏𝙀𝙉𝘾𝙄𝘼* ╚════════════════════╝\n\n`
        
        // Genera visualmente los 15 espacios
        for (let i = 0; i < 15; i++) {
            if (lista[i]) {
                textoAsistencia += `${i + 1}. 👤 @${lista[i].split('@')[0]}\n`
            } else {
                textoAsistencia += `${i + 1}. \n`
            }
        }

        textoAsistencia += `\n✨ *𝘼𝙣𝙤𝙩𝙖𝙙𝙤𝙨:* ${lista.length} / 15`
        textoAsistencia += `\n*◈────────── • ☄️ • ──────────◈*`

        await conn.sendMessage(m.chat, { text: textoAsistencia, mentions: lista }, { quoted: m })
    }
}

// Breve explicación de los comandos para el menú de ayuda
handler.help = [
    'asistencia (Abre una lista nueva de 15 cupos)',
    'presente (Te anota en la lista activa)',
    'lista (Muestra quiénes se han anotado)'
]
handler.tags = ['clan']
handler.command = /^(asistencia|presente|lista)$/i

export default handler
