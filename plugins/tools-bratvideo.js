// codigo creado y modificado por Barboza por Sasuke
// Respetar créditos
import axios from 'axios'
import { sticker } from '../lib/sticker.js'

export async function before(m, { conn }) {
    if (m.message?.buttonsResponseMessage) {
        let selected = m.message.buttonsResponseMessage.selectedButtonId
        // Verificamos que sea un botón de este comando
        if (selected && selected.startsWith('.bratv ')) {
            m.text = selected
            // Ejecutamos el comando con el texto seleccionado
            return conn.executeCommand(selected, m)
        }
    }
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Separamos el texto del color por la barra vertical "|"
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    // Diseño de mensaje de error si no hay texto
    if (!textoFinal) return conn.reply(m.chat, `🌀 *Hey! Necesito un texto para empezar.*\n\n💡 *Ejemplo:* ${usedPrefix + command} Sasuke`, m)

    // Validación de longitud (ajustado para la API de Sylphyy animado)
    if (textoFinal.length > 40) {
        return conn.reply(m.chat, `🛑 *Texto demasiado largo.* Intenta con menos de 40 caracteres.`, m)
    }

    // Si no se ha elegido un color, enviamos el nuevo diseño de menú
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|Blanco`, buttonText: { displayText: "Fondo Blanco ⚪" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Verde`, buttonText: { displayText: "Fondo Verde ✨" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rojo`, buttonText: { displayText: "Fondo Rojo 💢" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Azul`, buttonText: { displayText: "Fondo Azul ⚡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Amarillo`, buttonText: { displayText: "Fondo Amarillo ⭐" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|Rosa`, buttonText: { displayText: "Fondo Rosa 🎀" }, type: 1 }
        ]

        // Nuevo diseño del mensaje de selección
        const buttonMessage = {
            text: `⚔️ *BRAT ANIMADO - GENERATOR* ⚔️\n\n📝 *Texto:* "${textoFinal}"\n\n🎨 *Selecciona tu estilo de fondo:*`,
            footer: "Dev by Barboza x Sasuke 🧬",
            buttons: colores,
            headerType: 1
        }

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    // Proceso de generación del sticker animado
    try {
        if (m.react) await m.react('⏳')

        const colorFondo = color.trim()
        const apiKey = "sylphy-6f150d"
        // URL configurada con Texto Negro sobre fondo de color (Animado)
        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=Negro&fondo=${colorFondo}&type=Anim&api_key=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // Metadatos personalizados
        let pack = `Brat Animado por:`
        let author = `Barboza x Sasuke 🧬`

        // Conversión a sticker
        let stiker = await sticker(buffer, false, pack, author)

        if (stiker) {
            // Envío del sticker
            await conn.sendFile(m.chat, stiker, 'bratv.webp', '', m)
            if (m.react) await m.react('✅')
        } else {
            throw new Error('Error al convertir el buffer')
        }

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, `❌ *Ocurrió un error inesperado.*`, m)
    }
}

handler.help = ['bratv']
handler.tags = ['sticker']
handler.command = /^(bratv)$/i

export default handler
