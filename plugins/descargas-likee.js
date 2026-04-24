import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙼𝚄𝙻𝚃𝙸-𝚃𝙰𝚂𝙰* ♆ 〕─╮\n│\n`
        txt += `│ 💰 *𝚄𝚂𝙾 𝚄𝙻𝚃𝚁𝙰-𝙵𝙻𝙴𝚇𝙸𝙱𝙻𝙴:* \n`
        txt += `│ ${usedPrefix + command} [monto] [moneda] a [moneda]\n│\n`
        txt += `│ 💡 *𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂:* \n`
        txt += `│ • ${usedPrefix + command} 100 verdes a soberanos\n`
        txt += `│ • ${usedPrefix + command} 50 lucas a dolares\n`
        txt += `│ • ${usedPrefix + command} 10 soles a pesos colombianos\n│\n`
        txt += `│ 🌑 "𝙴𝚕 𝚖𝚞𝚗𝚍𝚘 𝚐𝚒𝚛𝚊, 𝚎𝚕 𝚍𝚒𝚗𝚎𝚛𝚘 𝚝𝚊𝚖𝚋𝚒é𝚗"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    // DICCIONARIO MAESTRO (MÁS Y MÁS)
    const alias = {
        // Venezuela
        "bolivares": "VES", "bolivar": "VES", "ves": "VES", "bs": "VES", "soberanos": "VES", "bsd": "VES",
        // USA / Global
        "usd": "USD", "dolares": "USD", "dolar": "USD", "verdes": "USD", "bucks": "USD",
        // Perú
        "pesos peruano": "PEN", "peso peruano": "PEN", "soles": "PEN", "sol": "PEN", "pen": "PEN",
        // Colombia
        "pesos colombianos": "COP", "peso colombiano": "COP", "cop": "COP", "lucas": "COP",
        // México
        "pesos mexicanos": "MXN", "peso mexicano": "MXN", "mxn": "MXN", "mex": "MXN",
        // Argentina
        "pesos argentinos": "ARS", "peso argentino": "ARS", "ars": "ARS",
        // Chile
        "pesos chilenos": "CLP", "peso chileno": "CLP", "clp": "CLP",
        // Europa
        "euros": "EUR", "euro": "EUR", "eur": "EUR",
        // Brasil
        "reales": "BRL", "real": "BRL", "brl": "BRL",
        // Otros
        "pesos uruguayos": "UYU", "uyu": "UYU",
        "pesos dominicanos": "DOP", "dop": "DOP",
        "quetzales": "GTQ", "gtq": "GTQ",
        "soles": "PEN", "bolivianos": "BOB", "bob": "BOB"
    }

    try {
        // Separar por " a " o por " A "
        let partes = text.toLowerCase().split(/\s+a\s+/)
        let primeraParte = partes[0].trim().split(/\s+/)
        
        let amount = parseFloat(primeraParte[0])
        // El resto de la primera parte es la moneda de origen (ej: "pesos", "peruano")
        let fromText = primeraParte.slice(1).join(' ').trim()
        let toText = partes[1] ? partes[1].trim() : 'usd'

        // Si no puso moneda de origen, asumimos USD
        if (!fromText) fromText = 'usd'

        let from = alias[fromText] || fromText.toUpperCase()
        let to = alias[toText] || toText.toUpperCase()

        if (isNaN(amount)) return conn.reply(m.chat, '❌ Pon un número válido. Ejemplo: .tasa 10 usd a ves', m)
        if (m.react) await m.react('⏳')

        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
        const json = await res.json()
        
        if (!json.rates) throw 'Error de API'
        const rate = json.rates[to]

        if (!rate) throw 'Moneda no encontrada'

        const result = (amount * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const tasaFija = rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

        let info = `「 💰 𝚄𝙲𝙷𝙸𝙷𝙰 𝙴𝚇𝙲𝙷𝙰𝙽𝙶𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📤 *𝙾𝚁𝙸𝙶𝙴𝙽:* ${amount} ${from}\n`
        info += `│ 📥 *𝙳𝙴𝚂𝚃𝙸𝙽𝙾:* ${result} ${to}\n`
        info += `│ 📈 *𝙲𝙰𝙼𝙱𝙸𝙾:* 1 ${from} = ${tasaFija} ${to}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*By Barboza-Team ⚡*`

        await conn.sendMessage(m.chat, { 
            text: info, 
            footer: "Sistema de Divisas Global",
            buttons: [
                { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 No pude procesar eso. Intenta algo simple como: "100 usd a ves".', m)
    }
}

handler.help = ['tasa']
handler.tags = ['tools']
handler.command = /^(tasa|convertir|divisa|precio)$/i

export default handler
