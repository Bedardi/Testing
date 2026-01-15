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

    // 2. META DATA SETUP
    let meta = {
        title: "MistaHub - Premium Android Tools Store",
        desc: "The ultimate landing page for verified android apps, sketchware tools, and developer utilities.",
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
                // ✅ APP LANDING SEO
                meta.title = appData.metaTitle || `${appData.name} - Official Download`;
                meta.desc  = appData.metaDesc  || appData.shortDesc || `Get ${appData.name} now. Verified and safe download from MistaHub.`;
                meta.image = appData.seoImage || (appData.screenshots && appData.screenshots[0]) || appData.icon || meta.image;
                meta.url   = `https://mistahub.vercel.app/app/${product}`;
                meta.type  = "software";

                // ✅ SCHEMA FOR LANDING PAGE (Rating + App Info)
                schemaJson = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": appData.name,
                    "operatingSystem": "ANDROID",
                    "applicationCategory": "UtilitiesApplication",
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": appData.rating || "4.8",
                        "ratingCount": "1200"
                    },
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                    "image": appData.icon,
                    "description": meta.desc
                });
            }
        } catch (error) {
            console.error("Fetch Error");
        }
    }

    const demoButtonHTML = (appData && appData.demoUrl) 
        ? `<a href="${appData.demoUrl}" target="_blank" class="btn btn-demo"><i class="fas fa-eye"></i> Demo</a>` 
        : ``;

    const canonical = product ? `https://mistahub.vercel.app/app/${product}` : `https://mistahub.vercel.app/`;

    // 🔥 FORMAT DESCRIPTION (Bold, Image, Link)
    const formatDescription = (text) => {
        if (!text) return "";
        return text
            .replace(/\n/g, "<br>") 
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/`(.*?)`/g, '<img src="$1" style="width:100%; border-radius:10px; margin:10px 0; box-shadow:0 5px 15px rgba(0,0,0,0.1);">')
            .replace(/\[(https?:\/\/[^\]]+)\]/g, '<a href="$1" target="_blank" style="color:var(--primary); font-weight:700; text-decoration:underline;">Click Here</a>');
    };

    // 3. HTML GENERATION
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
    <link rel="canonical" href="${canonical}">
    
    <meta property="og:type" content="${meta.type}">
    <meta property="og:url" content="${meta.url}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.desc}">
    <meta property="og:image" content="${meta.image}">
    
    ${product ? `<script type="application/ld+json">${schemaJson}</script>` : ''}

    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root { --primary: #4f46e5; --bg: #f8fafc; --text: #1e293b; --text-light: #64748b; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); padding-bottom: 90px; }
        a { text-decoration: none; color: inherit; }

        /* --- LANDING HERO (APP PAGE) --- */
        .hero-section { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 40px 20px 50px; text-align: center; border-radius: 0 0 40px 40px; box-shadow: 0 10px 30px -10px rgba(79, 70, 229, 0.5); position: relative; }
        .hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1; pointer-events: none; }
        
        .app-icon-lg { width: 110px; height: 110px; border-radius: 25px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 4px solid rgba(255,255,255,0.2); margin-bottom: 15px; background: #fff; object-fit: cover; position: relative; z-index: 2; }
        .app-title { font-size: 28px; font-weight: 800; margin: 0 0 5px; line-height: 1.2; letter-spacing: -0.5px; }
        
        .app-badges { display: flex; gap: 8px; justify-content: center; margin-top: 15px; flex-wrap: wrap; }
        .badge { background: rgba(255,255,255,0.15); padding: 5px 15px; border-radius: 20px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1); }
        .badge i { color: #86efac; }

        /* --- CONTENT --- */
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 5; }
        .section-title { font-size: 18px; font-weight: 700; margin: 30px 0 15px; display: flex; align-items: center; gap: 10px; color: var(--text); }
        .section-title i { color: var(--primary); background: #e0e7ff; padding: 8px; border-radius: 8px; font-size: 14px; }

        .scroller-wrapper { margin: 0 -20px; padding: 0 20px; }
        .scroller { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; }
        .scroller::-webkit-scrollbar { display: none; }
        .screen { height: 350px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); background: #fff; }

        .desc-box { background: #fff; padding: 25px; border-radius: 24px; line-height: 1.8; color: #334155; font-size: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.03); overflow-wrap: break-word; }
        .desc-box b { color: var(--text); font-weight: 800; }

        /* --- STICKY FOOTER CTA --- */
        .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); padding: 15px 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; box-shadow: 0 -10px 30px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; }
        @media (min-width: 800px) { .bottom-bar { border-radius: 24px 24px 0 0; bottom: 20px; border: 1px solid #fff; left: 50%; transform: translateX(-50%); width: 90%; } }
        
        .btn { flex: 1; padding: 16px; border-radius: 16px; border: none; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s; }
        .btn:active { transform: scale(0.96); }
        .btn-demo { background: #eff6ff; color: var(--primary); border: 1px solid #bfdbfe; }
        .btn-install { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4); }

        /* --- HOME PAGE HERO (NEW) --- */
        .home-banner {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white; padding: 40px 20px; border-radius: 0 0 30px 30px; text-align: center;
            margin-bottom: 20px; position: relative; overflow: hidden;
        }
        .home-banner h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .home-banner p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; }
        
        .search-container {
            margin: -25px 20px 10px; position: relative; z-index: 10;
        }
        .search-box { 
            background: white; border-radius: 16px; padding: 15px; 
            display: flex; align-items: center; gap: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
        }
        .search-box input { border: none; outline: none; width: 100%; font-size: 16px; color: var(--text); }
        
        .home-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 20px; max-width: 800px; margin: 0 auto; }
        .home-card { background: white; padding: 20px 15px; border-radius: 20px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.03); transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; border: 1px solid #f1f5f9; }
        .home-card:active { transform: scale(0.98); }
        .home-card img { width: 64px; height: 64px; border-radius: 18px; object-fit: cover; margin-bottom: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }

        body.landing-mode .home-view { display: none !important; }
    </style>
</head>
<body class="${product ? 'landing-mode' : ''}">

    ${product ? `
    <div class="hero-section">
        <div class="hero-bg"></div>
        <a href="/" style="position:absolute; top:25px; left:20px; color:rgba(255,255,255,0.9); font-weight:600; font-size:14px; display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.2); padding:5px 12px; border-radius:20px;">
            <i class="fas fa-chevron-left"></i> Home
        </a>
        
        <img src="${appData.icon}" class="app-icon-lg" alt="${appData.name}">
        <h1 class="app-title">${appData.name}</h1>
        <div style="font-size:14px; opacity:0.95; font-weight:500;">Premium Tools • MistaHub Verified</div>
        
        <div class="app-badges">
            <div class="badge"><i class="fas fa-shield-alt"></i> 100% Safe</div>
            <div class="badge"><i class="fas fa-bolt"></i> Fast DL</div>
            <div class="badge"><i class="fas fa-star"></i> ${appData.rating || '4.8'}</div>
        </div>
    </div>

    <div class="container">
        <div style="font-size:12px; color:#94a3b8; margin-top:20px; margin-bottom:10px; display:flex; align-items:center; gap:5px;">
            <i class="fas fa-home"></i> Home <i class="fas fa-chevron-right" style="font-size:10px;"></i> 
            <span>Apps</span> <i class="fas fa-chevron-right" style="font-size:10px;"></i>
            <span style="color:var(--primary); font-weight:700;">${appData.name}</span>
        </div>

        <div class="section-title"><i class="fas fa-images"></i> Preview</div>
        <div class="scroller-wrapper">
            <div class="scroller">
                ${(appData.screenshots || []).map((src, i) => `<img src="${src}" class="screen" alt="Preview ${i}" loading="lazy">`).join('')}
                ${(!appData.screenshots) ? '<div style="padding:20px; color:#aaa; font-size:14px; width:100%; text-align:center;">No preview available</div>' : ''}
            </div>
        </div>

        <div class="section-title"><i class="fas fa-align-left"></i> Description</div>
        <div class="desc-box">
            ${formatDescription(appData.fullDesc)}
        </div>
        
        <div style="height: 100px;"></div> </div>

    <div class="bottom-bar">
        ${demoButtonHTML}
        <a href="${apkUrl}" class="btn btn-install">
            <i class="fas fa-download"></i> Install Now
        </a>
    </div>

    ` : `
    
    <div class="home-view">
        <div class="home-banner">
            <div style="font-weight:900; letter-spacing:1px; margin-bottom:5px; color:#a5b4fc;">MISTA HUB</div>
            <h1>Premium Developer Tools</h1>
            <p>Verified Apps, Source Codes & Utilities.</p>
        </div>

        <div class="search-container">
            <div class="search-box">
                <i class="fas fa-search" style="color:var(--text-light); font-size:18px;"></i>
                <input type="text" id="searchInput" placeholder="Search apps, tools...">
            </div>
        </div>

        <div style="position:absolute; left:-9999px;">
            <h2>Best Free Android Apps</h2>
            <p>Download latest tools and utilities from MistaHub.</p>
        </div>

        <div class="home-grid" id="homeGrid">
            <div style="grid-column: span 2; text-align:center; padding:50px; color:#aaa;">
                <i class="fas fa-spinner fa-spin"></i> Loading Store...
            </div>
        </div>
    </div>

    <script>
        if(!document.body.classList.contains('landing-mode')) {
            let allApps = [];
            fetch('${DB_URL}/apps.json')
            .then(r => r.json())
            .then(apps => {
                const grid = document.getElementById('homeGrid');
                grid.innerHTML = '';
                if(apps) {
                    Object.keys(apps).forEach(key => {
                        allApps.push({ key: key, ...apps[key] });
                        grid.innerHTML += \`
                        <a href="/app/\${key}" class="home-card" data-name="\${apps[key].name.toLowerCase()}">
                            <img src="\${apps[key].icon}" loading="lazy" alt="\${apps[key].name}">
                            <div style="font-weight:700; margin-top:5px; font-size:15px; color:#334155;">\${apps[key].name}</div>
                            <div style="font-size:12px; color:#94a3b8; margin-top:5px;">FREE</div>
                        </a>\`;
                    });
                } else {
                    grid.innerHTML = '<div style="text-align:center; width:100%; padding:20px;">No apps found</div>';
                }
            });

            document.getElementById('searchInput').addEventListener('input', function(e) {
                const val = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.home-card');
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
