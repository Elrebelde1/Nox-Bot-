// codigo creado y modificado por Barboza por Sasuke
// Respetar créditos - Sasuke Mode Activated
import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Separamos parámetros (Texto|Color)
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    // 1. Interfaz de error si no hay texto
    if (!textoFinal) {
        return conn.reply(m.chat, `⚔️ *SASUKE BRAT-V GENERATOR* ⚔️\n\n📝 *Uso:* ${usedPrefix + command} <texto>\n💡 *Ejemplo:* ${usedPrefix + command} Barboza es el mejor`, m)
    }

    // MEJORA: Estética Brat (Mayúsculas automáticas para que luzca mejor)
    textoFinal = textoFinal.toUpperCase().trim()

    // 2. Menú de selección con diseño mejorado
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|Blanco`, buttonText: { displayText: "Fondo Blanco ⚪" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Verde`, buttonText: { displayText: "Aura Verde 🟢" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rojo`, buttonText: { displayText: "Sharingan Rojo 🔴" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Azul`, buttonText: { displayText: "Chidori Azul 🔵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Amarillo`, buttonText: { displayText: "Relámpago Amarillo 🟡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rosa`, buttonText: { displayText: "Cerezo Rosa 🌸" }, type: 1 }
        ]

        const buttonMessage = {
            text: `⚔️ *ESTILO: BARBOZA x SASUKE* ⚔️\n\n📝 *Texto:* "${textoFinal}"\n\n✨ *Selecciona el elemento de tu sticker:*`,
            footer: "D e v  b y  B a r b o z a  x  S a s u k e 🧬",
            buttons: colores,
            headerType: 1
        }

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    // 3. Proceso de Generación con Mensajes Dinámicos
    let key // Variable para el mensaje de carga
    try {
        // Mensaje de inicio de proceso
        const { key: loadingKey } = await conn.sendMessage(m.chat, { text: '🌀 *Invocando el Jutsu...*' }, { quoted: m })
        key = loadingKey

        const colorFondo = color.trim()
        const apiKey = "sylphy-6f150d"
        
        // Lógica de contraste: Si el fondo es oscuro, letra clara y viceversa
        let letraColor = 'Negro'
        if (['negro', 'azul', 'morado'].includes(colorFondo.toLowerCase())) letraColor = 'Blanco'

        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${letraColor}&fondo=${colorFondo}&type=Anim&api_key=${apiKey}`

        // Editamos mensaje para mostrar progreso
        await conn.sendMessage(m.chat, { text: '✨ *Moldeando el Chakra...*', edit: key })

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // Metadatos del sticker
        let pack = `Brat Animado por:`
        let author = `Barboza x Sasuke 🧬`

        // Convertimos a sticker animado
        let stiker = await sticker(buffer, false, pack, author)

        if (stiker) {
            // Finalizamos el proceso borrando el mensaje de carga y enviando el sticker
            await conn.sendMessage(m.chat, { delete: key })
            await conn.sendFile(m.chat, stiker, 'bratv.webp', '', m)
            if (m.react) await m.react('🔥')
        } else {
            throw new Error('Fallo en la conversión')
        }

    } catch (e) {
        console.error(e)
        if (key) await conn.sendMessage(m.chat, { text: '❌ *El Jutsu ha fallado... Reintenta.*', edit: key })
        if (m.react) await m.react('✖️')
    }
}

// Handler Before para capturar la respuesta de los botones de forma eficiente
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
