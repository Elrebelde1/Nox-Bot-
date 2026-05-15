let activeGames = new Map();

const gameHandler = async (m, { conn, command, args, usedPrefix }) => {
    const mentionedJid = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

    // 1. MENU INICIAL: Si solo ponen .game
    if (args.length === 0 && !mentionedJid) {
        const caption = `🎮 *MENÚ DE JUEGO*\n\n¿Contra quién quieres jugar Piedra, Papel o Tijera?`;
        const buttons = [
            { buttonId: `${usedPrefix}game bot`, buttonText: { displayText: "🤖 Contra el Bot" }, type: 1 },
            { buttonId: `${usedPrefix}game member_tag`, buttonText: { displayText: "👥 Contra un Miembro" }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, { 
            text: caption, 
            buttons: buttons, 
            headerType: 1,
            viewOnce: true 
        }, { quoted: m });
    }

    // 2. SOLICITAR MENCIÓN: Si eligió el botón de miembro pero no hay mención
    if (args[0] === 'member_tag' && !mentionedJid) {
        return conn.reply(m.chat, `⚠️ *¡Atención!* para jugar con alguien más debes mencionarlo.\n\nEscribe: *${usedPrefix}game @usuario*`, m);
    }

    // 3. INICIO AUTOMÁTICO: Si hay mención o eligió al bot
    if (args[0] === 'bot' || mentionedJid) {
        // Evitar jugar con uno mismo si es mención
        if (mentionedJid === m.sender) return conn.reply(m.chat, `❌ No puedes jugar contigo mismo. ¡Menciona a otro amigo!`, m);

        let opponent = mentionedJid ? mentionedJid : 'bot';
        
        // Guardar estado del juego
        activeGames.set(m.chat, {
            player1: m.sender,
            player2: opponent,
            isBot: opponent === 'bot'
        });

        const oppName = opponent === 'bot' ? 'el Bot' : `@${opponent.split('@')[0]}`;
        const caption = `🕹️ *PARTIDA INICIADA*\n\n*Retador:* @${m.sender.split('@')[0]}\n*Oponente:* ${oppName}\n\nSelecciona tu jugada:`;

        const buttons = [
            { buttonId: `${usedPrefix}game piedra`, buttonText: { displayText: "🪨 Piedra" }, type: 1 },
            { buttonId: `${usedPrefix}game papel`, buttonText: { displayText: "📄 Papel" }, type: 1 },
            { buttonId: `${usedPrefix}game tijera`, buttonText: { displayText: "✂️ Tijera" }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, {
            text: caption,
            buttons: buttons,
            mentions: [m.sender, ...(mentionedJid ? [mentionedJid] : [])],
            viewOnce: true
        }, { quoted: m });
    }

    // 4. PROCESAR JUGADA (Piedra, Papel o Tijera)
    let choices = ['piedra', 'papel', 'tijera'];
    let userChoice = args[0]?.toLowerCase();

    if (choices.includes(userChoice)) {
        let game = activeGames.get(m.chat);
        if (!game) return conn.reply(m.chat, `⚠️ No hay una partida activa. Inicia una con *${usedPrefix}game*`, m);

        // Lógica simplificada vs Bot (puedes expandir esto para PvP real luego)
        let botChoice = choices[Math.floor(Math.random() * choices.length)];
        let result = getResult(userChoice, botChoice);

        const resultText = `
🕹️ *RESULTADOS*
──────────────
🙋‍♂️ *Tú:* ${userChoice.toUpperCase()}
🤖 *Oponente:* ${botChoice.toUpperCase()}
──────────────
📌 *Estatus:* ${result}
`.trim();

        const endButtons = [
            { buttonId: `${usedPrefix}game`, buttonText: { displayText: "🔄 Juego Nuevo" }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            text: resultText,
            buttons: endButtons,
            viewOnce: true
        }, { quoted: m });

        activeGames.delete(m.chat); // Limpiar juego al terminar
    }
};

function getResult(user, bot) {
    if (user === bot) return "🤝 ¡Empate!";
    if (
        (user === 'piedra' && bot === 'tijera') ||
        (user === 'papel' && bot === 'piedra') ||
        (user === 'tijera' && bot === 'papel')
    ) {
        return "🎉 ¡Ganaste!";
    }
    return "😢 Perdiste...";
}

gameHandler.help = ['game'];
gameHandler.tags = ['game'];
gameHandler.command = /^(game)$/i;

export default gameHandler;
