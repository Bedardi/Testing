const axios = require("axios");

module.exports = async (req, res) => {
  const configStr = process.env.FIREBASE_CONFIG_JSON;
  if (!configStr) {
    return res.status(500).send("Config Missing");
  }

  const config = JSON.parse(configStr);
  const DB_URL = `${config.databaseURL}/apps.json`;
  const SITE = "https://mistahub.vercel.app";

  try {
    const response = await axios.get(DB_URL);
    const apps = response.data;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Home
    xml += `
      <url>
        <loc>${SITE}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
    `;

    // App Pages
    if (apps) {
      Object.keys(apps).forEach((key) => {
        const slug = encodeURIComponent(key);
        xml += `
          <url>
            <loc>${SITE}/app/${slug}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </url>
        `;
      });
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(xml);

  } catch (e) {
    res.status(500).send("Sitemap Error");
  }
};
