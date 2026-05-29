
/**
 * 📂 COMANDO: Uchiha AI Gemini
 * 📝 DESCRIPCIÓN: Chatbot interactivo con Inteligencia Artificial.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org
 */

import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text || (m.quoted && m.quoted.text ? m.quoted.text : '')
    
    if (!query) {
        let alert = `█║▌│█│║▌║││█║▌│║▌║\n`
        alert += `    ⚠️  UCHIHA SYSTEM WARNING  ⚠️   \n`
        alert += `█║▌│█│║▌║││█║▌│║▌║\n\n`
        alert += `> *Ingresa una consulta para la inteligencia artificial o responde a un mensaje.*`
        return conn.reply(m.chat, alert, m)
    }

    await m.react('🕒')

    try {
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpoint = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL2FpL2dlbWluaQ==")
        const access = b("c2FzdWtl")
        const systemPrompt = b("VXNlciBhbiBhaSBhc3Npc3RhbnQgY2FsbGVkIFNhc3VrZSBCb3Q=")

        const { data: json } = await axios.get(`${endpoint}?text=${encodeURIComponent(query)}&prompt=${encodeURIComponent(systemPrompt)}&key=${access}`)

        if (!json || !json.status || !json.result) {
            await m.react('❌')
            return conn.reply(m.chat, '┏━❌ *SISTEMA CENTRAL ERROR* ━┓\n┃ Respuesta inválida del servidor. ┃\n┗━━━━━━━━━━━━━━━━━━━━━┛', m)
        }

        let txt = `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃     ⛩️  UCHIHA INTELLIGENCE  ⛩️     ┃\n`
        txt += `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`
        txt += `${json.result}\n\n`
        txt += `■ Configuración: Modo Respuesta\n`
        txt += `■ Estado: Transmisión Completada\n`
        txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        txt += `⚡ Barboza Developer x Zona Developers`

        await conn.reply(m.chat, txt, m)
        await m.react('🔥')

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['gemini', 'ia']
handler.tags = ['tools']
handler.command = /^(gemini3|ia|)$/i

export default handler