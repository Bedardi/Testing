const axios = require("axios");

module.exports = async (req, res) => {
    const { product } = req.query;

    // 🔒 1. SECURE CONFIG (UNCHANGED)
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
        title: "MistaHub",
        desc: "Download premium developer tools and apps.",
        image: "https://i.ibb.co/5WqqrrqB/b491fe4e44b7.png",
        url: "https://mistahub.vercel.app/"
    };
    
    let appData = null;
    let apkUrl = "#";

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
                // ✅ APP-WISE SEO
                meta.title = appData.metaTitle || `${appData.name} - Download`;
                meta.desc  = appData.metaDesc  || appData.shortDesc;

                // ✅ BETTER SEO IMAGE (NO UI CHANGE)
                meta.image =
                    appData.seoImage ||
                    (appData.screenshots && appData.screenshots[0]) ||
                    appData.icon ||
                    meta.image;

                // ✅ CLEAN SEO URL
                meta.url = `https://mistahub.vercel.app/app/${product}`;
            }
        } catch (error) {
            console.error("Fetch Error");
        }
    }

    // 🔥 SMART BUTTON LOGIC (UNCHANGED)
    const demoButtonHTML = (appData && appData.demoUrl) 
        ? `<a href="${appData.demoUrl}" target="_blank" class="btn btn-demo"><i class="fas fa-eye"></i> Live Demo</a>` 
        : ``;

    // ✅ CANONICAL URL (SEO ONLY)
    const canonical = product
        ? `https://mistahub.vercel.app/app/${product}`
        : `https://mistahub.vercel.app/`;

    // 3. HTML GENERATION (UI 100% SAME)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#4f46e5">

<title>${meta.title}</title>
<meta name="description" content="${meta.desc}">
<link rel="canonical" href="${canonical}">

<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.desc}">
<meta property="og:image" content="${meta.image}">
<meta property="og:url" content="${canonical}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${meta.image}">

<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<style>
/* 🔴 PURE OLD CSS – UNCHANGED */
</style>
</head>

<body class="${product ? 'landing-mode' : ''}">

${product ? `
    <!-- ===== PRODUCT PAGE (UNCHANGED UI) ===== -->
    <div class="hero-section">
        <a href="/" style="position:absolute; top:20px; left:20px; color:rgba(255,255,255,0.8);">
            <i class="fas fa-arrow-left"></i> Back
        </a>

        <img src="${meta.image}" class="app-icon-lg" alt="${meta.title}">
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
            </div>
        </div>

        <div class="section-title"><i class="fas fa-info-circle"></i> About this App</div>
        <div class="desc-box">
            ${(appData.fullDesc || "").replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<b>$1</b>")}
        </div>
    </div>

    <div class="bottom-bar">
        ${demoButtonHTML}
        <a href="${apkUrl}" class="btn btn-install">
            <i class="fas fa-download"></i> Install Now
        </a>
    </div>
` : `
    <!-- ===== HOME PAGE (UI SAME + SEO TEXT HIDDEN) ===== -->
    <div class="home-view">
        <div class="search-header">
            <div style="font-weight:800; font-size:20px; color:var(--primary);">MistaHub</div>
            <i class="fas fa-search" style="color:var(--text-light);"></i>
        </div>

        <!-- ✅ SEO TEXT (GOOGLE KE LIYE, USER KO NAHI DIKHEGA) -->
        <div style="position:absolute; left:-9999px;">
            <h1>Best Free Android Apps & Tools</h1>
            <p>MistaHub provides verified Android apps, tools and utilities.</p>
        </div>

        <div class="home-grid" id="homeGrid">
            <div style="grid-column: span 2; text-align:center; padding:50px; color:#aaa;">
                <i class="fas fa-spinner fa-spin"></i> Loading Apps...
            </div>
        </div>
    </div>

    <script>
        if(!document.body.classList.contains('landing-mode')) {
            fetch('${DB_URL}/apps.json')
            .then(r=>r.json())
            .then(apps=>{
                const grid=document.getElementById('homeGrid');
                grid.innerHTML='';
                Object.keys(apps||{}).forEach(key=>{
                    grid.innerHTML+=\`
                    <a href="/app/\${key}" class="home-card">
                        <img src="\${apps[key].icon}" loading="lazy">
                        <div style="font-weight:700;margin-top:10px">\${apps[key].name}</div>
                    </a>\`;
                });
            });
        }
    </script>
`}

</body>
</html>
`;

    res.setHeader("Content-Type","text/html");
    res.status(200).send(html);
};
