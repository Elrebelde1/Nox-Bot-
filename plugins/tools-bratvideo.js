// codigo creado y modificado por Barboza por Sasuke
// El camino de la venganza - Sasuke Mode God V3
import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    if (!textoFinal) {
        return conn.reply(m.chat, `👁️‍🗨️ *MIS OJOS PUEDEN VER TU VACÍO...*\n\nEscribe el texto que deseas imbuir en mi sello.\n💡 *Ejemplo:* ${usedPrefix + command} Mi camino es la oscuridad`, m)
    }

    textoFinal = textoFinal.toUpperCase().trim()

    // --- MENÚ DE SELECCIÓN MEJORADO ---
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|Blanco`, buttonText: { displayText: "Sasuke - Blanco ⚪" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Verde`, buttonText: { displayText: "Sasuke - Verde 🟢" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rojo`, buttonText: { displayText: "Sasuke - Rojo 🔴" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Azul`, buttonText: { displayText: "Sasuke - Azul 🔵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rosa`, buttonText: { displayText: "Sasuke - Rosa 🌸" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Random`, buttonText: { displayText: "Sasuke - Aleatorio 🌀" }, type: 1 }
        ]

        const buttonMessage = {
            text: `⚔️ *SASUKE UCHIHA - BRAT V* ⚔️\n\n📝 *Sello:* "${textoFinal}"\n\n🔥 *¿Qué elemento de chakra deseas manifestar?*`,
            footer: "D e v  b y  B a r b o z a  x  S a s u k e 🧬",
            buttons: colores,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let key 
    try {
        // --- LÓGICA ALEATORIA ---
        let colorFondo = color.trim()
        if (colorFondo === 'Random') {
            const list = ['Blanco', 'Verde', 'Rojo', 'Azul', 'Amarillo', 'Rosa']
            colorFondo = list[Math.floor(Math.random() * list.length)]
        }

        // Fase 1: Inicio
        const { key: msgKey } = await conn.sendMessage(m.chat, { text: '👁️‍🗨️ *Has despertado mi curiosidad... Activando Sharingan.*' }, { quoted: m })
        key = msgKey

        const apiKey = "sylphy-6f150d"
        let letraColor = (['negro', 'azul', 'morado'].includes(colorFondo.toLowerCase())) ? 'Blanco' : 'Negro'

        // Fase 2: Progreso
        await new Promise(res => setTimeout(res, 1000))
        await conn.sendMessage(m.chat, { text: `⚡ *¡Katon! Impregnando "${colorFondo}" en el pergamino...*`, edit: key })

        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${letraColor}&fondo=${colorFondo}&type=Anim&api_key=${apiKey}`
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // Fase 3: Conclusión
        await new Promise(res => setTimeout(res, 1000))
        const frases = [
            '🌑 *La oscuridad es mi aliada. Aquí tienes tu poder.*',
            '🐍 *Orochimaru me enseñó más que simples trucos... Mira.*',
            '⚔️ *He cortado el pasado. El sticker está listo.*',
            '🔥 *Amaterasu... el fuego negro ha forjado esto.*'
        ]
        await conn.sendMessage(m.chat, { text: frases[Math.floor(Math.random() * frases.length)], edit: key })

        let pack = `Barboza x Sasuke 🧬`
        let author = `Uchiha Clan`
        let stiker = await sticker(buffer, false, pack, author)

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'bratv.webp', '', m)
            if (m.react) await m.react('🔥')
            
            // --- MEJORA: AUDIO DE INVOCACIÓN ---
            // Solo si tienes los audios en tu bot, si no, puedes quitar esta línea
            // await conn.sendMessage(m.chat, { audio: { url: './media/chidori.mp3' }, fileName: 'chidori.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        if (key) await conn.sendMessage(m.chat, { text: '❌ *Tsk... Mi chakra se ha agotado. Inténtalo más tarde.*', edit: key })
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
