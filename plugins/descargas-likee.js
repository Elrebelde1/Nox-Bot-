import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Función para quitar tildes y dejar todo limpio
    const cleanText = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

    const detectCurrency = (t) => {
        t = cleanText(t)
        if (t.includes('venezuela') || t.includes('bolivar') || t.includes('ves') || t.includes('bs') || t.includes('soberano')) return 'VES'
        if (t.includes('usa') || t.includes('dolar') || t.includes('usd') || t.includes('verde')) return 'USD'
        if (t.includes('peru') || t.includes('sol') || t.includes('pen')) return 'PEN'
        if (t.includes('colombia') || t.includes('cop') || t.includes('lucas')) return 'COP'
        if (t.includes('mexic') || t.includes('mxn')) return 'MXN'
        if (t.includes('argentin') || t.includes('ars')) return 'ARS'
        if (t.includes('chile') || t.includes('clp')) return 'CLP'
        if (t.includes('euro') || t.includes('eur')) return 'EUR'
        if (t.includes('brasil') || t.includes('brl') || t.includes('real')) return 'BRL'
        return t.toUpperCase().trim()
    }

    if (!text) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙼𝚄𝙻𝚃𝙸-𝚃𝙰𝚂𝙰* ♆ 〕─╮\n│\n`
        txt += `│ 💠 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n`
        txt += `│ ${usedPrefix + command} [monto] [origen] a [destino]\n│\n`
        txt += `│ 💡 *𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* \n`
        txt += `│ ${usedPrefix + command} 1900 bolívares a usd\n│\n`
        txt += `│ 🌑 "𝚂𝚒𝚗 𝚛𝚎𝚌𝚘𝚛𝚌𝚘𝚛𝚎𝚜, 𝚜𝚘𝚕𝚘 𝚗𝚎𝚐𝚘𝚌𝚒𝚘𝚜"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    try {
        // Separamos por la " a " sin importar mayúsculas o espacios locos
        let partes = text.split(/\s+a\s+/i)
        
        // Buscamos el número en la primera parte
        let montoMatch = partes[0].match(/(\d+([\.,]\d+)?)/)
        if (!montoMatch) throw 'No monto'
        
        let amount = parseFloat(montoMatch[0].replace(',', '.'))
        let fromText = partes[0].replace(montoMatch[0], '').trim()
        let toText = partes[1] ? partes[1].trim() : 'usd'

        let from = detectCurrency(fromText || 'usd')
        let to = detectCurrency(toText)

        if (m.react) await m.react('⏳')

        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
        const json = await res.json()
        const rate = json.rates[to]

        if (!rate) throw 'No rate'

        const result = (amount * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

        let info = `「 💰 𝚄𝙲𝙷𝙸𝙷𝙰 𝙴𝚇𝙲𝙷𝙰𝙽𝙶𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📥 *𝙾𝚁𝙸𝙶𝙴𝙽:* ${amount} ${from}\n`
        info += `│ 📤 *𝙳𝙴𝚂𝚃𝙸𝙽𝙾:* ${result} ${to}\n`
        info += `│ 📈 *𝚃𝙰𝚂𝙰:* 1 ${from} = ${rate.toFixed(4)} ${to}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `*By Barboza-Team ⚡*`

        await conn.sendMessage(m.chat, { text: info }, { quoted: m })
        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 *Error:* No reconocí los datos. Intenta:\n.tasa 1900 bolivares a usd', m)
    }
}

handler.help = ['tasa']
handler.tags = ['tools']
handler.command = /^(tasa|convertir|divisa)$/i

export default handler
