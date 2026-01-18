import axios from 'axios';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`*Uso:* ${usedPrefix + command} <url_terabox>`);

    const targetUrl = args[0];
    m.reply("_Generando enlaces de descarga..._");

    try {
        const { data: cf } = await axios.post('https://api.nekolabs.web.id/tls/bypass/cf-turnstile', {
            url: 'https://teraboxdl.site',
            siteKey: '0x4AAAAAACG0B7jzIiua8JFj'
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (!cf.result) throw new Error('No se pudo obtener el token de seguridad.');

        const { data: res } = await axios.post('https://teraboxdl.site/api/proxy', {
            url: targetUrl,
            cf_token: cf.result
        }, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Referer': 'https://teraboxdl.site/',
                'Origin': 'https://teraboxdl.site'
            }
        });

        if (!res.list || res.list.length === 0) throw new Error('No se encontraron archivos.');

        const file = res.list[0];
        let txt = `✅ *Archivo Encontrado*\n\n`;
        txt += `*Nombre:* ${file.server_filename}\n`;
        txt += `*Tamaño:* ${(file.size / (1024 * 1024)).toFixed(2)} MB\n\n`;
        txt += `*Enlace Directo:* ${file.direct_link}\n\n`;
        txt += `*Stream:* ${file.stream_url}`;

        await conn.sendMessage(m.chat, { 
            text: txt,
            contextInfo: {
                externalAdReply: {
                    title: "Terabox Downloader",
                    body: file.server_filename,
                    thumbnailUrl: file.thumbs?.url1,
                    sourceUrl: targetUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (err) {
        m.reply(`❌ *Error:* ${err.message}`);
    }
};

handler.help = ['terabox'];
handler.tags = ['tools'];
handler.command = /^(terabox|dlterabox)$/i;

export default handler;