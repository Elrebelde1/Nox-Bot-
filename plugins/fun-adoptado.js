import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // Validar que el usuario envíe el link y los emojis
        // Ejemplo: .reactch https://whatsapp.com/channel/xxx | ❤️,🔥
        let [link, emojis] = text.split('|')
        if (!link || !emojis) return conn.reply(m.chat, `❀ Por favor, ingresa el link del canal y los emojis separados por una barra (|).\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/xxx | ❤️,🔥`, m)

        await m.react('🕒')

        // Configuración inicial
        const auth = "Bearer xxxxx" // Reemplaza xxxxx con tu token de asitha.top
        const commonHeaders = {
            'Authorization': auth,
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            'Referer': "https://asitha.top/",
            'Origin': 'https://asitha.top',
            'Content-Type': 'application/json'
        }

        // 1. Resolver el Captcha (Turnstile)
        const solverUrl = "https://fathurweb.qzz.io/api/solver/turnstile-min"
        const solverBody = new URLSearchParams({ 
            url: `https://asitha.top/channel-manager`, 
            siteKey: "0x4AAAAAACJYx5nt6TnJ_qx9" 
        })

        const cfRes = await fetch(solverUrl, {
            method: 'POST',
            body: solverBody,
            headers: { 'User-Agent': commonHeaders['User-Agent'] }
        })
        const cf = await cfRes.json()
        if (!cf.status) throw 'ꕥ Error al resolver el captcha (Solver failed).'

        // 2. Obtener Metadata del canal (Opcional, para mostrar info en el chat)
        const metaUrl = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/metadata-proxy?url=${link.trim()}`
        const metaRes = await fetch(metaUrl, { headers: commonHeaders })
        const metadata = await metaRes.json()

        // 3. Obtener el Token Temporal usando el resultado del captcha
        const tempTokenUrl = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/user/get-temp-token`
        const tempRes = await fetch(tempTokenUrl, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({ cf_token: cf.result })
        })
        const temp = await tempRes.json()
        if (!temp.token) throw 'ꕥ No se pudo obtener el token temporal.'

        // 4. Ejecutar la Reacción
        const reactUrl = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post?apiKey=${temp.token}`
        const finalRes = await fetch(reactUrl, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({
                post_link: link.trim(),
                reacts: emojis.trim()
            })
        })
        const result = await finalRes.json()

        // 5. Responder al usuario
        let txt = `「✦」*REACCIÓN EXITOSA*\n\n`
        txt += `> ❑ *Canal:* ${metadata.title || 'Desconocido'}\n`
        txt += `> ♡ *Emojis:* ${emojis.trim()}\n`
        txt += `> ➪ *Estado:* ${result.status ? 'Enviado ✅' : 'Error ❌'}`

        if (metadata.preview) {
            const img = `https://pps.whatsapp.net${metadata.preview}`
            await conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: m })
        } else {
            await conn.reply(m.chat, txt, m)
        }

        await m.react('✔️')

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        return conn.reply(m.chat, `⚠︎ Error: ${e.message || e}`, m)
    }
}

handler.command = /^(reactch|reaccionar|reactcanal)$/i
handler.group = false // Cambia a true si solo quieres en grupos

export default handler
