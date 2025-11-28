require('dotenv').config();

const express   = require('express');
const axios     = require('axios');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { Groq }  = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.OPENWEATHER_KEY) {
  console.error('Clé OPENWEATHER_KEY manquante');
  process.exit(1);
}
if (!process.env.GROQ_API_KEY) {
  console.error('Clé GROQ_API_KEY manquante');
  process.exit(1);
}

console.log('Clés météo & IA chargées');

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: "Paramètre 'city' manquant" });
  }

  try {
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_KEY,
          units: 'metric',
          lang: 'fr',
        },
      }
    );
    res.json(data);
  } catch (err) {
    console.error('OpenWeather error', err.response?.data ?? err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération météo' });
  }
});

app.post('/api/ai-advice', async (req, res) => {
  const { city, temp, description, windSpeed } = req.body;

  if (!city || !description || typeof temp !== 'number') {
    return res.status(400).json({ error: 'Données météo invalides' });
  }

  const prompt = `
Ville : ${city}
Température : ${temp}°C
Conditions : ${description}

Donne une seule phrase de conseil météo :
- français
- tutoiement
- courte
- sans chiffre
- sans répéter la météo
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: 'system', content: 'Assistant météo concis.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 40,
      temperature: 0.7,
    });

    const advice = completion.choices?.[0]?.message?.content?.trim();
    res.json({ advice });
  } catch (err) {
    console.error('Groq error', err.response?.data ?? err.message);
    res.status(500).json({ error: 'Erreur lors de la génération IA' });
  }
});

app.listen(PORT, () =>
  console.log(`Serveur API démarré sur http://localhost:${PORT}`)
);
