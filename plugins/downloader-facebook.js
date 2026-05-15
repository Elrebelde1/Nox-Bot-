import fetch from "node-fetch"

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  let cleanUrl = text.split(' ')[0].split('?')[0];

  if (command === 'fb_vid' || command === 'fb_aud') {
    const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
    const endpoint = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL2RsL2ZhY2Vib29r")
    const access = b("c2FzdWtl")

    const res = await fetch(`${endpoint}?url=${encodeURIComponent(cleanUrl)}&key=${access}`)
    const json = await res.json()
    const result = json.resultados;

    const dataHd = result.find(i => i.quality.includes("720p") || i.quality.includes("HD")) || result[0];

    if (command === 'fb_vid') {
      return await conn.sendMessage(m.chat, { 
        video: { url: dataHd.url }, 
        caption: `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ✅  *FACEBOOK HD LISTO* \n╚════════════════════╝` 
      }, { quoted: m });
    } else {
      return await conn.sendMessage(m.chat, { 
        audio: { url: dataHd.url }, 
        mimetype: 'audio/mp4', 
        fileName: 'fb.mp3' 
      }, { quoted: m });
    }
  }

  if (!args[0]) {
    return conn.reply(m.chat, '╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ❌  *ERROR DE ENLACE* \n╚════════════════════╝\n\n*Ingresa el link del video a descargar.*', m);
  }

  await m.react('🕒');

  try {
    const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
    const endpoint = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL2RsL2ZhY2Vib29r")
    const access = b("c2FzdWtl")

    const res = await fetch(`${endpoint}?url=${encodeURIComponent(cleanUrl)}&key=${access}`)
    const json = await res.json()
    const result = json.resultados;

    if (!json.status || !result || result.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, '*No se encontraron resultados para este video.*', m);
    }

    let data = result.find(i => i.quality.includes("720p") || i.quality.includes("HD")) || result.find(i => i.quality.includes("360p") || i.quality.includes("SD")) || result[0];

    if (!data.url || data.url === "/") {
        data = result.find(v => v.url && v.url !== "/")
    }

    await m.react('✅');

    const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
    const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

    const buttons = [
      { buttonId: `${usedPrefix}fb_vid ${cleanUrl}`, buttonText: { displayText: 'Video en HD 🎥' }, type: 1 },
      { buttonId: `${usedPrefix}fb_aud ${cleanUrl}`, buttonText: { displayText: 'Extraer Audio 🎵' }, type: 1 }
    ];

    const caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ✅  *FACEBOOK DESCARGADO* \n╚════════════════════╝\n\n_Usa los botones para obtener la mejor calidad o el audio._`.trim();

    await conn.sendMessage(m.chat, { 
      video: { url: data.url }, 
      caption: caption,
      footer: `${dev} x ${net}`,
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (error) {
    await m.react('❌');
    return conn.reply(m.chat, '*Error al procesar el enlace. Facebook bloqueó la conexión o el link es inválido.*', m);
  }
};

handler.help = ['fb <link>'];
handler.tags = ['downloader'];
handler.command = /^(fb|facebook|fbdl|fb_vid|fb_aud)$/i;

export default handler;
