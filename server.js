const express = require('express');
const app = express();
app.use(express.json());

// --- AYARLAR ---
const GEM_PRICE_USD = 0.75; // 1B Gems fiyatı (İstediğin zaman değiştir)
// -----------------

let gameData = {}; // Verileri şimdilik hafızada tutuyoruz

// Roblox'tan gelen veriyi yakala ve hesapla
app.post('/update', (req, res) => {
    const { username, rank, gems, gpm, h_count, t_count } = req.body;
    
    // Gems stringini sayıya çevir (Örn: "12.5B" -> 12500000000)
    let gems_num = 0;
    if (gems) {
        let n = parseFloat(gems);
        if (gems.includes('B')) gems_num = n * 1e9;
        else if (gems.includes('M')) gems_num = n * 1e6;
        else if (gems.includes('K')) gems_num = n * 1e3;
        else gems_num = n;
    }

    // USD hesapla
    let usd_val = ((gems_num / 1e9) * GEM_PRICE_USD).toFixed(2);

    // Veriyi kaydet/güncelle
    gameData[username] = { 
        rank: rank || "Rank ?",
        gems: gems || "0",
        gems_num: gems_num,
        gpm: gpm || "0/m",
        huges: h_count || 0,
        titanics: t_count || 0,
        usd: `$${usd_val} USD`,
        lastUpdate: new Date().toLocaleTimeString('tr-TR'),
        online: true 
    };
    res.status(200).send("OK");
});

// Yardımcı Fonksiyon: Büyük Sayıları Formatla (Örn: 12500000 -> 12.5M)
function formatLargeNumber(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toString();
}

// Modern Dashboard Arayüzü (HTML)
app.get('/', (req, res) => {
    // Toplamları Hesapla
    let active_accounts = 0;
    local_total_gems_num = 0;
    let local_total_huges = 0;
    let local_total_titanics = 0;

    let cards = "";
    for (let user in gameData) {
        active_accounts++;
        local_total_gems_num += gameData[user].gems_num;
        local_total_huges += gameData[user].huges;
        local_total_titanics += gameData[user].titanics;

        cards += `
        <div class="card">
            <div class="status-dot"></div>
            <div class="card-header">
                <h2 class="username">${user}</h2>
                <span class="rank-badge">${gameData[user].rank}</span>
            </div>
            <div class="main-stat">
                <span class="label">TOTAL GEMS</span>
                <span class="value gem-text">${gameData[user].gems}</span>
                <span class="sub-label yellow">${gameData[user].usd}</span>
            </div>
            <div class="sub-stats">
                <div class="stat gpm">
                    <span class="label">GEMS/M</span>
                    <span class="value yellow">${gameData[user].gpm}</span>
                </div>
                <div class="stat pet-stat">
                    <div><span class="huge-text">${gameData[user].huges}</span><span class="label">HUGES</span></div>
                    <div><span class="titanic-text">${gameData[user].titanics}</span><span class="label">TITANICS</span></div>
                </div>
            </div>
            <div class="footer">Last update: ${gameData[user].lastUpdate}</div>
        </div>`;
    }

    // Toplam Değerleri Formatla
    let formatted_total_gems = formatLargeNumber(local_total_gems_num);
    let total_gems_usd = ((local_total_gems_num / 1e9) * GEM_PRICE_USD).toFixed(2);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Batu PS99 Pro Tracker</title>
        <style>
            body { background: #080808; color: white; font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
            
            /* --- HEADER (ÜST BAR) STİLLERİ (image_17.png'den esinlenildi) --- */
            .header { background: #111; border-bottom: 2px solid #222; padding: 20px 40px; display: flex; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
            .header-stat { text-align: center; }
            .header-label { display: block; font-size: 0.7rem; color: #666; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
            .header-value { font-size: 1.8rem; font-weight: 200; }
            .total-gem-text { color: #00ffff; text-shadow: 0 0 15px rgba(0, 255, 255, 0.5); }
            .total-usd-text { color: #555; font-size: 1rem; margin-top: 5px; }

            /* --- KUTUCUKLAR VE GENEL STİLLER --- */
            .main-content { padding: 40px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
            .card { background: #121212; border: 1px solid #222; border-radius: 12px; padding: 25px; position: relative; transition: 0.3s; }
            .card:hover { border-color: #00ffff; box-shadow: 0 0 20px rgba(0, 255, 255, 0.1); }
            .status-dot { width: 10px; height: 10px; background: #00ff00; border-radius: 50%; position: absolute; top: 25px; right: 25px; box-shadow: 0 0 10px #00ff00; }
            .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding-bottom: 15px; margin-bottom: 20px; }
            .username { margin: 0; font-size: 1.2rem; color: #eee; }
            .rank-badge { background: #222; color: #aaa; padding: 5px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; }
            .label { display: block; font-size: 0.7rem; color: #666; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
            .value { font-size: 1.8rem; font-weight: bold; }
            .gem-text { color: #00ffff; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5); }
            .yellow { color: #ffcc00; font-size: 1.1rem; }
            .sub-stats { display: flex; flex-direction: column; gap: 15px; background: #1a1a1a; padding: 15px; border-radius: 8px; margin-top: 20px;}
            .stat { display: flex; justify-content: space-between; align-items: center;}
            .pet-stat { justify-content: space-around; text-align: center;}
            .huge-text { color: #ff4444; font-size: 1.5rem; font-weight: bold; }
            .titanic-text { color: #ff8800; font-size: 1.5rem; font-weight: bold; }
            .footer { margin-top: 15px; font-size: 0.7rem; color: #333; text-align: right; }
        </style>
        <script>setTimeout(() => location.reload(), 10000);</script>
    </head>
    <body>
        <div class="header">
            <div class="header-stat">
                <span class="header-label">ACTIVE ACCOUNTS</span>
                <span class="header-value">${active_accounts}</span>
            </div>
            <div class="header-stat">
                <span class="header-label">TOTAL GEMS</span>
                <span class="header-value total-gem-text">${formatted_total_gems}</span>
                <div class="total-usd-text">$${total_gems_usd} USD</div>
            </div>
            <div class="header-stat">
                <span class="header-label">TOTAL HUGES</span>
                <span class="header-value huge-text">${local_total_huges}</span>
            </div>
            <div class="header-stat">
                <span class="header-label">TOTAL TITANICS</span>
                <span class="header-value titanic-text">${local_total_titanics}</span>
            </div>
        </div>

        <div class="main-content">
            <div class="grid">${cards || '<div style="color:#222; text-align:center; width:100%; font-size:1.5rem; padding: 50px;">Giriş bekleniyor...</div>'}</div>
        </div>
    </body>
    </html>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("Sunucu aktif: " + PORT);
});
