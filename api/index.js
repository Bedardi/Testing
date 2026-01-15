const axios = require("axios");

module.exports = async (req, res) => {
  const { product } = req.query;

  // ================= CONFIG =================
  if (!process.env.FIREBASE_CONFIG_JSON) {
    return res.status(500).send("Missing Config");
  }

  const config = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
  const DB_URL = config.databaseURL;

  // ================= DEFAULT META =================
  let meta = {
    title: "Best Free Android Apps & Tools – MistaHub",
    desc: "Download verified, safe and fast Android apps & tools. Auto-updated from Firebase.",
    image: "https://i.ibb.co/5WqqrrqB/b491fe4e44b7.png",
    url: "https://mistahub.vercel.app/"
  };

  let appData = null;
  let apkUrl = "#";

  // ================= PRODUCT MODE =================
  if (product) {
    try {
      const [appRes, setRes] = await Promise.all([
        axios.get(`${DB_URL}/apps/${product}.json`),
        axios.get(`${DB_URL}/settings.json`)
      ]);

      appData = appRes.data;
      if (setRes.data?.apkUrl) apkUrl = setRes.data.apkUrl;

      if (appData) {
        meta.title = appData.metaTitle || `${appData.name} Download – Safe & Free`;
        meta.desc = appData.metaDesc || appData.shortDesc || meta.desc;
        meta.image = appData.icon || meta.image;
        meta.url = `https://mistahub.vercel.app/app/${product}`;
      }
    } catch (e) {
      console.error("Fetch error", e.message);
    }
  }

  // ================= CANONICAL =================
  const canonical = product
    ? `https://mistahub.vercel.app/app/${product}`
    : `https://mistahub.vercel.app/`;

  // ================= UI (UNCHANGED) =================
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${meta.title}</title>
<meta name="description" content="${meta.desc}">
<link rel="canonical" href="${canonical}">

<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.desc}">
<meta property="og:image" content="${meta.image}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${meta.image}">

<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<style>
/* ======= ORIGINAL UI CSS (UNCHANGED) ======= */
${/* tumhara pura CSS yahan SAME rakha gaya hai */""}
${/* (short kar raha hoon explanation me, actual file me tumhara CSS rahega) */""}
</style>
</head>

<body class="${product ? 'landing-mode' : ''}">

${
product && appData ? `
<!-- ================= PRODUCT PAGE UI (SAME) ================= -->
<div class="hero-section">
  <a href="/" style="position:absolute;top:20px;left:20px;color:rgba(255,255,255,0.8)">
    <i class="fas fa-arrow-left"></i> Back
  </a>

  <img src="${meta.image}" class="app-icon-lg">
  <h1 class="app-title">${appData.name}</h1>

  <div class="app-badges">
    <div class="badge"><i class="fas fa-check-circle"></i> Verified</div>
    <div class="badge"><i class="fas fa-shield-alt"></i> Safe</div>
    <div class="badge"><i class="fas fa-star"></i> ${appData.rating || '4.5'}</div>
  </div>
</div>

<div class="container">
  <div class="desc-box">
    ${(appData.fullDesc || "").replace(/\n/g,"<br>")}
  </div>
</div>

<div class="bottom-bar">
  <a href="${apkUrl}" class="btn btn-install">
    <i class="fas fa-download"></i> Install Now
  </a>
</div>
`
:
`
<!-- ================= HOME PAGE UI (SAME) ================= -->

<div class="home-view">
  <div class="search-header">
    <div style="font-weight:800;font-size:20px;color:#4f46e5">MistaHub</div>
    <i class="fas fa-search"></i>
  </div>

  <!-- 🔥 SEO TEXT (NEW, BUT UI SAFE) -->
  <div style="padding:20px;background:#fff">
    <h1>Best Free Android Apps & Tools</h1>
    <p>
      MistaHub par verified Android apps, tools aur utilities milti hain.
      Sabhi apps Firebase se automatically update hote hain.
    </p>
  </div>

  <div class="home-grid" id="homeGrid">
    <div style="grid-column:span 2;text-align:center;padding:50px;color:#aaa">
      <i class="fas fa-spinner fa-spin"></i> Loading Apps...
    </div>
  </div>
</div>

<script>
fetch('${DB_URL}/apps.json')
.then(r=>r.json())
.then(apps=>{
  const grid=document.getElementById('homeGrid');
  grid.innerHTML='';
  Object.keys(apps||{}).forEach(k=>{
    grid.innerHTML+=\`
      <a href="/app/\${k}" class="home-card">
        <img src="\${apps[k].icon}">
        <div>\${apps[k].name}</div>
      </a>\`
  })
})
</script>
`
}

</body>
</html>
`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};
