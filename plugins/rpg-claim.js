import db from '../lib/database.js';

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    
    // Inicializar si no existe (aseguramos que tenga dinero y el registro de tiempo)
    if (!user) {
        global.db.data.users[m.sender] = {};
        user = global.db.data.users[m.sender];
    }
    if (typeof user.money !== 'number') user.money = 0;
    if (typeof user.lastDailyClaim !== 'number') user.lastDailyClaim = 0;

    // --- CONFIGURACIÓN DE TIEMPO (24 HORAS) ---
    let cooldown = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    let tiempoRestante = (user.lastDailyClaim + cooldown) - new Date();

    if (tiempoRestante > 0) {
        return m.reply(`📅 Ya has reclamado tu recompensa de hoy.\n\nRegresa en: *${msToTime(tiempoRestante)}*`);
    }

    // --- RECOMPENSA ALEATORIA (30, 40 o 50) ---
    let opciones = [30, 40, 50];
    let monedasGanadas = opciones[Math.floor(Math.random() * opciones.length)];

    // --- GUARDAR CAMBIOS ---
    user.money += monedasGanadas;
    user.lastDailyClaim = new Date() * 1; // Guarda la fecha actual en milisegundos

    let mensaje = `
📅 *RECOMPENSA DIARIA* 📅
━━━━━━━━━━━━━━━━━━
✨ Hoy has ganado: *${monedasGanadas}* monedas.
💰 Saldo total: *${user.money}* monedas.
━━━━━━━━━━━━━━━━━━
_Vuelve mañana para más._`.trim();

    await m.reply(mensaje);
};

// Función para convertir milisegundos a formato legible (Horas, minutos)
function msToTime(duration) {
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    
    let hDisplay = hours > 0 ? `${hours}h ` : "";
    let mDisplay = minutes > 0 ? `${minutes}m` : "menos de 1m";
    return hDisplay + mDisplay;
}

handler.help = ['diario'];
handler.tags = ['rpg'];
handler.command = ['diario', 'daily', 'claim2']; 

export default handler;
