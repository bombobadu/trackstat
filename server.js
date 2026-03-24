const express = require('express');
const app = express();
app.use(express.json());

// --- AYARLAR ---
const GEM_PRICE_USD = 0.75; // 1B Gems fiyatı
// ---------------

let gameData = {};

app.post('/update', (req, res) => {
    const { username, rank, gems, gpm, huges_dict, titanics_dict } = req.body;
    
    // Gems stringini sayıya çevirme
    let gems_num = 0;
    if (gems) {
        let n = parseFloat(gems);
        if (gems.includes('B')) gems_num = n * 1e9;
        else if (gems.includes('M')) gems_num = n * 1e6;
        else if (gems.includes('K')) gems_num = n * 1e3;
        else gems_num = n;
    }

    gameData[username] = { 
        rank: rank || "Rank ?",
        gems: gems || "0",
        gems_num: gems_num,
        gpm: gpm || "0/m",
        huges_dict: huges_dict || {}, // {"Huge Hippo": 1}
        titanics_dict: titanics_dict || {},
        lastUpdate: new Date().toLocaleTimeString('tr-TR'),
        online: true 
    };
    res.status(200).send("Veri Alındı");
});

function formatNum(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toString();
}

app.get('/', (req, res) => {
    let active_accounts = 0;
    let total_gems_num = 0;
    let total_h = 0;
    let total_t = 0;
    let cards = "";

    for (let user in gameData) {
        let u = gameData[user];
        active_accounts++;
        total_gems_num += u.gems_num;
        
        let h_count = Object.values(u.huges_dict).reduce((a, b) => a + b, 0);
        let t_count = Object.values(u.titanics_dict).reduce((a, b) => a + b, 0);
        total_h += h_count;
        total_t += t_count;

        // Pet Listesi HTML (Görsel Desteği Eklenmiş)
        let petDetails = "";
        for (let pet in u.huges_dict) {
            petDetails += `
            <div class="pet-item">
                <img src="https://biggamesapi.io/image/${pet}" alt="${pet}" onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
                <span>${pet} x${u.huges_dict[pet]}</span>
            </div>`;
        }
        for (let pet in u.titanics_dict) {
            petDetails += `
            <div class="pet-item titanic-item">
                <img src="https://biggamesapi.io/image/${pet}" alt="${pet}" onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
                <span>[TITANIC] ${pet} x${u.titanics_dict[pet]}</span>
            </div>`;
        }

        cards += `
        <div class="card">
            <div class="card-header">
                <h2>${user} <span class="rank">${u.rank}</span></h2>
                <div class="status-dot"></div>
            </div>
            <div class="main-stat">
                <span class="label">TOTAL GEMS</span>
                <span class="gem-val">${u.gems}</span>
                <span class="usd-val">$${((u.gems_num/1e9)*GEM_PRICE_USD).toFixed(3)} USD</span>
            </div>
            <div class="sub-stats">
                <div class="stat gpm-stat"><span class="label">GEMS/M</span><span class="value yellow">${u.gpm}</span></div>
                <div class="stat pet-stat">
                    <div><span class="value red">${h_count}</span><span class="label">HUGES</span></div>
                    <div><span class="value yellow">${t_count}</span><span class="label">TITANICS</span></div>
                </div>
            </div>
            <details>
                <summary>Detailed Pets</summary>
                <div class="pet-list">${petDetails || "No special pets found"}</div>
            </details>
            <div class="footer">Last update: ${u.lastUpdate}</div>
        </div>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Batu Tracker System</title>
        <style>
            body { background: #080808; color: white; font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
            h1.title { text-align: center; font-weight: 200; letter-spacing: 4px; color: #555; margin-bottom: 30px; }
            
            /* --- HEADER (ÜST BAR) STİLLERİ (image_17.png) --- */
            .header { background: #111; border: 1px solid #222; border-radius: 12px; padding: 25px; display: flex; justify-content: space-around; position: sticky; top: 20px; z-index: 100; box-shadow: 0 5px 20px rgba(0,0,0,0.5); margin-bottom: 40px;}
            .header-stat { text-align: center; }
            .header-label { display: block; font-size: 0.7rem; color: #666; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
            .header-value { font-size: 1.8rem; font-weight: bold; }
            .total-gem-text { color: #00ffff; text-shadow: 0 0 15px rgba(0, 255, 255, 0.5); }
            .total-usd-text { color: #555; font-size: 0.9rem; margin-top: 5px; }

            /* --- KUTUCUKLAR VE GENEL STİLLER (Bozulmayan Tasarım) --- */
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
            .card { background: #121212; border: 1px solid #222; border-radius: 12px; padding: 25px; position: relative; transition: 0.3s; }
            .card:hover { border-color: #00ffff; box-shadow: 0 0 20px rgba(0, 255, 255, 0.1); }
            .status-dot { width: 10px; height: 10px; background: #00ff00; border-radius: 50%; position: absolute; top: 25px; right: 25px; box-shadow: 0 0 10px #00ff00; }
            .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding-bottom: 15px; margin-bottom: 20px; }
            .username { margin: 0; font-size: 1.2rem; color: #eee; }
            .rank { background: #222; color: #aaa; padding: 3px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; margin-left: 10px;}
            .label { display: block; font-size: 0.7rem; color: #555; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
            .value { font-size: 1.8rem; font-weight: bold; }
            .gem-val { color: #00ffff; font-size: 2rem; font-weight: bold; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5); display: block; }
            .usd-val { color: #555; font-size: 0.9rem; }
            .yellow { color: #ffcc00; } .red { color: #ff4444; }
            .sub-stats { display: flex; flex-direction: column; gap: 15px; background: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0;}
            .stat { display: flex; justify-content: space-between; align-items: center;}
            .pet-stat { justify-content: space-around; text-align: center;}
            .pet-stat .label { color: #444; }
            summary { cursor: pointer; font-size: 12px; color: #00ffff; margin-bottom: 15px; user-select: none;}
            .pet-list { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #222; padding-top: 15px;}
            .pet-item { display: flex; align-items: center; gap: 12px; font-size: 12px;}
            .pet-item img { width: 35px; height: 35px; border-radius: 5px; background: #222; }
            .titanic-item { color: #ffcc00; font-weight: bold; }
            .footer { margin-top: 15px; font-size: 0.7rem; color: #333; text-align: right; }
        </style>
        <script>setTimeout(() => location.reload(), 10000);</script>
    </head>
    <body>
        <h1 class="title">BATU TRACKER SYSTEM</h1>
        
        <div class="header">
            <div class="header-stat"><span class="header-label">ACTIVE ACCOUNTS</span><span class="header-value">${active_accounts}</span></div>
            <div class="header-stat"><span class="header-label">TOTAL GEMS</span><span class="header-value total-gem-text">${formatNum(total_gems_num)}</span><div class="total-usd-text">$${((total_gems_num/1e9)*GEM_PRICE_USD).toFixed(2)} USD</div></div>
            <div class="header-stat"><span class="header-label">TOTAL HUGES</span><span class="header-value red">${total_h}</span></div>
            <div class="header-stat"><span class="header-label">TOTAL TITANICS</span><span class="header-value yellow">${total_t}</span></div>
        </div>

        <div class="grid">${cards || '<div style="color:#222; text-align:center; width:100%; font-size:1.5rem; padding: 50px;">Waiting for connection...</div>'}</div>
    </body>
    </html>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Live on " + PORT));
