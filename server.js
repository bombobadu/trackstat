const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());

let gameData = {};

// Roblox'tan veri alma
app.post('/update', (req, res) => {
    const { username, gems, gpm, gph } = req.body;
    gameData[username] = { gems, gpm, gph, lastUpdate: new Date().toLocaleTimeString() };
    console.log(`Veri geldi: ${username} - ${gems}`);
    res.status(200).send("OK");
});

// Dashboard sayfası (Basit ve Siyah Tema)
app.get('/', (req, res) => {
    let rows = "";
    for (let user in gameData) {
        rows += `
        <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 10px; border-left: 5px solid #00ffff;">
            <h2 style="color: #fff; margin: 0;">${user}</h2>
            <p style="color: #00ffff; font-size: 24px; font-weight: bold; margin: 10px 0;">Gems: ${gameData[user].gems}</p>
            <div style="display: flex; gap: 20px;">
                <span style="color: #ffcc00;">Gems/m: ${gameData[user].gpm}</span>
                <span style="color: #ffcc00;">Gems/h: ${gameData[user].gph}</span>
            </div>
            <small style="color: #555;">Son Güncelleme: ${gameData[user].lastUpdate}</small>
        </div>`;
    }

    res.send(`
        <body style="background: #000; font-family: sans-serif; padding: 40px;">
            <h1 style="color: #fff; text-align: center;">Batu Tracker Dashboard</h1>
            <div id="data">${rows || '<p style="color: #555; text-align: center;">Henüz veri gelmedi...</p>'}</div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif: ${PORT}`));
