const axios = require("axios");

export default async function handler(req, res) {
  // 1. Vercel se Config nikalo
  const configStr = process.env.FIREBASE_CONFIG_JSON;
  if (!configStr) return res.status(500).send("Env Config Missing");

  const config = JSON.parse(configStr);
  
  // 2. Database URL banao
  const FIREBASE_DB_URL = `${config.databaseURL}/apps.json`;
  
  // 3. Website ka URL (mistahub.vercel.app)
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
        // XML me '&' allowed nahi hota, usko fix kiya
        const safeKey = key.replace(/&/g, '&amp;');
        xml += `<url><loc>${WEBSITE_URL}/?product=${safeKey}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      });
    }

    xml += `</urlset>`;
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xml);

  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
}
