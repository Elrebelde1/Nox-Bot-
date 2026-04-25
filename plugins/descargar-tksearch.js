import Jimp from "jimp";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`📝 Escribe el mensaje para el pizarrón.\n\n*Ejemplo:* ${usedPrefix}${command} Sasuke is goat`);

    try {
        m.react("🎨");

        // Imagen de Sasuke en Base64 para que nunca falle (es un texto largo, no lo toques)
        const sasukeBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAYAAAC+ZpdaAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgc4YYwAAAABJRU5ErkJggg=="; // Nota: He acortado la cadena para el ejemplo, pero en el código real debe ser la cadena completa de la imagen.

        // Convertir Base64 a un buffer que Jimp pueda leer
        const base64Data = sasukeBase64.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const imagen = await Jimp.read(imageBuffer);
        const fuente = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // Fuente mediana negra

        // Coordenadas y ancho máximo para centrar el texto en el pizarrón
        const x = 120;
        const y = 180;
        const anchoMax = 350;

        // Escribir el texto sobre la imagen
        imagen.print(
            fuente,
            x,
            y,
            {
                text: text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            anchoMax,
            anchoMax
        );

        // Convertir la imagen final a un buffer para enviarla
        const bufferFinal = await imagen.getBufferAsync(Jimp.MIME_PNG);

        // Enviar la imagen
        await conn.sendMessage(m.chat, { 
            image: bufferFinal, 
            caption: '⚡ *Sasuke ha hablado:*' 
        }, { quoted: m });

        m.react("✅");

    } catch (e) {
        console.error(e);
        m.reply("⚠️ Hubo un fallo interno al generar la imagen.");
    }
};

handler.command = /^cartel$/i;
export default handler;
