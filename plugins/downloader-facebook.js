import { igdl } from 'ruhend-scraper';

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  // Manejadores para los botones (HD y Audio)
  if (command === 'fb_vid' || command === 'fb_aud') {
    const link = text.split(' ')[0];
    const res = await igdl(link);
    const result = res.data;
    
    // Para el video busca específicamente la mejor resolución
    const dataHd = result.find(i => i.resolution === "720p (HD)") || result[0];

    if (command === 'fb_vid') {
      return await conn.sendMessage(m.chat, { 
        video: { url: dataHd.url }, 
        caption: `✅ *Video Facebook HD extraído*` 
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
    return conn.reply(m.chat, '*`Ingresa El link Del vídeo a descargar ❤️‍🔥`*', m);
  }

  await m.react('🕒');
  
  try {
    const res = await igdl(args[0]);
    const result = res.data;

    if (!result || result.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, '*`No se encontraron resultados.`*', m);
    }

    // Selecciona el video inicial (prioriza HD para el primer envío)
    const data = result.find(i => i.resolution === "720p (HD)") || result.find(i => i.resolution === "360p (SD)") || result[0];

    await m.react('✅');

    // Configuración de botones
    const buttons = [
      { buttonId: `${usedPrefix}fb_vid ${args[0]}`, buttonText: { displayText: 'Video en HD' }, type: 1 },
      { buttonId: `${usedPrefix}fb_aud ${args[0]}`, buttonText: { displayText: 'Extraer Audio' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, { 
      video: { url: data.url }, 
      caption: '✅ *Facebook Descargado*',
      footer: 'By Barboza-Team ⚡',
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (error) {
    await m.react('❌');
    return conn.reply(m.chat, '*`Error al procesar el enlace de Facebook.`*', m);
  }
};

handler.help = ['fb *<link>*'];
handler.estrellas = 2;
handler.tags = ['downloader'];
// Se agregan los comandos internos fb_vid y fb_aud
handler.command = /^(fb|facebook|fbdl|fb_vid|fb_aud)$/i;

export default handler;
