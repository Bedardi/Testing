// 👇 FIX: "export default" hata kar "module.exports"
module.exports = (req, res) => {
  const config = process.env.FIREBASE_CONFIG_JSON;

  if (!config) {
    return res.status(500).json({ error: "Config Missing in Vercel" });
  }

  res.status(200).json(JSON.parse(config));
};
