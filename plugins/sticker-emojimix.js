let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [emoji1, emoji2] = text.split(/[&+\s]+/)
    if (!emoji1 || !emoji2) return conn.reply(m.chat, `Uso correcto: ${usedPrefix + command} emoji1+emoji2\nEjemplo: ${usedPrefix + command} 😃+🔥`, m)

    let url = `https://api.evogb.org/tools/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}&key=sasuke`
    
    try {
        await conn.sendMessage(m.chat, { sticker: { url: url } }, { quoted: m })
    } catch (e) {
        conn.reply(m.chat, `Error al generar el sticker: ${e.message}`, m)
    }
}

handler.help = ['emojimix <emoji1>+<emoji2>']
handler.tags = ['fun']
handler.command = ['emojimix', 'mix']

export default handler
