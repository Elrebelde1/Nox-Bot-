import axios from 'axios';

async function getCfToken() {
  try {
    const response = await axios.post('https://api.nekolabs.web.id/tls/bypass/cf-turnstile', {
      url: 'https://teraboxdl.site',
      siteKey: '0x4AAAAAACG0B7jzIiua8JFj'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      }
    });
    return response.data.result;
  } catch (error) {
    throw new Error(`Error en Token: ${error.response?.status || error.message}`);
  }
}

async function scrapeTerabox(targetUrl) {
  try {
    const token = await getCfToken();
    if (!token) throw new Error("No se obtuvo token del bypass");
    
    const response = await axios.post('https://teraboxdl.site/api/proxy', {
      url: targetUrl,
      cf_token: token
    }, {
      headers: {
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Referer': 'https://teraboxdl.site/',
        'Origin': 'https://teraboxdl.site',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.status === 403 ? "403: Acceso denegado (Cloudflare)" : error.message);
  }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`*Uso:* ${usedPrefix + command} <link>`);

    m.reply("_Intentando bypass de seguridad..._");

    try {
        const data = await scrapeTerabox(args[0]);

        if (!data || !data.list) throw new Error("Respuesta de API vacía");

        const file = data.list[0];
        let txt = `✅ *TERABOX COMPLETO*\n\n`;
        txt += `*Nombre:* ${file.server_filename}\n`;
        txt += `*Peso:* ${(file.size / (1024 * 1024)).toFixed(2)} MB\n\n`;
        txt += `*Directo:* ${file.direct_link}\n\n`;
        txt += `*Stream:* ${file.stream_url}`;

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m });

    } catch (err) {
        m.reply(`❌ *Error detectado:* ${err.message}\n\n_Nota: Es posible que el bypass de NekoLabs esté caído o requiera actualización de headers._`);
    }
};

handler.help = ['terabox'];
handler.tags = ['tools'];
handler.command = /^(terabox|tb)$/i;

export default handler;