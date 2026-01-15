const axios = require("axios");

module.exports = async (req, res) => {
    const { product } = req.query;

    // 🔒 1. SECURE CONFIG
    let DB_URL = "";
    try {
        if (!process.env.FIREBASE_CONFIG_JSON) throw new Error("Missing Config");
        const config = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
        DB_URL = config.databaseURL;
    } catch (e) {
        return res.status(500).send("Server Config Error");
    }

    // 2. META DATA
    let meta = {
        title: "MistaHub - Premium Store",
        desc: "Download verified android apps and developer tools.",
        image: "https://i.ibb.co/5WqqrrqB/b491fe4e44b7.png",
        url: "https://mistahub.vercel.app/",
        type: "website"
    };
    
    let appData = null;
    let apkUrl = "#";
    let schemaJson = ""; 

    if (product) {
        try {
            const [appRes, setRes] = await Promise.all([
                axios.get(`${DB_URL}/apps/${product}.json`),
                axios.get(`${DB_URL}/settings.json`)
            ]);
            
            appData = appRes.data;
            const settings = setRes.data;
            if (settings && settings.apkUrl) apkUrl = settings.apkUrl;

            if (appData) {
                meta.title = appData.metaTitle || `${appData.name}`;
                meta.desc  = appData.metaDesc  || appData.shortDesc;
                meta.image = appData.seoImage || appData.icon || meta.image;
                meta.url   = `https://mistahub.vercel.app/app/${product}`;
                
                // SCHEMA
                schemaJson = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": appData.name,
                    "operatingSystem": "ANDROID",
                    "applicationCategory": "UtilitiesApplication",
                    "aggregateRating": { "@type": "AggregateRating", "ratingValue": appData.rating || "4.8", "ratingCount": "1500" },
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                    "image": appData.icon
                });
            }
        } catch (error) { console.error("Fetch Error"); }
    }

    const demoButtonHTML = (appData && appData.demoUrl) 
        ? `<a href="${appData.demoUrl}" target="_blank" class="btn btn-demo"><i class="fas fa-eye"></i> Demo</a>` 
        : ``;

    // 🔗 DEEP LINK INTENT (Open With MistaHub App)
    // Ye line magic karegi: Agar app installed hai to kholegi, nahi to PlayStore/Website pe rahegi.
    const packageID = "com.mista.mistahub";
    const intentLink = `intent://${meta.url.replace("https://", "")}#Intent;scheme=https;package=${packageID};S.browser_fallback_url=${meta.url};end`;

    // 3. HTML & CSS
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#4f46e5">
    <link rel="icon" href="https://i.ibb.co/5WqqrrqB/b491fe4e44b7.png" type="image/png">
    
    <title>${meta.title}</title>
    <meta name="description" content="${meta.desc}">
    <link rel="canonical" href="${meta.url}">
    
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.desc}">
    <meta property="og:image" content="${meta.image}">
    
    ${product ? `<script type="application/ld+json">${schemaJson}</script>` : ''}

    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root { --primary: #4f46e5; --bg: #f8fafc; --text: #1e293b; --surface: #ffffff; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); padding-bottom: 100px; }
        a { text-decoration: none; color: inherit; }

        /* --- 1. HERO & HEADER (BRAND STYLE) --- */
        .brand-header {
            background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%);
            color: white; padding: 20px; border-radius: 0 0 35px 35px;
            box-shadow: 0 15px 40px -10px rgba(79, 70, 229, 0.4);
            position: relative; overflow: hidden;
        }
        .header-bg-pattern {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px; opacity: 0.6; pointer-events: none;
        }

        /* --- 2. HOME PAGE CARDS (APP STORE STYLE) --- */
        .search-wrapper { margin: -25px 20px 20px; position: relative; z-index: 10; }
        .search-box { 
            background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
            padding: 15px; border-radius: 18px; display: flex; align-items: center; gap: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,0.5);
        }
        .search-box input { border: none; background: transparent; width: 100%; outline: none; font-size: 16px; color: var(--text); }

        .home-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 0 20px; max-width: 800px; margin: 0 auto; }
        
        /* 🔥 UPGRADED CARD DESIGN */
        .app-card {
            background: var(--surface); padding: 15px; border-radius: 22px;
            display: flex; flex-direction: column; align-items: center; text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;
            transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;
        }
        .app-card:active { transform: scale(0.96); }
        .app-card img { width: 70px; height: 70px; border-radius: 18px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); margin-bottom: 12px; }
        .app-card .title { font-weight: 700; font-size: 15px; line-height: 1.3; margin-bottom: 4px; color: #1e293b; }
        .app-card .sub { font-size: 12px; color: #94a3b8; font-weight: 500; }
        
        .get-btn-mini {
            margin-top: 10px; background: #f1f5f9; color: var(--primary);
            font-size: 12px; font-weight: 800; padding: 6px 16px; border-radius: 20px;
            text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* --- 3. PRODUCT PAGE HERO --- */
        .prod-hero { padding: 40px 20px; text-align: center; position: relative; z-index: 2; }
        .prod-icon { width: 110px; height: 110px; border-radius: 26px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); border: 4px solid rgba(255,255,255,0.2); margin-bottom: 15px; }
        
        /* SHARE BUTTON (Floating Top Right) */
        .top-actions { position: absolute; top: 20px; right: 20px; z-index: 10; }
        .action-btn { 
            background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; color: white; 
            backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.3); cursor: pointer;
        }

        /* OPEN IN APP BANNER */
        .open-app-banner {
            display: flex; align-items: center; justify-content: space-between;
            background: #eff6ff; padding: 10px 15px; border-radius: 12px;
            margin: -20px 20px 20px; border: 1px solid #bfdbfe;
            animation: fadeIn 0.5s ease-in-out;
        }

        /* --- 4. DETAILS & PREVIEW --- */
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        
        .scroller-wrapper { margin: 0 -20px; padding: 0 20px; }
        .scroller { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; }
        .scroller::-webkit-scrollbar { display: none; }
        .screen { height: 360px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

        .desc-box { background: white; padding: 25px; border-radius: 24px; line-height: 1.7; color: #334155; font-size: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.02); }
        .desc-box b { color: var(--text); }
        .desc-box img { max-width: 100%; border-radius: 12px; margin: 10px 0; }

        /* --- 5. FLOATING BOTTOM BAR (GLASS) --- */
        .glass-footer {
            position: fixed; bottom: 20px; left: 20px; right: 20px; z-index: 100;
            background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            padding: 10px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.5);
            display: flex; gap: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            max-width: 600px; margin: 0 auto;
        }
        .btn { 
            flex: 1; height: 50px; border-radius: 18px; border: none; 
            font-weight: 700; font-size: 15px; cursor: pointer; display: flex; 
            align-items: center; justify-content: center; gap: 8px;
        }
        .btn-install { background: #111; color: white; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .btn-demo { background: transparent; color: var(--primary); border: 1px solid #e0e7ff; }

        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        body.landing-mode .home-view { display: none !important; }
    </style>
</head>
<body class="${product ? 'landing-mode' : ''}">

    ${product ? `
    <div class="brand-header prod-hero">
        <div class="header-bg-pattern"></div>
        
        <a href="/" style="position:absolute; top:20px; left:20px; background:rgba(0,0,0,0.2); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
            <i class="fas fa-arrow-left"></i>
        </a>

        <div class="top-actions">
            <div class="action-btn" onclick="shareApp()">
                <i class="fas fa-share-alt"></i>
            </div>
        </div>

        <img src="${appData.icon}" class="prod-icon">
        <h1 style="margin:0; font-size:26px; font-weight:800;">${appData.name}</h1>
        <p style="margin:5px 0 0; opacity:0.9; font-size:14px;">MistaHub Verified • Official</p>
        
        <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
            <div style="background:rgba(255,255,255,0.2); padding:5px 15px; border-radius:20px; font-size:12px; font-weight:600;"><i class="fas fa-shield-alt"></i> 100% Safe</div>
            <div style="background:rgba(255,255,255,0.2); padding:5px 15px; border-radius:20px; font-size:12px; font-weight:600;"><i class="fas fa-star"></i> ${appData.rating || '4.8'}</div>
        </div>
    </div>

    <div class="container" style="margin-top:20px;">
        
        <a href="${intentLink}" class="open-app-banner">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="https://i.ibb.co/5WqqrrqB/b491fe4e44b7.png" style="width:30px; border-radius:8px;">
                <div style="font-size:13px; font-weight:700; color:#1e293b;">
                    Open in MistaHub App
                    <div style="font-size:11px; font-weight:400; color:#64748b;">Better experience, Faster download</div>
                </div>
            </div>
            <div style="background:#2563eb; color:white; padding:5px 12px; border-radius:15px; font-size:11px; font-weight:700;">OPEN</div>
        </a>

        <h3 style="margin:10px 0 15px; font-size:18px;">Preview</h3>
        <div class="scroller-wrapper">
            <div class="scroller">
                ${(appData.screenshots || []).map(src => `<img src="${src}" class="screen">`).join('')}
            </div>
        </div>

        <h3 style="margin:25px 0 15px; font-size:18px;">About this app</h3>
        <div class="desc-box">
            ${(appData.fullDesc || "").replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\[(.*?)\]/g, '<a href="$1" style="color:blue;text-decoration:underline;">Link</a>')}
        </div>
        
        <div style="height: 100px;"></div>
    </div>

    <div class="glass-footer">
        ${demoButtonHTML}
        <a href="${apkUrl}" class="btn btn-install">
            <i class="fas fa-download"></i> INSTALL
        </a>
    </div>

    <script>
        function shareApp() {
            if (navigator.share) {
                navigator.share({
                    title: '${appData.name}',
                    text: 'Download ${appData.name} from MistaHub!',
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link Copied!');
            }
        }
    </script>

    ` : `
    
    <div class="home-view">
        <div class="brand-header" style="text-align:center; padding-bottom:50px;">
            <div class="header-bg-pattern"></div>
            <div style="font-weight:900; letter-spacing:1px; opacity:0.8; margin-bottom:5px;">MISTA HUB</div>
            <h1 style="margin:0; font-size:28px;">Discover Apps</h1>
        </div>

        <div class="search-wrapper">
            <div class="search-box">
                <i class="fas fa-search" style="color:#94a3b8;"></i>
                <input type="text" id="searchInput" placeholder="Games, Tools, Source Codes...">
            </div>
        </div>

        <div class="home-grid" id="homeGrid">
            <div style="grid-column: span 2; text-align:center; padding:50px; color:#aaa;">Loading...</div>
        </div>
    </div>

    <script>
        if(!document.body.classList.contains('landing-mode')) {
            fetch('${DB_URL}/apps.json')
            .then(r => r.json())
            .then(apps => {
                const grid = document.getElementById('homeGrid');
                grid.innerHTML = '';
                if(apps) {
                    Object.keys(apps).forEach(key => {
                        grid.innerHTML += \`
                        <a href="/app/\${key}" class="app-card" data-name="\${apps[key].name.toLowerCase()}">
                            <img src="\${apps[key].icon}" loading="lazy">
                            <div class="title">\${apps[key].name}</div>
                            <div class="sub">Utilities</div>
                            <div class="get-btn-mini">GET</div>
                        </a>\`;
                    });
                }
            });

            document.getElementById('searchInput').addEventListener('input', function(e) {
                const val = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.app-card');
                cards.forEach(card => {
                    const name = card.getAttribute('data-name');
                    card.style.display = name.includes(val) ? 'flex' : 'none';
                });
            });
        }
    </script>
    `}

</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
};
