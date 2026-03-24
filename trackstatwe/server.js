const express = require('express');
const app = express();
app.use(express.json());

let gameData = {}; // Verileri şimdilik burada tutalım

// Roblox'tan veri kabul eden uç nokta (Endpoint)
app.post('/update', (req, res) => {
    const { username, gems, gpm, gph } = req.body;
    gameData[username] = { gems, gpm, gph, lastUpdate: new Date() };
    console.log(`${username} verisi güncellendi: ${gems} Gems`);
    res.status(200).send("Veri alındı!");
});

// Sitenin verileri çekeceği yer
app.get('/status', (req, res) => {
    res.json(gameData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));