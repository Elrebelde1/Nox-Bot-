import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. SI NO HAY TEXTO (INSTRUCCIONES)
    if (!text) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙲𝚄𝚁𝚁𝙴𝙽𝙲𝚈* ♆ 〕─╮\n│\n`
        txt += `│ 💰 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n`
        txt += `│ ${usedPrefix + command} [monto] [desde] [hacia]\n│\n`
        txt += `│ 💡 *𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* \n`
        txt += `│ ${usedPrefix + command} 10 USD VES\n│\n`
        txt += `│ 🌑 "𝙴𝚕 𝚍𝚒𝚗𝚎𝚛𝚘 𝚎𝚜 𝚞𝚗𝚊 𝚒𝚕𝚞𝚜𝚒ó𝚗"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    const args = text.split(' ')
    const amount = args[0]
    // Si no pone monedas, por defecto es de USD a VES
    const from = (args[1] || 'USD').toUpperCase()
    const to = (args[2] || 'VES').toUpperCase()

    if (isNaN(amount)) return conn.reply(m.chat, '❌ El monto debe ser un número válido.', m)

    try {
        if (m.react) await m.react('⏳')
        
        // Usando la API de ExchangeRate (Pública)
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
        const json = await res.json()
        const rate = json.rates[to]

        if (!rate) throw 'Moneda no soportada'

        const result = (amount * rate).toFixed(2)

        let info = `「 💰 𝚄𝙲𝙷𝙸𝙷𝙰 𝚃𝙰𝚂𝙰 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📥 *𝙼𝙾𝙽𝚃𝙾:* ${amount} ${from}\n`
        info += `│ 📤 *𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾:* ${result} ${to}\n`
        info += `│ 📈 *𝚃𝙰𝚂𝙰:* 1 ${from} = ${rate} ${to}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*Actualizado:* ${json.date}`

        await conn.sendMessage(m.chat, { 
            text: info, 
            footer: "By Barboza-Team ⚡",
            buttons: [
                { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 Error al consultar la tasa. Verifica las siglas (ej: USD, VES, COP, EUR).', m)
    }
}

handler.help = ['tasa']
handler.tags = ['tools']
handler.command = /^(tasa|convertir|divisa)$/i

export default handler
