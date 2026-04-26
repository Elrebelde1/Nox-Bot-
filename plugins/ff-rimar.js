// Generador de Rimas para Versus - Barboza Developer
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   🎤  *𝙂𝙀𝙉𝙀𝙍𝘼𝘿𝙊𝙍 𝘿𝙀 𝙍𝙄𝙈𝘼𝙎* \n╚════════════════════╝\n\n𝙋𝙤𝙣 𝙚𝙡 𝙣𝙤𝙢𝙗𝙧𝙚 𝙙𝙚𝙡 𝙘𝙡𝙖𝙣 𝙤 𝙟𝙪𝙜𝙖𝙙𝙤𝙧 𝙧𝙞𝙫𝙖𝙡.\n\n*𝙀𝙟𝙚𝙢𝙥𝙡𝙤:* ${usedPrefix + command} 𝙇𝙤𝙨 𝙈𝙖𝙣𝙘𝙤𝙨 𝙁𝙁`)

    await m.react('🎤')

    // Base de rimas y frases pesadas
    let rimas = [
        `Dice ${text} que son de la élite y que tienen nivel, pero en la primera sala los mandamos al hotel. 🏨`,
        `Mucho brillo en la skin y mucho emote de risa, pero contra mi escuadra ${text} se vuelve ceniza. 💨`,
        `A ${text} les falta manos y les sobra el internet, mejor retírense antes de que los pesque en la red. 🕸️`,
        `¿${text} contra nosotros? Esa es una misión suicida, los dejamos en el lobby buscando una salida. 🚪`,
        `Dicen que son los reyes, que tienen mucho clan, pero cuando ven a Sasuke todos se van. 🏃💨`,
        `Paredes de colores y ropa de diamante, pero ${text} corre cuando me tiene delante. 💎`,
        `No gasten sus salas, no pierdan el tiempo, que ganarle a ${text} es nuestro pasatiempo. 🕒`
    ]

    let rimaFinal = rimas[Math.floor(Math.random() * rimas.length)]

    let textoRima = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   🎤  *𝙇𝘼 𝙐𝘾𝙃𝙄𝙃𝘼 𝙍𝙄𝙈𝘼* ╚════════════════════╝

⚡ *𝙋𝘼𝙍𝘼:* ${text.toUpperCase()}

🎤 "${rimaFinal}"

*◈────────── • ☄️ • ──────────◈*
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 ✨`

    await conn.sendMessage(m.chat, { 
        text: textoRima,
        contextInfo: {
            externalAdReply: {
                title: '𝙎𝙖𝙨𝙪𝙠𝙚 𝙍𝙝𝙮𝙢𝙚𝙨 ⚡',
                body: `Humillando a: ${text}`,
                thumbnailUrl: 'https://files.catbox.moe/qmmttw.jpg',
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['rimar <nombre>']
handler.tags = ['diversion']
handler.command = /^(rimar|rima|verso)$/i

export default handler
