/**
 * 📂 COMANDO: Uchiha AI Chat (GPT4 Session)
 * 📝 DESCRIPCIÓN: Interactúa con la IA manteniendo un historial de conversación por sesión.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let entradaUsuario = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!entradaUsuario) {
        let advertencia = `╭━━━⚡ 【 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖢𝖮𝖭𝖤𝖢𝖳𝖨𝖵𝖮 𝖴𝖢𝖧𝖨𝖧𝖠 𝖠𝖨 】 ⚡━━━╮\n`
        advertencia += `┃\n`
        advertencia += `┃ 🟢 *ESTADO:* Nodo de Inteligencia Esperando Datos...\n`
        advertencia += `┃ ⚠️ *AVISO:* Es necesario ingresar un texto para procesar la consulta.\n`
        advertencia += `┃\n`
        advertencia += `┃ 📖 *MODO DE USO DETALLADO Y EJEMPLO:* \n`
        advertencia += `┃ > ${usedPrefix + command} Explica los fundamentos de la física cuántica.\n`
        advertencia += `┃\n`
        advertencia += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        return conn.reply(m.chat, advertencia, m)
    }

    await m.react('🧬')

    try {
        const urlBase = "https://api.evogb.org/ai/gpt4-session"
        const claveSecreta = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

        if (!conn.mapaSesionSasuke) conn.mapaSesionSasuke = {}
        if (!conn.mapaSesionSasuke[m.sender]) {
            conn.mapaSesionSasuke[m.sender] = {
                id: "SSID_" + Math.floor(100000 + Math.random() * 900000).toString()
            }
        }

        const tokenActual = conn.mapaSesionSasuke[m.sender].id
        const urlFinal = `${urlBase}?text=${encodeURIComponent(entradaUsuario)}&session=${tokenActual}&key=${claveSecreta}`

        let peticionRed = await fetch(urlFinal)
        let respuestaJson = await peticionRed.json()

        if (respuestaJson && respuestaJson.status === true && respuestaJson.result) {
            const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
            const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

            let reporteExtenso = `🧬 ═══ 〖 𝖱𝖤𝖯𝖮𝖱𝖳𝖤 𝖣𝖤 𝖨𝖭𝖳𝖤𝖫𝖨𝖦𝖤𝖭𝖢𝖨𝖠 𝖴𝖢𝖧𝖨𝖧𝖠 〗 ═══ 🧬\n\n`
            reporteExtenso += `${respuestaJson.result}\n\n`
            reporteExtenso += `📊 ─── 〖 𝖬𝖤𝖳𝖠𝖣𝖠𝖳𝖮𝖲 𝖣𝖤 𝖫𝖳 𝖳𝖱𝖠𝖭𝖲𝖠𝖢𝖢𝖨𝖮𝖭 〗 ───\n`
            reporteExtenso += `⬡ *MOTOR CENTRAL:* Arquitectura Híbrida GPT-4\n`
            reporteExtenso += `⬡ *ID DE SESIÓN ACTIVA:* ${tokenActual}\n`
            reporteExtenso += `⬡ *ESTADO DE PETICIÓN:* Operación Procesada con Éxito sin Errores\n`
            reporteExtenso += `🤝 ─── 〖 𝖢𝖱𝖤𝖣𝖨𝖳𝖮𝖲 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 〗 ───\n`
            reporteExtenso += `⬡ *DESARROLLADOR:* ${dev}\n`
            reporteExtenso += `⬡ *INFRAESTRUCTURA:* ${net}\n`
            reporteExtenso += `■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`

            await conn.reply(m.chat, reporteExtenso, m)
            await m.react('🔥')
        } else {
            await m.react('❌')
            let falloServidor = `⚠️ *ERROR DE CONEXIÓN CRÍTICO* ⚠️\n\n`
            falloServidor += `> No se pudo extraer un flujo de texto estructurado válido desde el servidor central en la nube de procesamiento.`
            return conn.reply(m.chat, falloServidor, m)
        }

    } catch (error) {
        console.error(error)
        await m.react('❌')
    }
}

handler.help = ['sasukeai']
handler.tags = ['ai']
handler.command = /^(sasukeai)$/i

export default handler
