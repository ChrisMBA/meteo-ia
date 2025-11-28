import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getWeatherTheme(weather) {
  if (!weather) return "default";

  const main = weather.weather?.[0]?.main?.toLowerCase() || "";
  const desc = weather.weather?.[0]?.description?.toLowerCase() || "";
  const text = `${main} ${desc}`;

  if (text.includes("clear") || text.includes("soleil")) return "clear";
  if (text.includes("storm") || text.includes("thunder") || text.includes("orage")) return "storm";
  if (text.includes("snow") || text.includes("neige")) return "snow";
  if (text.includes("rain") || text.includes("drizzle") || text.includes("pluie")) return "rain";
  if (text.includes("mist") || text.includes("fog") || text.includes("haze") || text.includes("brume") || text.includes("brouillard")) return "mist";
  if (text.includes("cloud") || text.includes("nuage")) return "clouds";

  return "default";
}

function isDayTime(weather) {
  if (!weather || !weather.sys) return true;
  const sunrise = weather.sys.sunrise;
  const sunset = weather.sys.sunset;
  const timezoneOffset = weather.timezone ?? 0;

  const nowUtcSec = Date.now() / 1000;
  const localNowSec = nowUtcSec + timezoneOffset;

  return localNowSec >= sunrise && localNowSec < sunset;
}

function getWeatherIcon(theme, isDay) {
  switch (theme) {
    case "clear":
      return isDay ? "☀️" : "🌙";
    case "clouds":
      return isDay ? "⛅" : "☁️";
    case "rain":
      return "🌧️";
    case "snow":
      return "❄️";
    case "mist":
      return "🌫️";
    case "storm":
      return "⛈️";
    default:
      return isDay ? "🌡️" : "🌙";
  }
}

/* ---------- Effets météo animés ---------- */

function RainLayer() {
  const drops = Array.from({ length: 80 });
  return (
    <div className="fx-layer rain-layer">
      {drops.map((_, i) => {
        const style = {
          "--x": Math.random() * 100,
          "--d": 0.8 + Math.random() * 0.7,
          "--delay": Math.random() * -2,
        };
        return <span key={i} className="raindrop" style={style} />;
      })}
    </div>
  );
}

function SnowLayer() {
  const flakes = Array.from({ length: 70 });
  return (
    <div className="fx-layer snow-layer">
      {flakes.map((_, i) => {
        const style = {
          "--x": Math.random() * 100,
          "--d": 4 + Math.random() * 4,
          "--delay": Math.random() * -4,
          "--size": 4 + Math.random() * 4,
        };
        return <span key={i} className="snowflake" style={style} />;
      })}
    </div>
  );
}

function CloudsLayer() {
  const clouds = Array.from({ length: 6 });
  return (
    <div className="fx-layer clouds-layer">
      {clouds.map((_, i) => {
        const style = {
          "--y": 5 + Math.random() * 40,
          "--scale": 0.8 + Math.random() * 0.8,
          "--delay": Math.random() * -20,
        };
        return <span key={i} className="cloud" style={style} />;
      })}
    </div>
  );
}

function ClearLayer() {
  return (
    <div className="fx-layer clear-layer">
      <div className="sun-core" />
      <div className="sun-ray sun-ray--1" />
      <div className="sun-ray sun-ray--2" />
      <div className="sun-ray sun-ray--3" />
    </div>
  );
}

function MistLayer() {
  return (
    <div className="fx-layer mist-layer">
      <div className="mist mist--1" />
      <div className="mist mist--2" />
      <div className="mist mist--3" />
    </div>
  );
}

function StormLayer() {
  return (
    <div className="fx-layer storm-layer">
      <div className="storm-flash storm-flash--1" />
      <div className="storm-flash storm-flash--2" />
    </div>
  );
}

function WeatherFX({ theme }) {
  if (theme === "rain") return <RainLayer />;
  if (theme === "snow") return <SnowLayer />;
  if (theme === "clouds") return <CloudsLayer />;
  if (theme === "clear") return <ClearLayer />;
  if (theme === "mist") return <MistLayer />;
  if (theme === "storm") return <StormLayer />;
  return null;
}

/* ---------- App principale ---------- */

function App() {
  const [city, setCity] = useState("Paris");
  const [weather, setWeather] = useState(null);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

  const hasWeather = !!weather;
  const theme = getWeatherTheme(weather);
  const isDay = isDayTime(weather);
  const icon = getWeatherIcon(theme, isDay);

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
    <div className={`app app--${theme} ${isDay ? "app--day" : "app--night"}`}>
      <div className="app__bg" />
      <WeatherFX theme={theme} />
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
            <div className="weather-header">
              <div className="weather-title">
                <h2>{weather.name}</h2>
                <span className="daynight-tag">
                  {isDay ? "Jour" : "Nuit"}
                </span>
              </div>
              <div className="weather-icon" aria-hidden="true">
                {icon}
              </div>
            </div>

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
