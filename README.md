# 🌤️ Météo IA — Application météo intelligente (React + Node + Groq)

**Météo IA** est une application web complète permettant d’obtenir :  
✔️ La météo en temps réel d’une ville  
✔️ Des **conseils intelligents générés par une IA**  
✔️ Une interface moderne avec **animations selon le climat** (pluie, neige, orage, soleil…)  
✔️ Mode **jour / nuit** dynamique  
✔️ Déploiement full-stack (Frontend + Backend)

---

## 🚀 Démo en ligne

### 🔗 Application :  
👉 **https://meteo-ia.vercel.app**

### 🔗 API Backend :  
👉 `https://meteo-ia-server.onrender.com/api/weather?city=Paris`

---

## ✨ Fonctionnalités

### 🔍 Météo en temps réel
- Récupération des données via **OpenWeather API**
- Température, description, humidité, vent, icône personnalisée

### 🤖 Conseils IA intelligents
- Analyse de la météo locale
- Génération d’un **conseil concis, amical et personnalisé**
- Modèle IA utilisé : **Groq LLaMA 3.1 (gratuit & rapide)**

### 🎨 Interface utilisateur moderne
- **Fonds animés selon le climat** :
  - pluie dynamique  
  - neige réaliste  
  - orage + éclairs  
  - soleil + rayons animés  
  - nuages animés  
  - brume  
- Badge **Jour / Nuit** selon l’heure locale
- Favicon personnalisé ☀️
- Design responsive

---

## 🛠️ Stack technique

### Frontend
- **React + Vite**
- CSS animations complexes
- Fetch API
- Vercel (hébergement)

### Backend
- **Node.js + Express**
- Axios
- CORS, Helmet, Rate limiting
- API OpenWeather
- IA via **Groq API**
- Render (hébergement)

---

## 📦 Installation en local

### 1. Cloner le projet

```bash
git clone https://github.com/ChrisMBA/meteo-ia.git
cd meteo-ia
