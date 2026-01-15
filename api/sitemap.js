const axios = require("axios");

module.exports = async (req, res) => {
  let DB_URL = "";
  try {
      if (!process.env.FIREBASE_CONFIG_JSON) throw new Error("Missing Config");
      const config = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
      DB_URL = config.databaseURL;
  } catch (e) {
      return res.status(500).send("Config Error");
  }

  try {
    const response = await axios.get(`${DB_URL}/apps.json`);
    const apps = response.data;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://mistahub.vercel.app/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>`;

    if (apps) {
      Object.keys(apps).forEach((key) => {
        // Simple encoding for URL safety
        xml += `
          <url>
            <loc>https://mistahub.vercel.app/app/${key}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>`;
      });
    }

    xml += `</urlset>`;

    // ✅ FIX: Correct Content-Type for Google
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);

  } catch (e) {
    res.status(500).send("Sitemap Error");
  }
};
