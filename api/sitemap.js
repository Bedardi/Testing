const axios = require("axios");

module.exports = async (req, res) => {
  
  // 1. Config Check
  const configStr = process.env.FIREBASE_CONFIG_JSON;
  if (!configStr) {
    console.error("Firebase Config Missing!");
    return res.status(500).send("Error: Env Config Missing");
  }

  const config = JSON.parse(configStr);
  const FIREBASE_DB_URL = `${config.databaseURL}/apps.json`;
  
  // 👇 FIX 1: URL Hardcode karo (SEO ke liye best)
  const WEBSITE_URL = "https://mistahub.vercel.app";

  try {
    const response = await axios.get(FIREBASE_DB_URL);
    const apps = response.data;

    let xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Home Page
    xml += `<url><loc>${WEBSITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;

    // 2. Product Pages
    if (apps) {
      Object.keys(apps).forEach((key) => {
        // 👇 FIX 2: URL Safe banao (Space ya special character handle karne ke liye)
        const safeKey = encodeURIComponent(key);
        
        xml += `<url><loc>${WEBSITE_URL}/?product=${safeKey}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      });
    }

    xml += `</urlset>`;
    
    // Response
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xml);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error.message);
  }
};
