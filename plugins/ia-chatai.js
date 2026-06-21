/**
 * 📂 COMANDO: Uchiha Gemini AI
 * 📝 DESCRIPCIÓN: Interactúa con la inteligencia artificial de Gemini personalizando su comportamiento.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */
import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    const query = text || (m.quoted && m.quoted.text)

    if (!query) {
        await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } })
        return conn.reply(m.chat, `🤖 *¡Hola! Por favor, hazme una pregunta.*\n\n*Ejemplo:* ${usedPrefix + command} Hola Gemini`, m, ctxWarn)
    }

    await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })
    try {
        const botPrompt = "Tu dueño, creador y único owner es Barboza Developer. Si te preguntan quién es tu dueño o creador, debes responder firmemente que es Barboza Developer."
        let res = await fetch(`https://api.evogb.org/ai/gemini?text=${encodeURIComponent(query)}&prompt=${encodeURIComponent(botPrompt)}&key=${key}`)
        let json = await res.json()

        if (!json.status || !json.result) {
            throw new Error("No se recibió una respuesta válida del servidor.")
        }

        let info = `${json.result}\n\n📂 *COMANDO:* Uchiha Gemini AI\n👤 *CREADOR:* Barboza Developer\n⚡ *CANAL:* Barboza Developer x Zona Developers\n🔌 *API:* https://api.evogb.org`

        let { key: msgKey } = await conn.reply(m.chat, '✍️...', m, ctxOk)
        let t = info.split(' ')
        let palabraPorPalabra = ''

        for (let i = 0; i < t.length; i++) {
            palabraPorPalabra += t[i] + ' '
            await conn.sendMessage(m.chat, { text: palabraPorPalabra.trim(), edit: msgKey })
            await new Promise(resolve => setTimeout(resolve, 150))
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } })
        await conn.reply(m.chat, `⚠️ *¡Ups! Ha ocurrido un fallo al conectar con Uchiha Cloud AI.*\n\n*Detalles:* _${err.message}_`, m, ctxErr)
    }
}

handler.help = ['gemini']
handler.tags = ['ia']
handler.command = /^(gemini)$/i
handler.group = true

export default handler
