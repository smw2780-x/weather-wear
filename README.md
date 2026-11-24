# Weather-Wear: Smart Commuter Outfit & Gear Recommender

**Course:** MGIS130 – MIS Build & Improve (Fall 2026)  
**Track:** Web-App Track (Hosted via GitHub Pages)  
**Author:** smw2780-x  

---

## 1. Problem Framing & Business Case
Students and commuters in regions with volatile weather (such as Rochester, NY) face sharp daily swings in temperature, wind chill, and precipitation between morning classes and evening commutes. Checking raw weather metrics across multiple apps takes time and still leads to poor layering decisions—resulting in discomfort, forgotten rain gear, or carrying bulky coats unnecessarily.

**Weather-Wear** solves this by translating real-time meteorological data and personal cold-sensitivity preferences into an immediate, visual clothing and gear checklist.

## 2. Measurable Improvement
* **Before (Manual Process):** Checking 3–4 separate data points (temperature, wind speed, precipitation probability, UV/snow) and manually deciding what to wear (~2–3 minutes of decision friction every morning).
* **After (Weather-Wear):** Automated, rule-based outfit generation tailored to personal thermal comfort in **under 5 seconds**, complete with a visual layer preview and quick-ask gear assistant.

## 3. Key Features & Architecture
* **Zero-Secret API Integration:** Uses the keyless [Open-Meteo API](https://open-meteo.com/) for real-time geocoding and weather forecasts—ensuring zero exposed credentials or billing risks.
* **Personal Thermal Calibration:** Users set their cold/heat sensitivity and available wardrobe items before generating recommendations.
* **Live Demo Scenario Simulator:** Built-in override presets (*Rochester Blizzard*, *Windy Rain*, *Crisp Fall*, *Humid Summer*) allow deterministic testing of edge cases during live presentations.
* **Interactive Outfit Avatar & Assistant:** Dynamic SVG layer visualization paired with a rule-based gear Q&A helper.

## 4. Safe Hosting & Privacy
* Hosted 100% statically on **GitHub Pages** (free tier).
* No API keys, tokens, or personal user data are stored on any external server; preferences remain strictly in local browser memory.
