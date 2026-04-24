const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. VALIDAR EL FORMATO (.recordar mensaje | tiempo)
    if (!text || !text.includes('|')) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚁𝙴𝙼𝙸𝙽𝙳𝙴𝚁* ♆ 〕─╮\n│\n`
        txt += `│ ⏰ *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n`
        txt += `│ ${usedPrefix + command} [mensaje] | [tiempo]\n│\n`
        txt += `│ 💡 *𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* \n`
        txt += `│ ${usedPrefix + command} voy a comer | 10m\n│\n`
        txt += `│ 🌑 "𝙹𝚊𝚖á𝚜 𝚘𝚕𝚟𝚒𝚍𝚎𝚜 𝚝𝚞 𝚍𝚎𝚜𝚝𝚒𝚗𝚘"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    // 2. SEPARAR EL MENSAJE DEL TIEMPO
    let [mensaje, tiempo] = text.split('|').map(v => v.trim())
    
    // Convertir el tiempo (ej: 10m, 1h, 30s) a milisegundos
    let milisegundos = 0
    if (tiempo.endsWith('s')) milisegundos = parseInt(tiempo) * 1000
    else if (tiempo.endsWith('m')) milisegundos = parseInt(tiempo) * 60000
    else if (tiempo.endsWith('h')) milisegundos = parseInt(tiempo) * 3600000
    else milisegundos = parseInt(tiempo) * 60000 // Por defecto minutos si no pone letra

    if (isNaN(milisegundos) || milisegundos <= 0) return m.reply('❌ Tiempo inválido. Usa: 10s, 5m o 1h.')

    if (m.react) await m.react('⏳')
    
    // 3. CONFIRMACIÓN INICIAL
    m.reply(`✅ *Recordatorio programado*\n\n🔔 *Motivo:* ${mensaje}\n⏱️ *En:* ${tiempo}\n\n*Te mencionaré cuando el tiempo termine.*`)

    // 4. LÓGICA DEL TEMPORIZADOR
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
        
    }, milisegundos)
}

handler.help = ['recordar']
handler.tags = ['tools']
handler.command = /^(recordar|remind|alarm)$/i

export default handler
