// codigo creado y modificado por Barboza por Sasuke
// El camino de la venganza - Sasuke Mode God V4 (ULTRA)
import axios from 'axios'
import { sticker } from '../lib/sticker.js'

// Función para que el texto no se salga del sticker
function wrapText(text, max = 15) {
    let words = text.split(' ')
    let lines = []
    let current = []
    for (let w of words) {
        if ((current.join(' ').length + w.length + 1) > max) {
            lines.push(current.join(' '))
            current = [w]
        } else {
            current.push(w)
        }
    }
    if (current.length) lines.push(current.join(' '))
    return lines.join('\n')
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    if (!textoFinal) {
        return conn.reply(m.chat, `👁️‍🗨️ *MIS OJOS LO VEN TODO...*\n\nEscribe el texto que quieres convertir en sticker.\n💡 *Ejemplo:* ${usedPrefix + command} El odio es mi guía`, m)
    }

    // Formateo de texto épico
    textoFinal = wrapText(textoFinal.toUpperCase().trim(), 18)

    // --- MENÚ DE SELECCIÓN ---
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal.replace(/\n/g, ' ')}|Blanco`, buttonText: { displayText: "Sasuke - Blanco ⚪" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal.replace(/\n/g, ' ')}|Verde`, buttonText: { displayText: "Sasuke - Verde 🟢" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal.replace(/\n/g, ' ')}|Rojo`, buttonText: { displayText: "Sasuke - Rojo 🔴" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal.replace(/\n/g, ' ')}|Azul`, buttonText: { displayText: "Sasuke - Azul 🔵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal.replace(/\n/g, ' ')}|Amarillo`, buttonText: { displayText: "Sasuke - Amarillo 🟡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal.replace(/\n/g, ' ')}|Random`, buttonText: { displayText: "Sasuke - Aleatorio 🌀" }, type: 1 }
        ]

        const buttonMessage = {
            text: `⚔️ *SASUKE UCHIHA - GENERADOR* ⚔️\n\n📝 *Tu texto:* "${textoFinal.replace(/\n/g, ' ')}"\n\n🔥 *Elige un color para tu diseño:*`,
            footer: "Dev by Barboza x Sasuke 🧬",
            buttons: colores,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let key 
    try {
        await conn.sendPresenceUpdate('composing', m.chat) // Efecto "Escribiendo..."
        
        let colorFondo = color.trim()
        if (colorFondo === 'Random') {
            const list = ['Blanco', 'Verde', 'Rojo', 'Azul', 'Amarillo', 'Rosa', 'Cian', 'Naranja']
            colorFondo = list[Math.floor(Math.random() * list.length)]
        }

        // FASE 1: ESPAÑOL CLARO
        const { key: msgKey } = await conn.sendMessage(m.chat, { text: '👁️‍🗨️ *Analizando los puntos de presión de tu texto...*' }, { quoted: m })
        key = msgKey

        const apiKey = "sylphy-6f150d"
        
        // Lógica de contraste mejorada
        const oscuros = ['azul', 'rojo', 'negro', 'morado']
        let letraColor = oscuros.includes(colorFondo.toLowerCase()) ? 'Blanco' : 'Negro'

        // FASE 2: PROCESANDO
        await new Promise(res => setTimeout(res, 800))
        await conn.sendMessage(m.chat, { text: `⚡ *Inyectando color ${colorFondo.toLowerCase()} y creando animación...*`, edit: key })

        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${letraColor}&fondo=${colorFondo}&type=Anim&api_key=${apiKey}`
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // FASE 3: MENSAJE FINAL
        await new Promise(res => setTimeout(res, 800))
        const frasesCierre = [
            '🌑 *Ya está hecho. No desperdicies este poder.*',
            '⚔️ *He forjado tu sticker en las llamas del odio.*',
            '🐍 *La marca de maldición ha terminado el trabajo.*',
            '👁️‍🗨️ *Mis ojos ya lo han procesado todo. Aquí tienes.*'
        ]
        const finalMsg = frasesCierre[Math.floor(Math.random() * frasesCierre.length)]
        await conn.sendMessage(m.chat, { text: finalMsg, edit: key })

        let pack = `Barboza x Sasuke 🧬`
        let author = `Uchiha Elite Bot`
        let stiker = await sticker(buffer, false, pack, author)

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'bratv.webp', '', m)
            if (m.react) await m.react('🔥')
        }

    } catch (e) {
        console.error(e)
        if (key) await conn.sendMessage(m.chat, { text: '❌ *Tsk... La conexión se ha cortado. Inténtalo de nuevo.*', edit: key })
    }
}

handler.before = async function (m, { conn }) {
    if (!m.message?.buttonsResponseMessage) return 
    let id = m.message.buttonsResponseMessage.selectedButtonId
    if (id && id.startsWith('.bratv ')) {
        this.emit('message-new', { 
            ...m, 
            message: { ...m.message, conversation: id }, 
            text: id 
        })
    }
}

handler.help = ['bratv']
handler.tags = ['sticker']
handler.command = /^(bratv)$/i

export default handler
