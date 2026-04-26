import { igdl } from 'ruhend-scraper';

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  // Limpieza del link para evitar errores por parámetros de rastreo
  let cleanUrl = text.split(' ')[0].split('?')[0];

  // Manejadores para los botones (HD y Audio)
  if (command === 'fb_vid' || command === 'fb_aud') {
    const res = await igdl(cleanUrl);
    const result = res.data;

    const dataHd = result.find(i => i.resolution === "720p (HD)") || result[0];

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
    const res = await igdl(cleanUrl);
    const result = res.data;

    if (!result || result.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, '*No se encontraron resultados para este video.*', m);
    }

    const data = result.find(i => i.resolution === "720p (HD)") || result.find(i => i.resolution === "360p (SD)") || result[0];

    await m.react('✅');

    const buttons = [
      { buttonId: `${usedPrefix}fb_vid ${cleanUrl}`, buttonText: { displayText: 'Video en HD 🎥' }, type: 1 },
      { buttonId: `${usedPrefix}fb_aud ${cleanUrl}`, buttonText: { displayText: 'Extraer Audio 🎵' }, type: 1 }
    ];

    const caption = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   ✅  *FACEBOOK DESCARGADO* ╚════════════════════╝

_Usa los botones para obtener la mejor calidad o el audio._`.trim();

    await conn.sendMessage(m.chat, { 
      video: { url: data.url }, 
      caption: caption,
      footer: 'By Barboza-Team ⚡',
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
