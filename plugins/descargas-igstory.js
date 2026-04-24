const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚁𝙴𝙼𝙸𝙽𝙳𝙴𝚁* ♆ 〕─╮\n│\n`
        txt += `│ ⏰ *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n`
        txt += `│ ${usedPrefix + command} [mensaje] | [tiempo]\n│\n`
        txt += `│ 💡 *𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* \n`
        txt += `│ ${usedPrefix + command} voy a dormir | 10 minutos\n│\n`
        txt += `│ 🌑 "𝙹𝚊𝚖á𝚜 𝚘𝚕𝚟𝚒𝚍𝚎𝚜 𝚝𝚞 𝚍𝚎𝚜𝚝𝚒𝚗𝚘"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    let [mensaje, tiempoText] = text.split('|').map(v => v.trim().toLowerCase())
    
    // Lógica mejorada para detectar tiempo
    let milisegundos = 0
    let valor = parseInt(tiempoText)

    if (tiempoText.includes('segundo') || tiempoText.endsWith('s')) {
        milisegundos = valor * 1000
    } else if (tiempoText.includes('minuto') || tiempoText.endsWith('m')) {
        milisegundos = valor * 60000
    } else if (tiempoText.includes('hora') || tiempoText.endsWith('h')) {
        milisegundos = valor * 3600000
    } else {
        // Si solo puso el número, asumimos minutos
        milisegundos = valor * 60000
    }

    if (isNaN(milisegundos) || milisegundos <= 0) return m.reply('❌ Tiempo inválido. Usa: 10 minutos, 1 hora, etc.')

    if (m.react) await m.react('⏳')
    
    m.reply(`✅ *Recordatorio programado*\n\n🔔 *Motivo:* ${mensaje}\n⏱️ *En:* ${tiempoText}\n\n*Te mencionaré cuando el tiempo termine.*`)

    setTimeout(async () => {
        let tag = `@${m.sender.split('@')[0]}`
        let alerta = `╭─〔 🔔 *𝙰𝙻𝙴𝚁𝚃𝙰 𝚄𝙲𝙷𝙸𝙷𝙰* 🔔 〕─╮\n│\n`
        alerta += `│ 👤 *𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${tag}\n`
        alerta += `│ 📝 *𝙼𝙴𝙽𝚂𝙰𝙹𝙴:* ${mensaje}\n│\n`
        alerta += `│ 🌑 "𝙴𝚕 𝚝𝚒𝚎𝚖𝚙𝚘 𝚜𝚎 𝚑𝚊 𝚌𝚞𝚖𝚙𝚕𝚒𝚍𝚘"\n╰──────────────────────────╯`

        await conn.sendMessage(m.chat, { 
            text: alerta, 
            mentions: [m.sender] 
        }, { quoted: m })
        
        if (m.react) await m.react('🔔')
    }, milisegundos)
}

handler.help = ['recordar']
handler.tags = ['tools']
handler.command = /^(recordar|remind|alarm)$/i

export default handler
