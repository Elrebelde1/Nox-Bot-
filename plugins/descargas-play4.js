import axios from 'axios'
import { createSticker, StickerTypes } from 'wa-sticker-formatter'

class StickerPack {
  async search(query) {
    const res = await axios.post(
      'https://getstickerpack.com/api/v1/stickerdb/search',
      { query, page: 1 }
    ).then(v => v.data)

    return (res.data || []).map(v => ({
      name: v.title,
      slug: v.slug,
      download: v.download_counter
    }))
  }

  async detail(slug) {
    const res = await axios.get(
      `https://getstickerpack.com/api/v1/stickerdb/stickers/${slug}`
    ).then(v => v.data.data)

    return {
      title: res.title,
      stickers: (res.images || []).map(v => ({
        image: `https://s3.getstickerpack.com/${v.url}`,
        animated: v.is_animated !== 0
      }))
    }
  }
}

const scraper = new StickerPack()

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (args[0] === 'pick') {
    const slug = args[1]
    if (!slug) return

    try {
      const res = await scraper.detail(slug)
      if (!res.stickers.length) return m.reply('🌀 Este pergamino está vacío... Qué pérdida de tiempo.')

      const safeName = res.title
        .replace(/[*_`]/g, '')
        .replace(/\s*\n\s*/g, ' ')

      m.reply(`👁️ Mi Sharingan está analizando: ${safeName}. Prepárate.`)

      const hasStatic = res.stickers.some(s => !s.animated)

      let sent = 0
      for (let s of res.stickers) {
        if (sent >= 10) break
        if (hasStatic && s.animated) continue

        try {
          const img = await axios.get(s.image, { responseType: 'arraybuffer' })
          const buffer = Buffer.from(img.data)

          const sticker = await createSticker(buffer, {
            pack: '🌀 Sᴀsᴜᴋᴇ-Bᴏᴛ-MD',
            author: 'Uᴄʜɪʜᴀ Cʟᴀɴ',
            type: s.animated ? StickerTypes.FULL : StickerTypes.DEFAULT
          })

          await conn.sendMessage(m.chat, { sticker }, { quoted: m })

          sent++
          await new Promise(r => setTimeout(r, 1500))
        } catch {}
      }

      return m.reply(`⚡ El Genjutsu ha terminado. He enviado ${sent} stickers de ${safeName}. No me hagas repetirlo.`)
    } catch {
      return m.reply('🌀 Fallaste el Jutsu. El servidor no responde a tu debilidad.')
    }
  }

  if (!args.length)
    return m.reply(`Hmp... Si quieres algo, búscalo bien:\n${usedPrefix + command} (nombre del pack)`)

  try {
    const packs = await scraper.search(args.join(' '))
    if (!packs.length) return m.reply('🌀 Mis ojos no ven nada con ese nombre. Inténtalo de nuevo... si te atreves.')

    const rows = packs.slice(0, 10).map(p => ({
      title: p.name,
      description: `Descargas: ${p.download}`,
      id: `${usedPrefix + command} pick ${p.slug}`
    }))

    await conn.sendMessage(m.chat, {
      text: '⚔️ Sᴇʟᴇᴄᴄɪᴏɴᴀ ᴛᴜ Oʙᴊᴇᴛɪᴠᴏ ⚔️',
      footer: 'Usa el menú si tienes el valor necesario.',
      buttons: [
        {
          buttonId: 'stickerpack_select',
          buttonText: { displayText: '🌀 Ver Pergaminos' },
          type: 4,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              title: 'Stickers Encontrados',
              sections: [
                {
                  title: 'Resultados del Rastreo',
                  rows
                }
              ]
            })
          }
        }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m })

  } catch {
    m.reply('🌀 Algo bloqueó mi camino. Inténtalo más tarde.')
  }
}

handler.help = ['stickerpack <query>']
handler.tags = ['sticker']
handler.command = /^stickerpack$/i
handler.limit = true
handler.register = true

export default handler
