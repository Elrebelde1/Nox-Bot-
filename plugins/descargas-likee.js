import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. DICCIONARIO DE DETECCIÓN (INTELIGENTE)
    const detectCurrency = (t) => {
        t = t.toLowerCase()
        if (t.includes('venezuela') || t.includes('bolivar') || t.includes('ves') || t.includes('bs') || t.includes('soberano')) return 'VES'
        if (t.includes('usa') || t.includes('dolar') || t.includes('usd') || t.includes('verde')) return 'USD'
        if (t.includes('peru') || t.includes('sol') || t.includes('pen')) return 'PEN'
        if (t.includes('colombia') || t.includes('cop') || t.includes('lucas')) return 'COP'
        if (t.includes('mexic') || t.includes('mxn')) return 'MXN'
        if (t.includes('argentin') || t.includes('ars')) return 'ARS'
        if (t.includes('chile') || t.includes('clp')) return 'CLP'
        if (t.includes('euro') || t.includes('eur') || t.includes('españa') || t.includes('italia')) return 'EUR'
        if (t.includes('brasil') || t.includes('brl') || t.includes('real')) return 'BRL'
        if (t.includes('dominican') || t.includes('dop')) return 'DOP'
        if (t.includes('uruguay') || t.includes('uyu')) return 'UYU'
        if (t.includes('bolivia') || t.includes('bob')) return 'BOB'
        if (t.includes('panama') || t.includes('pab')) return 'PAB'
        if (t.includes('paraguay') || t.includes('pyg') || t.includes('guarani')) return 'PYG'
        if (t.includes('ecuador')) return 'USD' // Ecuador usa dólar
        return t.toUpperCase().trim()
    }

    // 2. SI NO HAY TEXTO: MOSTRAR TODOS LOS PAÍSES Y GUÍA
    if (!text) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙼𝚄𝙻𝚃𝙸-𝚃𝙰𝚂𝙰* ♆ 〕─╮\n│\n`
        txt += `│ 💠 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n`
        txt += `│ ${usedPrefix + command} [monto] [origen] a [destino]\n│\n`
        txt += `│ 🌎 *𝙿𝙰Í𝚂𝙴𝚂 𝚂𝙾𝙿𝙾𝚁𝚃𝙰𝙳𝙾𝚂:* \n`
        txt += `│ 🇻🇪 *Venezuela:* bolivares, bs, ves\n`
        txt += `│ 🇺🇸 *USA:* dolares, usd, verdes\n`
        txt += `│ 🇵🇪 *Perú:* soles, pen, pesos peruano\n`
        txt += `│ 🇨🇴 *Colombia:* pesos colombianos, cop\n`
        txt += `│ 🇲🇽 *México:* pesos mexicanos, mxn\n`
        txt += `│ 🇦🇷 *Argentina:* pesos argentinos, ars\n`
        txt += `│ 🇨🇱 *Chile:* pesos chilenos, clp\n`
        txt += `│ 🇪🇺 *Europa:* euros, eur\n`
        txt += `│ 🇧🇷 *Brasil:* reales, brl\n`
        txt += `│ 🇩🇴 *R. Dom:* pesos dominicanos, dop\n`
        txt += `│ 🇧🇴 *Bolivia:* bolivianos, bob\n`
        txt += `│ 🇵🇾 *Paraguay:* guaranies, pyg\n`
        txt += `│ 🇺🇾 *Uruguay:* pesos uruguayos, uyu\n│\n`
        txt += `│ 💡 *𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* \n`
        txt += `│ ${usedPrefix + command} 100 soles a bolivares\n│\n`
        txt += `│ 🌑 "𝙴𝚕 𝚠𝚘𝚛𝚕𝚍 𝚎𝚜 𝚝𝚞𝚢𝚘"\n╰────────────────────────────╯`
        
        return await conn.sendMessage(m.chat, { 
            text: txt, 
            footer: "By Barboza-Team ⚡",
            buttons: [{ buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }],
            headerType: 1
        }, { quoted: m })
    }

    // 3. LÓGICA DE CONVERSIÓN
    try {
        let partes = text.toLowerCase().split(/\s+a\s+/)
        let montoMatch = partes[0].match(/(\d+(\.\d+)?)/)
        if (!montoMatch) throw 'No monto'
        
        let amount = parseFloat(montoMatch[0])
        let fromText = partes[0].replace(montoMatch[0], '').trim()
        let toText = partes[1] ? partes[1].trim() : 'ves'

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

        await conn.sendMessage(m.chat, { text: info, footer: "Uchiha Currency System" }, { quoted: m })
        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 *Error:* Asegúrate de seguir el formato:\n.tasa 100 soles a bolivares', m)
    }
}

handler.help = ['tasa']
handler.tags = ['tools']
handler.command = /^(tasa|convertir|divisa)$/i

export default handler
