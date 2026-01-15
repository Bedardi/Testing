module.exports = (req, res) => {
    const text = `User-agent: *
Allow: /

Sitemap: https://mistahub.vercel.app/sitemap.xml`;

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(text);
};
