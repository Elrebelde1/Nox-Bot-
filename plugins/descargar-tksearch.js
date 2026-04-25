import axios from "axios";
import Jimp from "jimp";

const handler = async (m, { conn, text, usedPrefix, command }) => {
    
    if (command === 'cartel') {
        if (!text) return m.reply(`📝 Escribe el mensaje para el pizarrón.\n\n*Ejemplo:* ${usedPrefix}${command} Sasuke is goat`);

        try {
            m.react("🎨");

            // Enlace directo a tu imagen de Sasuke
            const urlBase = 'https://qu.ax/liznC';

            // Descargar la imagen
            const response = await axios.get(urlBase, { responseType: 'arraybuffer' });
            if (!response.data || response.status !== 200) {
                throw new Error("No se pudo descargar la imagen base.");
            }
            const imageBuffer = Buffer.from(response.data);

            // Cargar imagen y fuente
            const imagen = await Jimp.read(imageBuffer);
            const fuente = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // Fuente negra mediana

            // Coordenadas y ancho máximo para el texto
            // Es posible que necesites ajustar estas coordenadas (x, y) 
            // según dónde esté exactamente el pizarrón en tu imagen.
            const x = 120;     // Distancia desde la izquierda
            const y = 180;     // Distancia desde arriba
            const anchoMax = 350; // Ancho máximo del texto

            // Dibujar el texto sobre la imagen
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
            console.error("Error detallado:", e);
            m.reply("⚠️ Hubo un fallo al generar la imagen. Verifica que el enlace de la imagen base siga funcionando.");
        }
        return;
    }
};

handler.command = /^cartel$/i;
export default handler;
