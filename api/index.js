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

    // 2. FETCH DATA & PREPARE META
    let meta = {
        title: "MistaHub - Best Free Android Tools",
        desc: "Download verified android apps, sketchware tools and developers utilities for free.",
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
                // ✅ SEO METADATA
                meta.title = appData.metaTitle || `${appData.name} - Download Free APK`;
                meta.desc  = appData.metaDesc  || appData.shortDesc || `Download ${appData.name} latest version.`;
                meta.image = appData.seoImage || (appData.screenshots && appData.screenshots[0]) || appData.icon || meta.image;
                meta.url   = `https://mistahub.vercel.app/app/${product}`;
                meta.type  = "software";

                // ✅ SCHEMA MARKUP
                schemaJson = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": appData.name,
                    "operatingSystem": "ANDROID",
                    "applicationCategory": "UtilitiesApplication",
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": appData.rating || "4.5",
                        "ratingCount": "1000"
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
        ? `<a href="${appData.demoUrl}" target="_blank" class="btn btn-demo"><i class="fas fa-eye"></i> Live Demo</a>` 
        : ``;

    const canonical = product ? `https://mistahub.vercel.app/app/${product}` : `https://mistahub.vercel.app/`;

    // 🔥 DESCRIPTION PARSER LOGIC
    // 1. **text** -> Bold
    // 2. `url` -> Image
    // 3. [url] -> Clickable Link
    const formatDescription = (text) => {
        if (!text) return "";
        return text
            .replace(/\n/g, "<br>") 
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
            .replace(/`(.*?)`/g, '<img src="$1" style="width:100%; border-radius:10px; margin:10px 0;">') // Image
            .replace(/\[(https?:\/\/[^\]]+)\]/g, '<a href="$1" target="_blank" style="color:var(--primary); font-weight:700; text-decoration:underline;">$1</a>'); // Link
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
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${meta.image}">

    ${product ? `<script type="application/ld+json">${schemaJson}</script>` : ''}

    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root { --primary: #4f46e5; --bg: #f8fafc; --text: #1e293b; --text-light: #64748b; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); padding-bottom: 90px; }
        a { text-decoration: none; color: inherit; }

        /* HERO & APP STYLES */
        .hero-section { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px 20px 40px; text-align: center; border-radius: 0 0 30px 30px; box-shadow: 0 10px 30px -10px rgba(79, 70, 229, 0.5); position: relative; overflow: hidden; }
        .hero-section::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 10%); background-size: 20px 20px; opacity: 0.3; pointer-events: none; }
        .app-icon-lg { width: 100px; height: 100px; border-radius: 22px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 4px solid rgba(255,255,255,0.2); margin-bottom: 15px; background: #fff; object-fit: cover; position: relative; z-index: 2; }
        .app-title { font-size: 26px; font-weight: 800; margin: 0 0 5px; line-height: 1.2; }
        .app-badges { display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap; }
        .badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 5px; backdrop-filter: blur(4px); }
        .badge i { color: #86efac; }

        /* CONTENT STYLES */
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px; display: flex; align-items: center; gap: 8px; color: var(--text); }
        .section-title i { color: var(--primary); }
        .scroller-wrapper { margin: 0 -20px; padding: 0 20px; }
        .scroller { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none; }
        .scroller::-webkit-scrollbar { display: none; }
        .screen { height: 320px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); background: #fff; }
        
        /* UPDATED DESC BOX FOR IMAGES */
        .desc-box { background: #fff; padding: 20px; border-radius: 20px; line-height: 1.8; color: #334155; font-size: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); overflow-wrap: break-word; }
        .desc-box b { color: var(--text); font-weight: 700; }

        /* FOOTER & BUTTONS */
        .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(15px); padding: 15px 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; box-shadow: 0 -5px 20px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; }
        @media (min-width: 800px) { .bottom-bar { border-radius: 20px 20px 0 0; border: 1px solid #e2e8f0; border-bottom: none; left: 50%; transform: translateX(-50%); } }
        .btn { flex: 1; padding: 14px; border-radius: 12px; border: none; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; text-transform: uppercase; }
        .btn-demo { background: #eff6ff; color: var(--primary); }
        .btn-install { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4); }

        /* HOME PAGE STYLES */
        .home-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 20px; max-width: 800px; margin: 0 auto; }
        .home-card { background: white; padding: 15px; border-radius: 16px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; }
        .home-card:active { transform: scale(0.98); }
        .home-card img { width: 60px; height: 60px; border-radius: 15px; object-fit: cover; }
        
        .search-header { padding: 15px 20px; background: white; position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px; }
        .search-box { flex: 1; background: #f1f5f9; border-radius: 12px; padding: 10px 15px; display: flex; align-items: center; gap: 10px; }
        .search-box input { border: none; background: transparent; outline: none; width: 100%; font-family: inherit; font-size: 16px; color: var(--text); }
        
        body.landing-mode .home-view { display: none !important; }
    </style>
</head>
<body class="${product ? 'landing-mode' : ''}">

    ${product ? `
    <div class="hero-section">
        <a href="/" style="position:absolute; top:20px; left:20px; color:rgba(255,255,255,0.8);"><i class="fas fa-arrow-left"></i> Back</a>
        
        <img src="${appData.icon}" class="app-icon-lg" alt="${appData.name}">
        <h1 class="app-title">${appData.name}</h1>
        <div style="font-size:14px; opacity:0.9; margin-bottom:10px;">By MistaHub • Free Tools</div>
        
        <div class="app-badges">
            <div class="badge"><i class="fas fa-check-circle"></i> Verified</div>
            <div class="badge"><i class="fas fa-shield-alt"></i> 100% Safe</div>
            <div class="badge"><i class="fas fa-star"></i> ${appData.rating || '4.5'} Rating</div>
        </div>
    </div>

    <div class="container">
        <div class="section-title"><i class="fas fa-mobile-alt"></i> App Preview</div>
        <div class="scroller-wrapper">
            <div class="scroller">
                ${(appData.screenshots || []).map((src, i) => `<img src="${src}" class="screen" alt="Screenshot ${i+1}" loading="lazy">`).join('')}
                ${(!appData.screenshots) ? '<div style="padding:10px; color:#aaa; font-size:13px">No preview images available</div>' : ''}
            </div>
        </div>

        <div class="section-title"><i class="fas fa-info-circle"></i> About this App</div>
        <div class="desc-box">
            ${formatDescription(appData.fullDesc)}
        </div>
        <div style="height: 30px;"></div>
    </div>

    <div class="bottom-bar">
        ${demoButtonHTML}
        <a href="${apkUrl}" class="btn btn-install">
            <i class="fas fa-download"></i> Install Now
        </a>
    </div>

    ` : `
    
    <div class="home-view">
        <div class="search-header">
            <h1 style="font-weight:800; font-size:20px; color:var(--primary); margin:0; white-space:nowrap;">MistaHub</h1>
            <div class="search-box">
                <i class="fas fa-search" style="color:var(--text-light);"></i>
                <input type="text" id="searchInput" placeholder="Search apps...">
            </div>
        </div>

        <div class="home-grid" id="homeGrid">
            <div style="grid-column: span 2; text-align:center; padding:50px; color:#aaa;">
                <i class="fas fa-spinner fa-spin"></i> Loading Apps...
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
                            <div style="font-weight:700; margin-top:10px; font-size:14px;">\${apps[key].name}</div>
                        </a>\`;
                    });
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
