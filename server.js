const express = require('express');
const app = express();
app.use(express.json());

let gameData = {};

// Roblox'tan gelen veriyi yakala
app.post('/update', (req, res) => {
    const { username, gems, gpm, gph } = req.body;
    gameData[username] = { 
        gems, gpm, gph, 
        lastUpdate: new Date().toLocaleTimeString('tr-TR'),
        online: true 
    };
    res.status(200).send("Veri Alındı");
});

// Modern Dashboard Arayüzü
app.get('/', (req, res) => {
    let cards = "";
    for (let user in gameData) {
        cards += `
        <div class="card">
            <div class="status-dot"></div>
            <h2 class="username">${user}</h2>
            <div class="stat-box">
                <span class="label">TOTAL GEMS</span>
                <span class="value gem-text">${gameData[user].gems}</span>
            </div>
            <div class="sub-stats">
                <div class="stat">
                    <span class="label">GEMS/M</span>
                    <span class="value yellow">${gameData[user].gpm}</span>
                </div>
                <div class="stat">
                    <span class="label">GEMS/H</span>
                    <span class="value yellow">${gameData[user].gph}</span>
                </div>
            </div>
            <div class="footer">Son Güncelleme: ${gameData[user].lastUpdate}</div>
        </div>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Batu PS99 Tracker</title>
        <style>
            body { background: #080808; color: white; font-family: 'Segoe UI', sans-serif; padding: 40px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            .card { background: #121212; border: 1px solid #222; border-radius: 12px; padding: 20px; position: relative; transition: 0.3s; }
            .card:hover { border-color: #00ffff; box-shadow: 0 0 15px rgba(0, 255, 255, 0.1); }
            .status-dot { width: 10px; height: 10px; background: #00ff00; border-radius: 50%; position: absolute; top: 20px; right: 20px; box-shadow: 0 0 10px #00ff00; }
            .username { margin-top: 0; font-size: 1.2rem; color: #eee; border-bottom: 1px solid #222; padding-bottom: 10px; }
            .stat-box { margin: 20px 0; }
            .label { display: block; font-size: 0.7rem; color: #666; font-weight: bold; letter-spacing: 1px; }
            .value { font-size: 1.8rem; font-weight: bold; }
            .gem-text { color: #00ffff; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5); }
            .sub-stats { display: flex; justify-content: space-between; background: #1a1a1a; padding: 10px; border-radius: 8px; }
            .yellow { color: #ffcc00; font-size: 1.1rem; }
            .footer { margin-top: 15px; font-size: 0.7rem; color: #444; text-align: right; }
            h1 { text-align: center; font-weight: 200; letter-spacing: 4px; color: #555; margin-bottom: 50px; }
        </style>
        <script>setTimeout(() => location.reload(), 5000);</script>
    </head>
    <body>
        <h1>BATU TRACKER SYSTEM</h1>
        <div class="grid">${cards || '<div style="color:#333; text-align:center; width:100%;">Giriş bekleniyor...</div>'}</div>
    </body>
    </html>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("Sunucu aktif: " + PORT);
});
