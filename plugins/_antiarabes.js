import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { tmpdir } from 'os'

const streamPipeline = promisify(pipeline)
const API_KEY = 'barboza'
const API_BASE = 'https://getmod-mediahub.vercel.app/api/getmod'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const isDownload = /^(getmoddl|gmdl)$/i.test(command)
  
  if (isDownload) {
    if (!text) {
      return conn.reply(m.chat, `❌ Proporciona un enlace de GETMODSAPK.COM\n\n*Ejemplo:* ${usedPrefix + command} https://getmodsapk.com/minecraft-mod-apk/`, m)
    }

    let tempFile = null
    try {
      await m.react('📥')
      
      const cleanUrl = decodeURIComponent(text)
      const apiUrl = `${API_BASE}?url=${encodeURIComponent(cleanUrl)}&apikey=${API_KEY}`
      
      const response = await fetch(apiUrl)
      const json = await response.json()
      
      if (!json.success || !json.data) throw new Error('No se pudo obtener la información del APK')
      
      const appData = json.data
      if (!appData.directDownloadUrl) throw new Error('No se encontró el enlace de descarga directo')
      
      await m.react('⏳')
      await conn.reply(m.chat, `📦 *Descargando:* ${appData.title}\n💾 *Tamaño:* ${appData.size}\n\n🔄 Esto Puede Tardar Unos Minutos Espere...`, m)
      
      tempFile = path.join(tmpdir(), `getmod_${Date.now()}.apk`)
      await downloadAPK(appData.directDownloadUrl, tempFile)
      
      const fileStats = fs.statSync(tempFile)
      const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2)

      await m.react('📤')
      
      let caption = `╭─❒「 *GETMODSAPK.COM* 」\n`
      caption += `│ 🎮 *Nombre:* ${appData.title}\n`
      caption += `│ 📂 *Categoría:* ${appData.category}\n`
      caption += `│ ⭐ *Versión:* ${appData.version}\n`
      caption += `│ 💾 *Tamaño:* ${fileSizeMB} MB\n`
      if (appData.modInfo && appData.modInfo !== 'N/A') {
        caption += `│ 🔧 *MOD:* ${appData.modInfo}\n`
      }
      caption += `╰─⬣\n\n`
      caption += `> © Código Oficial de *MediaHub™*`

      await conn.sendMessage(m.chat, {
        document: { url: tempFile },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${appData.title.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
        caption
      }, { quoted: m })

      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
      conn.reply(m.chat, `🚫 *Error:* ${e.message}`, m)
    }
    return
  }

  // --- LÓGICA DE BÚSQUEDA ÚNICA ---
  if (!text.trim()) {
    return conn.reply(m.chat,
      `╭─⬣「 *BUSCADOR GETMODSAPK* 」⬣\n` +
      `│ 📌 *Uso:* ${usedPrefix + command} <juego>\n` +
      `│ 🧪 *Ejemplo:* ${usedPrefix + command} minecraft\n` +
      `╰─⬣`, m)
  }

  await conn.reply(m.chat, `🔎 *Buscando en GETMODSAPK:* _${text}_`, m)

  try {
    const apiUrl = `${API_BASE}?q=${encodeURIComponent(text.trim())}&apikey=${API_KEY}`
    const response = await fetch(apiUrl)
    const json = await response.json()

    if (!json.success || !json.data || json.data.length === 0) {
      return conn.reply(m.chat, `❌ No se encontraron resultados para "${text}".`, m)
    }

    // SELECCIONAMOS SOLO EL PRIMER RESULTADO [0]
    const app = json.data[0]
    
    let caption = `╭─❒「 *GETMODSAPK Search* 」\n`
    caption += `│ 🎮 *Nombre:* ${app.title}\n`
    caption += `│ 📂 *Categoría:* ${app.category}\n`
    caption += `│ ⭐ *Versión:* ${app.version}\n`
    caption += `│ 💾 *Tamaño:* ${app.size}\n`
    caption += `│ 🔗 *URL:* ${app.link}\n`
    caption += `╰─⬣\n> © Código Oficial de *MediaHub™*`

    const buttons = [
      { 
        buttonId: `${usedPrefix}getmoddl ${app.link}`, 
        buttonText: { displayText: "📥 Descargar APK" }, 
        type: 1 
      }
    ]

    // ENVIAR EL RESULTADO ÚNICO
    if (app.image) {
      await conn.sendMessage(m.chat, {
        image: { url: app.image },
        caption,
        footer: "📥 Presiona para descargar",
        buttons
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: caption,
        footer: "📥 Presiona para descargar",
        buttons
      }, { quoted: m })
    }

  } catch (error) {
    await conn.reply(m.chat, `🚫 *Error:* ${error.message}`, m)
  }
}

handler.help = ['getmod', 'getmoddl']
handler.tags = ['search']
handler.command = /^(getmod|getmodsearch|getmoddl|gmdl)$/i

export default handler

// Función de descarga (simplificada para el ejemplo)
async function downloadAPK(downloadUrl, outputPath) {
  const res = await fetch(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }})
  if (!res.ok) throw new Error(`Fallo descarga: ${res.statusText}`)
  await streamPipeline(res.body, fs.createWriteStream(outputPath))
}
