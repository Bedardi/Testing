const axios = require("axios");

// 👇 FIX: "export default" hata diya, "module.exports" lagaya
module.exports = async (req, res) => {
  
  // 1. Vercel Environment se Config nikalo
  const configStr = process.env.FIREBASE_CONFIG_JSON;
  
  if (!configStr) {
    // Agar config nahi mili to error mat do, bas empty XML bhej do (Crash rokne ke liye)
    console.error("Firebase Config Missing!");
    return res.status(500).send("Error: Env Config Missing");
  }

  const config = JSON.parse(configStr);
  const FIREBASE_DB_URL = `${config.databaseURL}/apps.json`;
  const WEBSITE_URL = `https://${req.headers.host}`;

  try {
    const response = await axios.get(FIREBASE_DB_URL);
    const apps = response.data;

    let xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Home Page
    xml += `<url><loc>${WEBSITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;

    // Product Pages
    if (apps) {
      Object.keys(apps).forEach((key) => {
        const safeKey = key.replace(/&/g, '&amp;');
        xml += `<url><loc>${WEBSITE_URL}/?product=${safeKey}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      });
    }

    xml += `</urlset>`;
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xml);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error.message);
  }
};
