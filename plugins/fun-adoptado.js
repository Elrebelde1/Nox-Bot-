import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let [link, emojis] = text.split('|')
        if (!link || !emojis) return conn.reply(m.chat, `❀ Ingrese el link y los emojis.\n\nEjemplo:\n${usedPrefix + command} https://whatsapp.com/channel/xxx | ⚡,✨`, m)

        await m.react('⏳')

        const auth = "barboza"
        const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        
        const commonHeaders = {
            'Authorization': auth,
            'User-Agent': userAgent,
            'Referer': "https://asitha.top/",
            'Origin': 'https://asitha.top',
            'Content-Type': 'application/json'
        }

        const solverRes = await fetch("https://fathurweb.qzz.io/api/solver/turnstile-min", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: "https://asitha.top/channel-manager", 
                siteKey: "0x4AAAAAACJYx5nt6TnJ_qx9" 
            })
        })
        
        const cf = await solverRes.json()
        if (!cf.status) throw 'Error de Captcha'

        const metaUrl = `https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/metadata-proxy?url=${encodeURIComponent(link.trim())}`
        const metaRes = await fetch(metaUrl, { headers: commonHeaders })
        const metadata = await metaRes.json()

        const tempRes = await fetch("https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/user/get-temp-token", {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({ cf_token: cf.result })
        })
        const temp = await tempRes.json()
        if (!temp.token) throw 'Error de Token'

        const reactRes = await fetch(`https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post?apiKey=${temp.token}`, {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({
                post_link: link.trim(),
                reacts: emojis.trim()
            })
        })
        const result = await reactRes.json()

        let response = `✅ *RESULTADO*\n\n`
        response += `*Canal:* ${metadata.title || 'Canal de WhatsApp'}\n`
        response += `*Emojis:* ${emojis.trim()}\n`
        response += `*Estado:* ${result.status ? 'Completado' : 'Fallo'}`

        if (metadata.preview) {
            await conn.sendMessage(m.chat, { image: { url: `https://pps.whatsapp.net${metadata.preview}` }, caption: response }, { quoted: m })
        } else {
            await conn.reply(m.chat, response, m)
        }

        await m.react('🚀')

    } catch (e) {
        await m.react('✖️')
        return conn.reply(m.chat, `❌ Error: ${e.message || e}`, m)
    }
}

handler.command = /^(reactch|barboza|reactcanal)$/i
handler.group = false

export default handler