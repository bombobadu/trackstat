const express = require('express');
const app = express();
app.use(express.json());

let gameData = {};

app.post('/update', (req, res) => {
    const { username, rank, gems, gems_num, huges_dict, titanics_dict } = req.body;
    gameData[username] = { 
        rank, gems, gems_num: gems_num || 0,
        huges_dict: huges_dict || {}, 
        titanics_dict: titanics_dict || {},
        lastUpdate: new Date().toLocaleTimeString('tr-TR')
    };
    res.status(200).send("OK");
});

app.get('/', (req, res) => {
    let total_gems = 0, total_h = 0, total_t = 0, cards = "";

    for (let user in gameData) {
        let u = gameData[user];
        let h_count = Object.values(u.huges_dict).reduce((a, b) => a + b.count, 0);
        let t_count = Object.values(u.titanics_dict).reduce((a, b) => a + b.count, 0);
        total_gems += u.gems_num; total_h += h_count; total_t += t_count;

        let petHtml = "";
        const build = (dict) => {
            for(let p in dict) {
                let imgId = dict[p].img;
                // AssetID varsa BigGames API'den çek, yoksa boş bırak
                let imgUrl = imgId ? `https://biggamesapi.io/image/${imgId}` : `https://via.placeholder.com/40?text=Pet`;
                petHtml += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                    <img src="${imgUrl}" style="width:35px;height:35px;border-radius:4px;background:#222;">
                    <span style="font-size:12px;">${p} x${dict[p].count}</span>
                </div>`;
            }
        };
        build(u.huges_dict); build(u.titanics_dict);

        cards += `<div style="background:#111;padding:20px;border-radius:12px;border:1px solid #222;">
            <h3 style="margin:0;color:#00ffff;">${user} <small style="color:#555;font-size:10px;">${u.rank}</small></h3>
            <div style="font-size:28px;font-weight:bold;margin:10px 0;">${u.gems}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#181818;padding:10px;border-radius:8px;">
                <div><small style="color:#444;display:block;">HUGES</small><b>${h_count}</b></div>
                <div><small style="color:#444;display:block;">TITANICS</small><b>${t_count}</b></div>
            </div>
            <details style="margin-top:10px;"><summary style="cursor:pointer;color:#555;">Inventory</summary>${petHtml}</details>
        </div>`;
    }

    res.send(`
    <html><head><meta charset="utf-8"><title>Batu Tracker V10</title>
    <style>body{background:#080808;color:white;font-family:sans-serif;padding:20px;} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;}</style>
    <script>setTimeout(()=>location.reload(),15000);</script></head>
    <body>
        <div style="display:flex;gap:20px;margin-bottom:30px;background:#111;padding:20px;border-radius:10px;border:1px solid #222;">
            <div><small>GEMS</small><br><b style="color:#00ffff;font-size:20px;">${(total_gems/1e9).toFixed(2)}B</b></div>
            <div><small>HUGES</small><br><b style="color:#ff4444;font-size:20px;">${total_h}</b></div>
        </div>
        <div class="grid">${cards}</div>
    </body></html>`);
});

app.listen(process.env.PORT || 10000);
