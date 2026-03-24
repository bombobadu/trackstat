const express = require('express');
const app = express();
app.use(express.json());

// --- AYARLAR ---
const GEM_PRICE_USD = 0.75; // 1B Gems fiyatı
// ---------------

let gameData = {};

app.post('/update', (req, res) => {
    const { username, rank, gems, gpm, huges_dict, titanics_dict } = req.body;
    
    // Gems stringini (12.5B, 200M) sayıya çevirme mantığı
    let gems_num = 0;
    if (gems) {
        let n = parseFloat(gems);
        if (gems.includes('B')) gems_num = n * 1e9;
        else if (gems.includes('M')) gems_num = n * 1e6;
        else if (gems.includes('K')) gems_num = n * 1e3;
        else gems_num = n;
    }

    // GPM stringini sayıya çevirme
    let gpm_num = 0;
    if (gpm) gpm_num = parseFloat(gpm) * (gpm.includes('B') ? 1e9 : gpm.includes('M') ? 1e6 : gpm.includes('K') ? 1e3 : 1);

    gameData[username] = { 
        rank: rank || "Rank ?",
        gems: gems || "0",
        gems_num: gems_num,
        gpm: gpm || "0/m",
        gpm_num: gpm_num,
        huges_dict: huges_dict || {}, // {"Huge Hippo": 1}
        titanics_dict: titanics_dict || {},
        lastUpdate: new Date().toLocaleTimeString('tr-TR'),
        online: true 
    };
    res.status(200).send("OK");
});

function formatNum(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toString();
}

app.get('/', (req, res) => {
    let total_gems_num = 0;
    let total_gpm_num = 0;
    let total_h = 0;
    let total_t = 0;
    let cards = "";

    for (let user in gameData) {
        let u = gameData[user];
        total_gems_num += u.gems_num;
        total_gpm_num += u.gpm_num;
        
        let h_count = Object.values(u.huges_dict).reduce((a, b) => a + b, 0);
        let t_count = Object.values(u.titanics_dict).reduce((a, b) => a + b, 0);
        total_h += h_count;
        total_t += t_count;

        // Pet Listesi HTML (Gizli Panel)
        let petDetails = "";
        for (let pet in u.huges_dict) {
            petDetails += `
            <div class="pet-item">
                <img src="https://biggamesapi.io/image/${pet}" alt="${pet}" onerror="this.src='https://via.placeholder.com/40'">
                <span>${pet} x${u.huges_dict[pet]}</span>
            </div>`;
        }

        cards += `
        <div class="card">
            <div class="card-header">
                <h2>${user} <span class="rank">${u.rank}</span></h2>
                <div class="status-dot"></div>
            </div>
            <div class="main-stat">
                <span class="label">GEMS</span>
                <span class="gem-val">${u.gems}</span>
                <span class="usd-val">$${((u.gems_num/1e9)*GEM_PRICE_USD).toFixed(3)}</span>
            </div>
            <div class="sub-row">
                <div><span class="label">GEMS/M</span><span class="yellow">${u.gpm}</span></div>
                <div><span class="label">HUGES</span><span class="red">${h_count}</span></div>
            </div>
            <details>
                <summary>Show Pets</summary>
                <div class="pet-list">${petDetails || "No huges found"}</div>
            </details>
        </div>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Batu PS99 Ultimate</title>
        <style>
            body { background: #0a0a0a; color: #fff; font-family: sans-serif; margin: 0; }
            .header { background: #111; padding: 20px; display: flex; justify-content: space-around; border-bottom: 2px solid #222; position: sticky; top: 0; }
            .h-stat { text-align: center; }
            .h-label { font-size: 10px; color: #666; display: block; }
            .h-val { font-size: 24px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 30px; }
            .card { background: #151515; border: 1px solid #222; border-radius: 10px; padding: 20px; }
            .gem-val { color: #00ffff; font-size: 28px; font-weight: bold; display: block; }
            .usd-val { color: #555; font-size: 14px; }
            .yellow { color: #ffcc00; } .red { color: #ff4444; }
            .label { font-size: 10px; color: #444; font-weight: bold; }
            .sub-row { display: flex; justify-content: space-between; margin: 15px 0; background: #1a1a1a; padding: 10px; border-radius: 5px; }
            summary { cursor: pointer; font-size: 12px; color: #00ffff; margin-top: 10px; }
            .pet-list { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; border-top: 1px solid #222; padding-top: 10px; }
            .pet-item { display: flex; align-items: center; gap: 10px; font-size: 11px; }
            .pet-item img { width: 30px; height: 30px; border-radius: 5px; background: #222; }
            .status-dot { width: 8px; height: 8px; background: #00ff00; border-radius: 50%; box-shadow: 0 0 5px #00ff00; }
            .card-header { display: flex; justify-content: space-between; align-items: center; }
            .rank { font-size: 10px; background: #222; padding: 2px 6px; border-radius: 4px; }
        </style>
        <script>setTimeout(() => location.reload(), 10000);</script>
    </head>
    <body>
        <div class="header">
            <div class="h-stat"><span class="h-label">TOTAL GEMS</span><span class="h-val" style="color:#00ffff">${formatNum(total_gems_num)}</span><div style="font-size:12px;color:#555">$${((total_gems_num/1e9)*GEM_PRICE_USD).toFixed(2)}</div></div>
            <div class="h-stat"><span class="h-label">TOTAL GPM</span><span class="h-val" style="color:#ffcc00">+${formatNum(total_gpm_num)}/m</span></div>
            <div class="h-stat"><span class="h-label">TOTAL HUGES</span><span class="h-val" style="color:#ff4444">${total_h}</span></div>
        </div>
        <div class="grid">${cards}</div>
    </body>
    </html>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Live on " + PORT));
