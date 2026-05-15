let activeGames = new Map();

const gameHandler = async (m, { conn, command, args, usedPrefix }) => {
    const mentionedJid = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
    const userChoice = command.toLowerCase() === 'rival' ? null : args[0]?.toLowerCase();

    // 1. MENÚ PRINCIPAL (.game)
    if (command === 'game' && args.length === 0 && !mentionedJid) {
        const caption = `🎮 *P.P.T - SELECCIÓN*\n\n¿Contra quién quieres jugar?`;
        const buttons = [
            { buttonId: `${usedPrefix}game bot`, buttonText: { displayText: "🤖 Contra el Bot" }, type: 1 },
            { buttonId: `${usedPrefix}game member_tag`, buttonText: { displayText: "👥 Contra un Miembro" }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, { 
            text: caption, 
            buttons: buttons,
            viewOnce: true 
        }, { quoted: m });
    }

    // 2. RESPUESTA AL BOTÓN "CONTRA UN MIEMBRO"
    if (args[0] === 'member_tag') {
        return conn.reply(m.chat, `⏭️ *¡Excelente!*\n\nPara jugar contra alguien, usa el comando:\n*${usedPrefix}rival @usuario*`, m);
    }

    // 3. INICIO DE PARTIDA
    if (args[0] === 'bot' || command === 'rival') {
        if (command === 'rival' && !mentionedJid) {
            return conn.reply(m.chat, `⚠️ Debes etiquetar a alguien.\nEjemplo: *${usedPrefix}rival @tag*`, m);
        }
        
        if (mentionedJid === m.sender) return conn.reply(m.chat, `❌ No puedes jugar contra ti mismo.`, m);

        let opponent = mentionedJid ? mentionedJid : 'bot';
        activeGames.set(m.chat, { player1: m.sender, player2: opponent });

        const oppName = opponent === 'bot' ? 'el Bot' : `@${opponent.split('@')[0]}`;
        const caption = `🕹️ *PARTIDA INICIADA*\n\n*Retador:* @${m.sender.split('@')[0]}\n*Oponente:* ${oppName}\n\n¡Haz tu elección abajo!`;

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

    // 4. PROCESAR RESULTADO Y ETIQUETAR
    let choices = ['piedra', 'papel', 'tijera'];
    if (choices.includes(userChoice)) {
        let game = activeGames.get(m.chat);
        if (!game) return;

        let botChoice = choices[Math.floor(Math.random() * choices.length)];
        let status = getResult(userChoice, botChoice);
        
        let winner, loser, resultMsg;
        const p1 = `@${game.player1.split('@')[0]}`;
        const p2 = game.player2 === 'bot' ? '🤖 Bot' : `@${game.player2.split('@')[0]}`;

        if (status === 'win') {
            winner = p1;
            loser = p2;
            resultMsg = `🎉 *¡GANADOR:* ${winner}!\n💀 *¡PERDEDOR:* ${loser}`;
        } else if (status === 'lose') {
            winner = p2;
            loser = p1;
            resultMsg = `🎉 *¡GANADOR:* ${winner}!\n💀 *¡PERDEDOR:* ${loser}`;
        } else {
            resultMsg = `🤝 *¡HA SIDO UN EMPATE!*\nAmbos eligieron ${userChoice.toUpperCase()}`;
        }

        const captionResult = `
🕹️ *RESULTADOS FINALES*
──────────────
🙋‍♂️ ${p1}: ${userChoice.toUpperCase()}
🤖 ${p2}: ${botChoice.toUpperCase()}
──────────────
${resultMsg}
`.trim();

        const endButtons = [
            { buttonId: `${usedPrefix}game`, buttonText: { displayText: "🔄 Juego Nuevo" }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            text: captionResult,
            buttons: endButtons,
            mentions: [game.player1, ...(game.player2 !== 'bot' ? [game.player2] : [])],
            viewOnce: true
        }, { quoted: m });

        activeGames.delete(m.chat);
    }
};

function getResult(user, bot) {
    if (user === bot) return "tie";
    if ((user === 'piedra' && bot === 'tijera') || (user === 'papel' && bot === 'piedra') || (user === 'tijera' && bot === 'papel')) {
        return "win";
    }
    return "lose";
}

gameHandler.help = ['game', 'rival @tag'];
gameHandler.tags = ['game'];
gameHandler.command = /^(game|rival)$/i;

export default gameHandler;
