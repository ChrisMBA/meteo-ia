import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [city, setCity] = useState("Paris");
  const [weather, setWeather] = useState(null);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  const hasWeather = !!weather;

  async function handleFetchWeather(e) {
    e.preventDefault();
    if (!city.trim()) return;

    setLoadingWeather(true);
    setError("");
    setWeather(null);
    setAiAdvice("");

    try {
      const res = await fetch(
        `${API_URL}/api/weather?city=${encodeURIComponent(city.trim())}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la récupération météo");
      }

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoadingWeather(false);
    }
  }

  async function handleFetchAdvice() {
    if (!weather) return;

    setLoadingAI(true);
    setError("");

    const payload = {
      city: weather.name,
      temp: weather.main.temp,
      description: weather.weather?.[0]?.description || "",
      windSpeed: weather.wind?.speed ?? 0,
    };

    try {
      const res = await fetch(`${API_URL}/api/ai-advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur IA");
      }

      const data = await res.json();
      setAiAdvice(data.advice || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur IA");
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div className="app">
      <div className="card">
        <h1>Météo + IA</h1>

        <form onSubmit={handleFetchWeather} className="form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Entrez une ville (ex: Paris)"
          />
          <button type="submit" disabled={loadingWeather}>
            {loadingWeather ? "Chargement..." : "Voir la météo"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {hasWeather && (
          <div className="weather-block">
            <h2>{weather.name}</h2>
            <p className="temp">{Math.round(weather.main.temp)}°C</p>
            <p className="description">
              {weather.weather?.[0]?.description ?? "—"}
            </p>
            <div className="details">
              <span>💧 Humidité : {weather.main.humidity}%</span>
              <span>💨 Vent : {weather.wind.speed} m/s</span>
            </div>

            <button
              type="button"
              onClick={handleFetchAdvice}
              disabled={loadingAI}
              className="ai-button"
            >
              {loadingAI ? "Conseil IA en cours..." : "Générer un conseil IA"}
            </button>

            {aiAdvice && (
              <div className="ai-advice">
                <h3>💡 Conseil IA</h3>
                <p>{aiAdvice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
