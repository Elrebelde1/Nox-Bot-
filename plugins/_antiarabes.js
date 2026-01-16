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
      
      if (!json.success || !json.data) {
        throw new Error('No se pudo obtener la información del APK')
      }
      
      const appData = json.data
      
      if (!appData.directDownloadUrl) {
        throw new Error('No se encontró el enlace de descarga directo')
      }
      
      const sizeInMB = parseSizeToMB(appData.size)
      if (sizeInMB > 900) {
        await m.react('❌')
        return conn.reply(m.chat, 
          `🚫 *APK demasiado grande*\n\n` +
          `📦 *Nombre:* ${appData.title}\n` +
          `💾 *Tamaño:* ${appData.size}\n` +
          `⚠️ *Límite:* 900 MB`, m)
      }
      
      await m.react('⏳')
      await conn.reply(m.chat, `📦 *Descargando:* ${appData.title}\n💾 *Tamaño:* ${appData.size}\n\n🔄 Esto Puede Tardar Unos Minutos Espere...`, m)
      
      tempFile = path.join(tmpdir(), `getmod_${Date.now()}_${Math.random().toString(36).substring(7)}.apk`)
      
      await downloadAPK(appData.directDownloadUrl, tempFile)
      
      const fileStats = fs.statSync(tempFile)
      const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2)
      
      if (fileStats.size < 100000) {
        throw new Error('El APK descargado es muy pequeño o está corrupto')
      }

      await m.react('📤')
      
      const sendAsDocument = fileSizeMB > 50

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

      if (sendAsDocument) {
        await conn.sendMessage(m.chat, {
          document: { url: tempFile },
          mimetype: 'application/vnd.android.package-archive',
          fileName: `${appData.title.replace(/[^a-zA-Z0-9]/g, '_')}.apk`,
          caption
        }, { quoted: m })
      } else {
        await conn.sendFile(m.chat, tempFile, `${appData.title.replace(/[^a-zA-Z0-9]/g, '_')}.apk`, caption, m, false, {
          mimetype: 'application/vnd.android.package-archive'
        })
      }

      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }

      await m.react('✅')
    } catch (e) {
      await m.react('❌')
      
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }
      
      let errorMsg = '🚫 *Error al descargar el APK*\n\n'
      
      if (e.message.includes('404')) {
        errorMsg += '❌ APK no encontrado\n'
        errorMsg += '💡 El archivo pudo haber sido eliminado'
      } else if (e.message.includes('403') || e.message.includes('Forbidden')) {
        errorMsg += '❌ Acceso bloqueado\n'
        errorMsg += '💡 El servidor bloqueó la descarga'
      } else if (e.message.includes('timeout')) {
        errorMsg += '❌ Tiempo de espera agotado\n'
        errorMsg += '💡 El servidor está lento, intenta de nuevo'
      } else if (e.message.includes('muy pequeño') || e.message.includes('corrupto')) {
        errorMsg += '❌ Archivo corrupto o inválido\n'
        errorMsg += '💡 Intenta con otro enlace'
      } else {
        errorMsg += `❌ ${e.message}`
      }
      
      await conn.reply(m.chat, errorMsg, m)
      console.error('Error en getmoddl:', e.message)
    }
    return
  }

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
      return conn.reply(m.chat, 
        `❌ No se encontraron resultados para "${text}".\n\n` +
        `Intenta con otros términos.`, m)
    }

    const apps = json.data.slice(0, 5)

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i]
      
      let caption = `╭─❒「 *GETMODSAPK Search* 」\n`
      caption += `│ 🎮 *Nombre:* ${app.title}\n`
      caption += `│ 📂 *Categoría:* ${app.category}\n`
      caption += `│ ⭐ *Versión:* ${app.version}\n`
      caption += `│ 💾 *Tamaño:* ${app.size}\n`
      caption += `│ 🔗 *URL:* ${app.link}\n`
      caption += `╰─⬣\n> © Código Oficial de *MediaHub™*`

      const safeUrl = encodeURIComponent(app.link)
      
      const buttons = [
        { 
          buttonId: `.getmoddl ${safeUrl}`, 
          buttonText: { displayText: "📥 Descargar APK" }, 
          type: 1 
        }
      ]

      if (app.image) {
        await conn.sendMessage(m.chat, {
          image: { url: app.image },
          caption,
          buttons,
          footer: "📥 Presiona para descargar"
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          text: caption,
          buttons,
          footer: "📥 Presiona para descargar"
        }, { quoted: m })
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (error) {
    await conn.reply(m.chat, `🚫 *Error:* ${error.message}`, m)
  }
}

handler.help = ['getmod', 'getmodsearch <texto>', 'getmoddl <url>']
handler.tags = ['búsquedas', 'descargas']
handler.command = /^(getmod|getmodsearch|getmoddl|gmdl)$/i

export default handler

function parseSizeToMB(sizeStr) {
  if (!sizeStr || sizeStr === 'N/A' || sizeStr === ':') return 0
  
  const match = sizeStr.match(/([\d.]+)\s*([MG])B/i)
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  
  if (unit === 'G') {
    return value * 1024
  }
  return value
}

async function downloadAPK(downloadUrl, outputPath) {
  try {
    const apkResponse = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://getmodsapk.com/',
        'Accept': 'application/vnd.android.package-archive,application/octet-stream,*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow',
      timeout: 300000
    })

    if (!apkResponse.ok) {
      throw new Error(`HTTP ${apkResponse.status} al descargar APK`)
    }

    await streamPipeline(apkResponse.body, fs.createWriteStream(outputPath))

    const stats = fs.statSync(outputPath)
    if (stats.size < 1000000) {
      throw new Error('El archivo descargado es muy pequeño. Puede ser un archivo incorrecto.')
    }

  } catch (error) {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }
    throw new Error(`Error al descargar APK: ${error.message}`)
  }
}