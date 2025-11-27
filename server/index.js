require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 5000;

const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
console.log("OPENWEATHER_KEY chargée (début) :", OPENWEATHER_KEY && OPENWEATHER_KEY.slice(0, 5));
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


app.use(cors());
app.use(express.json());

// GET /api/weather?city=Paris
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "Paramètre 'city' requis" });
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          units: "metric",
          lang: "fr",
          appid: OPENWEATHER_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);

    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Ville non trouvée" });
    }

    res.status(500).json({ error: "Erreur lors de la récupération météo" });
  }
});

// POST /api/ai-advice
app.post("/api/ai-advice", async (req, res) => {
  const { city, temp, description, windSpeed } = req.body;

  if (
    typeof city !== "string" ||
    typeof temp !== "number" ||
    typeof description !== "string" ||
    typeof windSpeed !== "number"
  ) {
    return res
      .status(400)
      .json({ error: "Données météo invalides ou manquantes" });
  }

  const prompt = `
Ville : ${city}
Température : ${temp}°C
Conditions : ${description}
Vent : ${windSpeed} m/s

Donne un seul conseil météo en français, en une phrase courte et conviviale :
- parle au tutoiement
- ne donne PAS la température à nouveau
- adapte-toi aux conditions (pluie, chaleur, vent, froid)
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant météo qui donne des conseils simples et utiles.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    const advice =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Je n'ai pas pu générer de conseil cette fois.";

    res.json({ advice });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Erreur lors de la génération IA" });
  }
});

app.listen(port, () => {
  console.log(`Serveur API démarré sur http://localhost:${port}`);
});
