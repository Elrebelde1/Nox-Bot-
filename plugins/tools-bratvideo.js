// codigo creado y modificado por Barboza por Sasuke
// El camino de la venganza - Sasuke Mode God V3
import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    if (!textoFinal) {
        return conn.reply(m.chat, `👁️‍🗨️ *MIS OJOS LO VEN TODO...*\n\nEscribe el texto que quieres convertir en sticker.\n💡 *Ejemplo:* ${usedPrefix + command} Barboza manda aquí`, m)
    }

    // Convertir a mayúsculas para el estilo Brat
    textoFinal = textoFinal.toUpperCase().trim()

    // --- MENÚ DE SELECCIÓN ---
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|Blanco`, buttonText: { displayText: "Sasuke - Blanco ⚪" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Verde`, buttonText: { displayText: "Sasuke - Verde 🟢" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rojo`, buttonText: { displayText: "Sasuke - Rojo 🔴" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Azul`, buttonText: { displayText: "Sasuke - Azul 🔵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Amarillo`, buttonText: { displayText: "Sasuke - Amarillo 🟡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Random`, buttonText: { displayText: "Sasuke - Aleatorio 🌀" }, type: 1 }
        ]

        const buttonMessage = {
            text: `⚔️ *SASUKE UCHIHA - GENERADOR* ⚔️\n\n📝 *Tu texto:* "${textoFinal}"\n\n🔥 *Elige un color para tu sticker animado:*`,
            footer: "Dev by Barboza x Sasuke 🧬",
            buttons: colores,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let key 
    try {
        // --- LÓGICA DE COLOR ALEATORIO ---
        let colorFondo = color.trim()
        if (colorFondo === 'Random') {
            const list = ['Blanco', 'Verde', 'Rojo', 'Azul', 'Amarillo', 'Rosa']
            colorFondo = list[Math.floor(Math.random() * list.length)]
        }

        // FASE 1: ESPAÑOL CLARO
        const { key: msgKey } = await conn.sendMessage(m.chat, { text: '👁️‍🗨️ *Leyendo tu mensaje... Preparando el diseño.*' }, { quoted: m })
        key = msgKey

        const apiKey = "sylphy-6f150d"
        let letraColor = (['negro', 'azul', 'morado'].includes(colorFondo.toLowerCase())) ? 'Blanco' : 'Negro'

        // FASE 2: ESPAÑOL CLARO
        await new Promise(res => setTimeout(res, 1000))
        await conn.sendMessage(m.chat, { text: `⚡ *Creando animación con fondo color ${colorFondo.toLowerCase()}...*`, edit: key })

        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${letraColor}&fondo=${colorFondo}&type=Anim&api_key=${apiKey}`
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // FASE 3: MENSAJE FINAL ÉPICO
        await new Promise(res => setTimeout(res, 1000))
        const frasesCierre = [
            '🌑 *Aquí tienes lo que buscabas. Admira mi poder.*',
            '⚔️ *Terminado. No me hagas perder el tiempo otra vez.*',
            '🐍 *El proceso ha sido un éxito. Disfruta tu sticker.*',
            '🔥 *Hecho. Mi poder no tiene límites.*'
        ]
        const finalMsg = frasesCierre[Math.floor(Math.random() * frasesCierre.length)]
        await conn.sendMessage(m.chat, { text: finalMsg, edit: key })

        let pack = `Barboza x Sasuke 🧬`
        let author = `Uchiha Clan`
        let stiker = await sticker(buffer, false, pack, author)

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'bratv.webp', '', m)
            if (m.react) await m.react('🔥')
        }

    } catch (e) {
        console.error(e)
        if (key) await conn.sendMessage(m.chat, { text: '❌ *Hubo un error al conectar con el servidor. Inténtalo de nuevo.*', edit: key })
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
