const express = require('express');
const app = express();
app.use(express.json());

const GEM_PRICE_USD = 0.75; 
let gameData = {};

app.post('/update', (req, res) => {
    const { username, rank, gems, gems_num, gpm, huges_dict, titanics_dict } = req.body;
    gameData[username] = { 
        rank, gems, gems_num: gems_num || 0, gpm, 
        huges_dict: huges_dict || {}, 
        titanics_dict: titanics_dict || {},
        lastUpdate: new Date().toLocaleTimeString('tr-TR'),
        online: true 
    };
    res.status(200).send("OK");
});

app.get('/', (req, res) => {
    let total_gems = 0, total_h = 0, total_t = 0, acc_count = 0;
    let cards = "";

    for (let user in gameData) {
        let u = gameData[user];
        acc_count++;
        total_gems += u.gems_num;
        
        let h_count = Object.values(u.huges_dict).reduce((a, b) => a + (b.count || 0), 0);
        let t_count = Object.values(u.titanics_dict).reduce((a, b) => a + (b.count || 0), 0);
        total_h += h_count; total_t += t_count;

        let petHtml = "";
        const buildPets = (dict) => {
            for(let p in dict) {
                let img = dict[p].img ? `https://biggamesapi.io/image/${dict[p].img}` : `https://via.placeholder.com/40`;
                petHtml += `<div class="p-item"><img src="${img}"><span>${p} x${dict[p].count}</span></div>`;
            }
        };
        buildPets(u.huges_dict); buildPets(u.titanics_dict);

        cards += `
        <div class="card">
            <div class="card-header">
                <span class="username">${user}</span>
                <span class="rank-tag">${u.rank}</span>
                <div class="dot"></div>
            </div>
            <div class="gem-section">
                <div class="label">TOTAL GEMS</div>
                <div class="gem-val">${u.gems}</div>
                <div class="usd-val">$${((u.gems_num/1e9)*GEM_PRICE_USD).toFixed(3)} USD</div>
            </div>
            <div class="stats-grid">
                <div class="s-box"><span class="s-lab">GEMS/M</span><span class="s-val yellow">${u.gpm}</span></div>
                <div class="s-box"><span class="s-lab">HUGES</span><span class="s-val red">${h_count}</span></div>
                <div class="s-box"><span class="s-lab">TITANICS</span><span class="s-val orange">${t_count}</span></div>
            </div>
            <details>
                <summary>Show Inventory</summary>
                <div class="p-list">${petHtml || "No pets"}</div>
            </details>
        </div>`;
    }

    res.send(`
    <html>
    <head>
        <title>Batu PS99 Dashboard</title>
        <style>
            body { background: #050505; color: white; font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
            .top-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
            .t-card { background: #0f0f0f; padding: 20px; border-radius: 12px; border: 1px solid #1a1a1a; text-align: center; }
            .t-lab { font-size: 10px; color: #555; letter-spacing: 2px; }
            .t-val { font-size: 24px; font-weight: bold; display: block; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
            .card { background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 15px; padding: 25px; transition: 0.3s; }
            .card:hover { border-color: #00ffff; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,255,255,0.15); }
            .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .rank-tag { background: #1a1a1a; font-size: 10px; padding: 4px 10px; border-radius: 20px; color: #888; }
            .gem-val { color: #00ffff; font-size: 32px; font-weight: bold; text-shadow: 0 0 15px rgba(0,255,255,0.3); }
            .usd-val { color: #444; font-size: 13px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 20px 0; background: #141414; padding: 15px; border-radius: 10px; }
            .s-lab { display: block; font-size: 9px; color: #444; }
            .s-val { font-size: 16px; font-weight: bold; }
            .yellow { color: #ffcc00; } .red { color: #ff4444; } .orange { color: #ff8800; }
            summary { color: #00ffff; font-size: 12px; cursor: pointer; margin-top: 10px; opacity: 0.7; }
            .p-list { display: grid; gap: 10px; margin-top: 15px; border-top: 1px solid #222; padding-top: 15px; }
            .p-item { display: flex; align-items: center; gap: 10px; font-size: 12px; }
            .p-item img { width: 35px; height: 35px; border-radius: 5px; background: #1a1a1a; }
            .dot { width: 8px; height: 8px; background: #00ff00; border-radius: 50%; box-shadow: 0 0 10px #00ff00; }
        </style>
    </head>
    <body>
        <div class="top-bar">
            <div class="t-card"><span class="t-lab">ACCOUNTS</span><span class="t-val">${acc_count}</span></div>
            <div class="t-card"><span class="t-lab">TOTAL GEMS</span><span class="t-val" style="color:#00ffff">${(total_gems/1e9).toFixed(2)}B</span></div>
            <div class="t-card"><span class="t-lab">TOTAL HUGES</span><span class="t-val" style="color:#ff4444">${total_h}</span></div>
            <div class="t-card"><span class="t-lab">TOTAL TITANICS</span><span class="t-val" style="color:#ff8800">${total_t}</span></div>
        </div>
        <div class="grid">${cards}</div>
    </body>
    </html>`);
});

app.listen(process.env.PORT || 10000);
