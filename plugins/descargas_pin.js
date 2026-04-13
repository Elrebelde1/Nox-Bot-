import axios from "axios"

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("¿Qué quieres buscar?")

    try {
        // Reacción de espera
        await m.react('⏳')

        const apiUrl = `https://sylphyy.xyz/search/pinterest?q=${encodeURIComponent(text)}&api_key=sylphy-6f150d`
        const { data } = await axios.get(apiUrl)

        if (!data.status || !data.result) return m.reply("No hubo resultados.")

        // Limitar a 8 y enviar una por una
        let imagenes = data.result.slice(0, 8)

        for (let res of imagenes) {
            await conn.sendMessage(m.chat, { image: { url: res.image } }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply("Error al buscar imágenes.")
    }
}

handler.help = ['pin']
handler.tags = ['search']
handler.command = /^(pinterest|pin)$/i

export default handler
