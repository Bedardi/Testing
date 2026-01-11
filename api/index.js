const axios = require("axios");

module.exports = async (req, res) => {
    const { product } = req.query;

    // 🔒 1. SECURE: Get Config from Vercel
    let DB_URL = "";
    try {
        if (!process.env.FIREBASE_CONFIG_JSON) throw new Error("Missing Config");
        const config = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
        DB_URL = config.databaseURL;
    } catch (e) {
        return res.status(500).send("Server Config Error");
    }

    // 2. Default Meta Data
    let meta = {
        title: "MistaHub Store",
        desc: "Download premium tools for developers.",
        image: "https://i.ibb.co/5WqqrrqB/b491fe4e44b7.png",
        url: "https://mistahub.vercel.app/"
    };

    // 3. Server Side Data Fetching (For Meta Tags)
    if (product) {
        try {
            const response = await axios.get(`${DB_URL}/apps/${product}.json`);
            const data = response.data;
            if (data) {
                meta.title = data.metaTitle || `${data.name} - Download`;
                meta.desc = data.metaDesc || data.shortDesc;
                meta.image = data.icon || meta.image;
                meta.url = `https://mistahub.vercel.app/?product=${product}`;
            }
        } catch (error) { console.error("Fetch Error"); }
    }

    // 🔥 LANDING PAGE LOGIC 🔥
    // Agar product hai, to 'landing-mode' class body par lag jayegi
    const bodyClass = product ? "landing-mode" : "";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#6366f1">
    
    <title>${meta.title}</title>
    <meta name="description" content="${meta.desc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${meta.url}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.desc}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.desc}">
    <meta name="twitter:image" content="${meta.image}">

    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root { --primary: #6366f1; --bg-body: #f8fafc; --bg-card: #ffffff; --text-main: #0f172a; --text-sub: #64748b; --border: #e2e8f0; --shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg-body); color: var(--text-main); padding-bottom: 90px; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        a { text-decoration: none; color: inherit; }
        
        /* HEADER (Logo & Search) */
        header { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 12px 20px; transition: 0.3s; }
        .nav-container { max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-weight: 800; font-size: 20px; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; cursor: pointer; }
        .search-wrapper { position: relative; width: 60%; max-width: 400px; }
        .search-wrapper input { width: 100%; padding: 10px 15px 10px 40px; border-radius: 20px; border: 1px solid var(--border); background: #f1f5f9; outline: none; }
        .search-wrapper i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-sub); }

        /* 🔥 LANDING MODE MAGIC: Hide Header when in Landing Mode 🔥 */
        body.landing-mode header { display: none !important; }
        body.landing-mode #view-product { padding-top: 20px; } 

        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; }
        .card { background: var(--bg-card); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: var(--shadow); transition: 0.3s; cursor: pointer; border: 1px solid transparent; }
        .card:hover { transform: translateY(-5px); border-color: var(--primary); }
        .card-icon { width: 72px; height: 72px; border-radius: 18px; margin-bottom: 12px; object-fit: cover; }
        .card-title { font-weight: 700; font-size: 15px; margin-bottom: 5px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        
        #view-product { display: none; background: var(--bg-body); min-height: 100vh; }
        .p-header { background: var(--bg-card); padding: 30px 20px; border-bottom: 1px solid var(--border); display: flex; gap: 20px; align-items: center; border-radius: 0 0 30px 30px; box-shadow: var(--shadow); }
        .p-icon { width: 90px; height: 90px; border-radius: 22px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .p-meta h1 { margin: 0 0 5px; font-size: 22px; font-weight: 800; line-height: 1.2; }
        
        .scroller { display: flex; gap: 12px; overflow-x: auto; padding: 10px 0; scrollbar-width: none; }
        .screen { height: 280px; border-radius: 12px; border: 1px solid var(--border); }
        .desc-box { background: var(--bg-card); padding: 20px; border-radius: 16px; border: 1px solid var(--border); line-height: 1.7; margin-top: 15px; color: #334155; }
        .desc-box img { max-width: 100%; border-radius: 8px; margin: 10px 0; }

        .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); padding: 15px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: center; width: 100%; max-width: 800px; margin: 0 auto; }
        @media (min-width: 800px) { .bottom-bar { left: 50%; transform: translateX(-50%); border-radius: 20px 20px 0 0; border: 1px solid var(--border); border-bottom: none; } }
        .btn { flex: 1; padding: 14px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-demo { background: #f1f5f9; color: var(--text-main); }
        .btn-install { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
        
        .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 12px; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    </style>
</head>
<body class="${bodyClass}">

    <header>
        <div class="nav-container">
            <div class="logo" onclick="goHome()">MistaHub</div>
            <div class="search-wrapper">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search apps..." onkeyup="filterApps()">
            </div>
        </div>
    </header>

    <div id="view-home">
        <div class="container">
            <div id="product-grid" class="grid">
                 <div class="card" style="height:180px;"><div class="skeleton" style="width:60px;height:60px;margin-bottom:10px;"></div><div class="skeleton" style="width:80%;height:15px;"></div></div>
            </div>
            <div id="no-results" style="text-align:center; padding:50px; display:none; color:#64748b;">No apps found.</div>
        </div>
    </div>

    <div id="view-product">
        <div class="p-header">
            <img id="p-icon" class="p-icon" src="">
            <div>
                <h1 id="p-title">Loading...</h1>
                <span style="color:var(--primary); font-weight:600;"><i class="fas fa-check-circle"></i> Verified</span>
            </div>
        </div>
        <div class="container">
            <h3 style="margin:0 0 10px;">Preview</h3>
            <div class="scroller" id="p-screens"></div>
            <h3 style="margin:20px 0 10px;">About this app</h3>
            <div class="desc-box" id="p-desc"></div>
            
            <div style="text-align:center; margin-top:30px; margin-bottom:30px;">
                <a href="/" style="color:var(--text-sub); font-size:14px; text-decoration:underline;">View All Apps on MistaHub</a>
            </div>
        </div>
        
        <div class="bottom-bar">
            <button class="btn btn-demo" id="btn-demo"><i class="fas fa-globe"></i> Demo</button>
            <button class="btn btn-install" id="btn-install"><i class="fas fa-download"></i> Install Now</button>
        </div>
    </div>

    <script>
        const DB_URL_CLIENT = "${DB_URL}"; 
        let allApps = {};

        window.onload = async () => {
            const params = new URLSearchParams(window.location.search);
            if(params.get('product')) loadProduct(params.get('product'));
            else loadCatalog();
        };

        // --- CATALOG ---
        async function loadCatalog() {
            // Check if we are stuck in landing mode, remove it to show header
            document.body.classList.remove('landing-mode');
            
            document.getElementById('view-home').style.display = 'block';
            document.getElementById('view-product').style.display = 'none';
            try {
                const res = await fetch(DB_URL_CLIENT + '/apps.json');
                const apps = await res.json();
                const grid = document.getElementById('product-grid');
                grid.innerHTML = "";
                if(apps) {
                    allApps = apps;
                    renderGrid(allApps);
                } else {
                    grid.innerHTML = "";
                    document.getElementById('no-results').style.display = 'block';
                }
            } catch(e) { console.error(e); }
        }

        function renderGrid(apps) {
            const grid = document.getElementById('product-grid');
            grid.innerHTML = "";
            Object.keys(apps).forEach(key => {
                const data = apps[key];
                grid.innerHTML += \`
                <a href="?product=\${key}" class="card">
                    <img src="\${data.icon}" class="card-icon" loading="lazy">
                    <div class="card-title">\${data.name}</div>
                </a>\`;
            });
        }

        window.filterApps = () => {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const filtered = {};
            Object.keys(allApps).forEach(key => {
                if(allApps[key].name.toLowerCase().includes(query)) filtered[key] = allApps[key];
            });
            renderGrid(filtered);
        };

        // --- PRODUCT PAGE ---
        async function loadProduct(id) {
            document.getElementById('view-home').style.display = 'none';
            document.getElementById('view-product').style.display = 'block';
            window.scrollTo(0,0);
            
            try {
                const [appRes, setRes] = await Promise.all([
                    fetch(DB_URL_CLIENT + '/apps/' + id + '.json'),
                    fetch(DB_URL_CLIENT + '/settings.json')
                ]);
                const data = await appRes.json();
                const settings = await setRes.json();

                if(data) {
                    document.getElementById('p-title').innerText = data.name;
                    document.getElementById('p-icon').src = data.icon;
                    document.getElementById('p-desc').innerHTML = parseDescription(data.fullDesc);

                    const scroller = document.getElementById('p-screens');
                    scroller.innerHTML = "";
                    if(data.screenshots) {
                        data.screenshots.forEach(src => scroller.innerHTML += \`<img src="\${src}" class="screen">\`);
                    }
                    
                    const demoBtn = document.getElementById('btn-demo');
                    if(data.demoUrl) demoBtn.onclick = () => window.open(data.demoUrl, '_blank');
                    else demoBtn.style.display = 'none';

                    document.getElementById('btn-install').onclick = () => window.location.href = settings.apkUrl || "#";
                }
            } catch(e) { console.error(e); }
        }

        function parseDescription(text) {
            if (!text) return "";
            return text.replace(/\\n/g, "<br>")
                       .replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>')
                       .replace(/\`(.*?)\`/g, (match, url) => {
                           if(url.match(/\\.(jpeg|jpg|gif|png|webp)$/i)) return \`<img src="\${url}" style="max-width:100%">\`;
                           return \`<a href="\${url}" target="_blank">Link <i class="fas fa-external-link-alt"></i></a>\`;
                       });
        }

        window.goHome = () => {
            window.history.pushState({}, '', '/');
            loadCatalog();
        };
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
};
