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

    // 2. FETCH DATA (Server Side)
    let meta = {
        title: "MistaHub Store",
        desc: "Download premium developer tools and apps.",
        image: "https://i.ibb.co/5WqqrrqB/b491fe4e44b7.png",
        url: "https://mistahub.vercel.app/"
    };
    
    let appData = null; // Data hold karne ke liye
    let apkUrl = "#";   // Default APK URL

    if (product) {
        try {
            // Parallel Fetch: App Data + Settings (APK Link)
            const [appRes, setRes] = await Promise.all([
                axios.get(`${DB_URL}/apps/${product}.json`),
                axios.get(`${DB_URL}/settings.json`)
            ]);
            
            appData = appRes.data;
            const settings = setRes.data;
            if(settings && settings.apkUrl) apkUrl = settings.apkUrl;

            if (appData) {
                meta.title = appData.metaTitle || `${appData.name} - Download`;
                meta.desc = appData.metaDesc || appData.shortDesc;
                meta.image = appData.icon || meta.image;
                meta.url = `https://mistahub.vercel.app/?product=${product}`;
            }
        } catch (error) { console.error("Fetch Error"); }
    }

    // 🔥 SMART BUTTON LOGIC (Server Side) 🔥
    // Agar Demo link hai tabhi button dikhao
    const demoButtonHTML = (appData && appData.demoUrl) 
        ? `<a href="${appData.demoUrl}" target="_blank" class="btn btn-demo"><i class="fas fa-eye"></i> Live Demo</a>` 
        : ``;

    // 3. HTML GENERATION
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#4f46e5">
    
    <title>${meta.title}</title>
    <meta name="description" content="${meta.desc}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.desc}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${meta.image}">

    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root { 
            --primary: #4f46e5; /* Deep Indigo */
            --primary-dark: #3730a3;
            --accent: #10b981;  /* Success Green */
            --bg: #f8fafc;
            --text: #1e293b;
            --text-light: #64748b;
        }
        
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); padding-bottom: 90px; }
        a { text-decoration: none; color: inherit; }

        /* --- LANDING PAGE HEADER (Dream11 Style) --- */
        .hero-section {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px 20px 40px;
            text-align: center;
            border-radius: 0 0 30px 30px;
            box-shadow: 0 10px 30px -10px rgba(79, 70, 229, 0.5);
            position: relative;
            overflow: hidden;
        }
        
        /* Background Pattern decoration */
        .hero-section::before {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 10%);
            background-size: 20px 20px; opacity: 0.3; pointer-events: none;
        }

        .app-icon-lg {
            width: 100px; height: 100px; border-radius: 22px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            border: 4px solid rgba(255,255,255,0.2);
            margin-bottom: 15px; background: #fff; object-fit: cover;
            position: relative; z-index: 2;
        }

        .app-title { font-size: 26px; font-weight: 800; margin: 0 0 5px; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .app-badges { display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap; }
        .badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 5px; backdrop-filter: blur(4px); }
        .badge i { color: #86efac; }

        /* --- CONTENT AREA --- */
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }

        .section-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px; display: flex; align-items: center; gap: 8px; color: var(--text); }
        .section-title i { color: var(--primary); }

        /* Screenshots Carousel */
        .scroller-wrapper { margin: 0 -20px; padding: 0 20px; /* Bleed effect */ }
        .scroller { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none; -ms-overflow-style: none; }
        .scroller::-webkit-scrollbar { display: none; }
        .screen { height: 320px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); background: #fff; }

        /* Blog Style Description */
        .desc-box { 
            background: #fff; padding: 20px; border-radius: 20px; 
            line-height: 1.8; color: #334155; font-size: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .desc-box b { color: var(--text); font-weight: 700; }
        .desc-box a { color: var(--primary); text-decoration: underline; font-weight: 600; }
        .desc-box img { max-width: 100%; border-radius: 12px; margin: 15px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .desc-box h2, .desc-box h3 { margin-top: 20px; margin-bottom: 10px; color: var(--text); font-weight: 700; line-height: 1.3; }

        /* --- STICKY FOOTER (High Conversion) --- */
        .bottom-bar { 
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
            background: rgba(255,255,255,0.95); backdrop-filter: blur(15px);
            padding: 15px 20px; border-top: 1px solid #e2e8f0;
            display: flex; gap: 12px; box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
            max-width: 800px; margin: 0 auto;
        }
        @media (min-width: 800px) { .bottom-bar { border-radius: 20px 20px 0 0; border: 1px solid #e2e8f0; border-bottom: none; left: 50%; transform: translateX(-50%); } }

        .btn { flex: 1; padding: 14px; border-radius: 12px; border: none; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
        .btn:active { transform: scale(0.96); }
        
        .btn-demo { background: #eff6ff; color: var(--primary); border: 1px solid #bfdbfe; }
        .btn-install { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            color: white; 
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4); 
        }
        
        /* --- FALLBACK / HOME STYLES --- */
        /* Agar product nahi hai (Home Page) to simple layout */
        .home-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 20px; max-width: 800px; margin: 0 auto; }
        .home-card { background: white; padding: 15px; border-radius: 16px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .home-card img { width: 60px; height: 60px; border-radius: 15px; }
        .search-header { padding: 20px; background: white; position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between; }
        
        /* Hide Home elements if in Product Mode */
        body.landing-mode .home-view { display: none !important; }
    </style>
</head>
<body class="${product ? 'landing-mode' : ''}">

    ${product ? `
    <div class="hero-section">
        <a href="/" style="position:absolute; top:20px; left:20px; color:rgba(255,255,255,0.8);"><i class="fas fa-arrow-left"></i> Back</a>
        
        <img src="${meta.image}" class="app-icon-lg">
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
                ${(appData.screenshots || []).map(src => `<img src="${src}" class="screen" loading="lazy">`).join('')}
                ${(!appData.screenshots) ? '<div style="padding:10px; color:#aaa; font-size:13px">No preview images available</div>' : ''}
            </div>
        </div>

        <div class="section-title"><i class="fas fa-info-circle"></i> About this App</div>
        <div class="desc-box">
            ${(appData.fullDesc || "").replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/`(.*?)`/g, '<img src="$1">')}
        </div>
        
        <div style="height: 30px;"></div>
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="/" style="color: var(--text-light); font-size: 13px; text-decoration: underline;">Discover more apps on MistaHub</a>
        </div>
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
            <div style="font-weight:800; font-size:20px; color:var(--primary);">MistaHub</div>
            <i class="fas fa-search" style="color:var(--text-light);"></i>
        </div>
        <div class="home-grid" id="homeGrid">
            <div style="grid-column: span 2; text-align:center; padding:50px; color:#aaa;">
                <i class="fas fa-spinner fa-spin"></i> Loading Apps...
            </div>
        </div>
    </div>

    <script>
        // Client Side Logic for Home Page List
        if(!document.body.classList.contains('landing-mode')) {
            fetch('${DB_URL}/apps.json')
            .then(r => r.json())
            .then(apps => {
                const grid = document.getElementById('homeGrid');
                grid.innerHTML = '';
                if(apps) {
                    Object.keys(apps).forEach(key => {
                        grid.innerHTML += \`
                        <a href="?product=\${key}" class="home-card">
                            <img src="\${apps[key].icon}" loading="lazy">
                            <div style="font-weight:700; margin-top:10px;">\${apps[key].name}</div>
                        </a>\`;
                    });
                }
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
