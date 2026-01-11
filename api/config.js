export default function handler(req, res) {
  // Ye Vercel ke "Environment Variables" se config uthayega
  const config = process.env.FIREBASE_CONFIG_JSON;

  if (!config) {
    return res.status(500).json({ error: "Config Missing in Vercel" });
  }

  // Frontend ko Config JSON bhejo
  res.status(200).json(JSON.parse(config));
}
