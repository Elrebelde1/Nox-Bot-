// codigo creado y modificado por Barboza por Sasuke
// El camino de la venganza - Sasuke Mode God
import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    if (!textoFinal) {
        return conn.reply(m.chat, `👁️‍🗨️ *MIS OJOS PUEDEN VERLO TODO...*\n\nEscribe el texto que deseas imbuir en mi Jutsu.\n💡 *Ejemplo:* ${usedPrefix + command} El mundo conocerá el dolor`, m)
    }

    // Estética Brat (Mayúsculas automáticas)
    textoFinal = textoFinal.toUpperCase().trim()

    // Menú de selección con estilo Uchiha
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|Blanco`, buttonText: { displayText: "Pergamino Blanco ⚪" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Verde`, buttonText: { displayText: "Bosque de la Muerte 🟢" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rojo`, buttonText: { displayText: "Sharingan Eterno 🔴" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Azul`, buttonText: { displayText: "Chidori Negro 🔵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Amarillo`, buttonText: { displayText: "Destello Relámpago 🟡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rosa`, buttonText: { displayText: "Flor de Cerezo 🌸" }, type: 1 }
        ]

        const buttonMessage = {
            text: `⚔️ *SASUKE UCHIHA - BRAT V* ⚔️\n\n📝 *Mensaje:* "${textoFinal}"\n\n🔥 *¿Qué elemento deseas usar para este sello?*`,
            footer: "D e v  b y  B a r b o z a  x  S a s u k e 🧬",
            buttons: colores,
            headerType: 1
        }

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let key // Para editar el mensaje
    try {
        // Fase 1: Inicio del Jutsu
        const { key: msgKey } = await conn.sendMessage(m.chat, { text: '👁️‍🗨️ *Activando el Sharingan... Analizando tu texto.*' }, { quoted: m })
        key = msgKey

        const colorFondo = color.trim()
        const apiKey = "sylphy-6f150d"
        let letraColor = 'Negro'
        if (['negro', 'azul', 'morado'].includes(colorFondo.toLowerCase())) letraColor = 'Blanco'

        // Fase 2: Moldeando Chakra
        await new Promise(res => setTimeout(res, 1000))
        await conn.sendMessage(m.chat, { text: '⚡ *¡CHIDORI! Moldeando el chakra del sticker...*', edit: key })

        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${letraColor}&fondo=${colorFondo}&type=Anim&api_key=${apiKey}`
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // Fase 3: Conclusión épica
        await new Promise(res => setTimeout(res, 1000))
        await conn.sendMessage(m.chat, { text: '🌑 *He caminado a través de la oscuridad por esto... Admira mi poder.*', edit: key })

        let pack = `Brat Animado por:`
        let author = `Barboza x Sasuke 🧬`
        let stiker = await sticker(buffer, false, pack, author)

        if (stiker) {
            // Enviamos el sticker y dejamos el mensaje anterior como testigo del poder
            await conn.sendFile(m.chat, stiker, 'bratv.webp', '', m)
            if (m.react) await m.react('🐍')
        }

    } catch (e) {
        console.error(e)
        if (key) await conn.sendMessage(m.chat, { text: '❌ *Tsk... Este nivel de poder es inestable. Inténtalo de nuevo.*', edit: key })
        if (m.react) await m.react('✖️')
    }
}

// Captura de botones
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
