import { readFileSync } from 'fs'
import { join } from 'path'
import axios from 'axios'

let handler = async (m, { conn, command }) => {
    // Definir capacidad según el comando
    let capacidad = 4
    if (command.includes('6')) capacidad = 6
    if (command.includes('8')) capacidad = 8
    if (command.includes('12')) capacidad = 12
    if (command.includes('16')) capacidad = 16
    if (command.includes('20')) capacidad = 20
    if (command.includes('24')) capacidad = 24
    if (command.includes('guerra')) capacidad = 12 

    const titulos = {
        4: "𝟒 𝐕𝐒 𝟒", 6: "𝟔 𝐕𝐒 𝟔", 8: "𝟖 𝐕𝐒 𝟖",
        12: "𝟏𝟐 𝐕𝐒 𝟏𝟐", 16: "𝟏𝟔 𝐕𝐒 𝟏𝟔", 20: "𝟐𝟎 𝐕𝐒 𝟐𝟎", 24: "𝟐𝟒 𝐕𝐒 𝟐𝟒",
        'guerra': "🔱 𝐆𝐔𝐄𝐑𝐑𝐀 𝐃𝐄 𝐂𝐋𝐀𝐍𝐄𝐒 🔱"
    }

    const tituloActivo = command.includes('guerra') ? titulos['guerra'] : titulos[capacidad]

    // Cargar imagen local
    let menuImg
    try {
        menuImg = readFileSync(join(process.cwd(), 'storage', 'img', 'miniurl.jpg'))
    } catch {
        // Backup por si la imagen local no existe
        menuImg = { url: 'https://cdn.russellxz.click/16b3faeb.jpeg' }
    }

    // DISEÑO PREMIUM RECARGADO
    const diseñoBase = (lista = []) => {
        let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
        txt += `   ⚔️ ${tituloActivo} ⚔️\n`
        txt += `╚════════════════════╝\n\n`

        txt += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃ ✨  *ESCUADRA DE ÉLITE* ✨\n`
        txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n`

        for (let i = 0; i < capacidad; i++) {
            let emoji = i === 0 ? '👑' : (i < 4 ? '⚡' : '🥷🏻')
            let nombre = lista[i] ? `*${lista[i].name}*` : '𝘗𝘰𝘳 𝘥𝘦𝘧𝘪𝘯𝘪𝘳...'
            txt += `  🏮 ${i + 1}. • ${emoji} ${nombre}\n`
        }

        txt += `\n┏━━━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃ 🛡️  *RESERVAS MÉDICAS* 🛡️\n`
        txt += `┗━━━━━━━━━━━━━━━━━━━━┛\n`

        for (let i = capacidad; i < capacidad + 4; i++) {
            let nombre = lista[i] ? `*${lista[i].name}*` : '𝘗𝘰𝘳 𝘥𝘦𝘧𝘪𝘯𝘪𝘳...'
            txt += `  🧪 ${i + 1}. • 🧱 ${nombre}\n`
        }

        txt += `\n*⊱───────────────────⊰*\n`
        txt += `   🔥 𝑼𝒏𝒆𝒕𝒆 𝒂𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 𝑪𝒍𝒂𝒏 🔥\n`
        txt += `*⊱───────────────────⊰*`
        return txt
    }

    let msg = await conn.sendMessage(m.chat, {
        image: menuImg,
        caption: diseñoBase()
    })

    global.db.data.listaVs = global.db.data.listaVs ? global.db.data.listaVs : {}
    global.db.data.listaVs[msg.key.id] = {
        capacidad: capacidad + 4,
        inscritos: [],
        render: diseñoBase
    }
}

handler.all = async function (m) {
    if (!m.quoted || !m.quoted.id || !global.db.data.listaVs || !global.db.data.listaVs[m.quoted.id]) return

    let data = global.db.data.listaVs[m.quoted.id]
    if (data.inscritos.length >= data.capacidad || data.inscritos.some(u => u.id === m.sender)) return

    data.inscritos.push({ id: m.sender, name: m.pushName || 'S/N' })

    await this.sendMessage(m.chat, { 
        text: data.render(data.inscritos), 
        edit: m.quoted.vM ? m.quoted.vM.key : m.quoted,
        mentions: data.inscritos.map(u => u.id)
    })

    try { await this.sendMessage(m.chat, { delete: m.key }) } catch { }
}

handler.help = ['4vs4', '6vs6', '8vs8', '12vs12', '16vs16', '20vs20', '24vs24', 'guerraclanes']
handler.tags = ['clanes']
handler.command = /^(4vs4|6vs6|8vs8|12vs12|16vs16|20vs20|24vs24|guerraclanes|guerra)$/i
handler.group = true

export default handler
