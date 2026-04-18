//aquí tiene play solo con scraper 
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }

        let txt = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n`
        txt += `│\n`
        txt += `│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n`
        txt += `│ ${usedPrefix + command} [nombre o link]\n`
        txt += `│\n`
        txt += `│ 🌑 "ʙᴜsᴄᴀ ᴛᴜ ᴅᴇsᴛɪɴᴏ ᴇɴ ʟᴀ ᴍᴜsɪᴄᴀ"\n`
        txt += `╰────────────────────────────╯`

        return await conn.sendMessage(m.chat, {
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url },
            caption: txt,
            footer: "By Barboza-Team ⚡",
            buttons: botonesCanal,
            headerType: 4
        }, { quoted: m })
    }

    try {
        if (m.react) await m.react('⏳')

        const search = await yts(text)
        if (!search || !search.all || search.all.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ʀᴇsᴜʟᴛᴀᴅᴏs.', m)
        }

        const result = search.videos[0]
        const { title, thumbnail, timestamp, videoId } = result
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
        const isAudio = /play$|yta|ytmp3|playaudio/.test(command)
        
        let downloadUrl = null;
        let selectedServer = "Ytdown (Scraper Nativo)";

        // 🔥 ÚNICO MÉTODO: Scraper Ytdown
        try {
            downloadUrl = await getYtdownLink(videoUrl, isAudio);
        } catch (errScraper) {
            console.error("Error en el Scraper Ytdown:", errScraper.message);
        }

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, `🛑 ᴇʀʀᴏʀ ᴀʟ ᴏʙᴛᴇɴᴇʀ ᴅᴇsᴄᴀʀɢᴀ. (Los servidores podrían estar saturados, intenta de nuevo)`, m)
        }

        let info = `╭─〔 ♆ *ᴜᴄʜɪʜᴀ ʏᴏᴜᴛᴜʙᴇ* ♆ 〕─╮\n│\n│ 🎬 *ᴛɪᴛᴜʟᴏ:* ${title}\n│ ⏱️ *ᴅᴜʀᴀᴄɪᴏɴ:* ${timestamp}\n│ 📡 *sᴇʀᴠɪᴅᴏʀ:* ${selectedServer}\n│\n│ 🌑 "ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ᴇs ᴍɪ ɢᴜɪᴀ"\n╰────────────────────────────╯`

        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption: info,
            footer: "By Barboza-Team ⚡",
            buttons: botonesCanal,
            headerType: 4
        }, { quoted: m })

        if (isAudio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg', 
                fileName: `${title}.mp3` 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                mimetype: 'video/mp4', 
                caption: `✅ *ʀᴇᴘʀᴏᴅᴜᴄᴄɪᴏ́ɴ ʟɪsᴛᴀ*\n🎬 ${title}`,
                footer: "By Barboza-Team ⚡",
                buttons: botonesCanal,
                headerType: 4
            }, { quoted: m })
        }

        if (m.react) await m.react('✅')
    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|playaudio|mp4|ytmp4)$/i
export default handler

// ==========================================
// 🔥 FUNCION DEL SCRAPER (YTDOWN)
// ==========================================
async function getYtdownLink(ytUrl, isAudio) {
    const BASE = 'https://app.ytdown.to';
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    const sleep = ms => new Promise(r => setTimeout(r, ms));
  
    const HEADERS = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
      'Origin': BASE, 
      'Referer': BASE + '/en23/',
    };
  
    const postProxy = async (clientProxy, urlQuery) => {
      const body = new URLSearchParams({ url: urlQuery }).toString();
      const { data } = await clientProxy.post(BASE + '/proxy.php', body, { headers: HEADERS });
      return (typeof data === 'object' ? data : JSON.parse(data))?.api;
    }
  
    const poll = async (clientProxy, workerUrl) => {
      for (let i = 1; i <= 40; i++) {
        const api = await postProxy(clientProxy, workerUrl);
        if (api?.status === 'completed' && api.fileUrl) return api.fileUrl;
        if (api?.status === 'error') throw new Error('Error en el worker del servidor');
        if (i < 40) await sleep(3000); 
      }
      throw new Error('Tiempo agotado al convertir el archivo');
    }
  
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true, timeout: 30000, headers: { 'User-Agent': UA } }));
  
    await client.get(BASE + '/');
  
    const api = await postProxy(client, ytUrl);
    if (!api || api.status === 'error') throw new Error(`API error: ${api?.code || 'Desconocido'}`);
  
    const formatFilter = isAudio ? 'mp3' : 'mp4';
    const opciones = api.mediaItems.filter(m => m.mediaExtension?.toLowerCase() === formatFilter);
    if (!opciones.length) throw new Error(`No se encontraron resoluciones en ${formatFilter.toUpperCase()}`);
  
    let elegido;
    if (isAudio) {
        elegido = opciones[0];
    } else {
        elegido = opciones.find(m => String(m.mediaRes).includes('480'));
        if (!elegido) elegido = opciones.find(m => String(m.mediaRes).includes('360'));
        if (!elegido) elegido = opciones[opciones.length - 1]; 
    }
  
    const downloadUrl = await poll(client, elegido.mediaUrl);
    return downloadUrl;
}