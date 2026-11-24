const state = {
  unit: "F", // "F" or "C"
  sensitivityOffsetF: 0,
  wardrobe: ["Heavy Parka", "Fleece / Hoodie", "Rain Shell", "Thermal Base", "Winter Boots", "Umbrella"],
  currentWeather: {
    city: "Rochester, NY",
    tempF: 38,
    feelsLikeF: 30,
    windMph: 14,
    precipMm: 0.2,
    condition: "Chilly & Breezy"
  }
};

const PRESETS = {
  blizzard: { city: "Rochester, NY (Demo)", tempF: 14, feelsLikeF: 2, windMph: 22, precipMm: 4.5, condition: "Heavy Snow" },
  rain: { city: "Rochester, NY (Demo)", tempF: 46, feelsLikeF: 39, windMph: 18, precipMm: 3.1, condition: "Windy Rain" },
  fall: { city: "Rochester, NY (Demo)", tempF: 62, feelsLikeF: 60, windMph: 7, precipMm: 0.0, condition: "Partly Cloudy" },
  summer: { city: "Rochester, NY (Demo)", tempF: 86, feelsLikeF: 90, windMph: 5, precipMm: 0.0, condition: "Sunny & Humid" }
};

// Elements
const step1 = document.getElementById("step1Section");
const step2 = document.getElementById("step2Section");
const badge1 = document.getElementById("badgeStep1");
const badge2 = document.getElementById("badgeStep2");
const editPrefsBtn = document.getElementById("editPrefsBtn");
const sensitivityInput = document.getElementById("coldSensitivity");
const sensitivityReadout = document.getElementById("sensitivityReadout");

// Update sensitivity readout
sensitivityInput.addEventListener("input", () => {
  const val = parseInt(sensitivityInput.value, 10);
  state.sensitivityOffsetF = val;
  if (val > 0) sensitivityReadout.textContent = `Run Cold (+${val}°F buffer)`;
  else if (val < 0) sensitivityReadout.textContent = `Run Warm (${val}°F buffer)`;
  else sensitivityReadout.textContent = "Neutral (0°F)";
});

// Unit Toggle
document.getElementById("unitToggle").addEventListener("click", () => {
  state.unit = state.unit === "F" ? "C" : "F";
  document.getElementById("unitToggle").textContent = state.unit === "F" ? "°F / mph" : "°C / km/h";
  renderDashboard();
});

// Step Navigation
document.getElementById("toDashboardBtn").addEventListener("click", () => {
  const checked = Array.from(document.querySelectorAll(".checkbox-grid input:checked")).map(cb => cb.value);
  state.wardrobe = checked;
  step1.classList.add("hidden");
  step2.classList.remove("hidden");
  editPrefsBtn.classList.remove("hidden");
  badge1.classList.remove("active");
  badge2.classList.add("active");
  fetchLiveWeather("Rochester");
});

editPrefsBtn.addEventListener("click", () => {
  step2.classList.add("hidden");
  step1.classList.remove("hidden");
  editPrefsBtn.classList.add("hidden");
  badge2.classList.remove("active");
  badge1.classList.add("active");
});

// Demo Preset Chips
document.querySelectorAll(".demo-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".demo-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const key = btn.dataset.preset;
    if (key === "live") {
      const city = document.getElementById("cityInput").value.trim() || "Rochester";
      fetchLiveWeather(city);
    } else {
      state.currentWeather = { ...PRESETS[key] };
      renderDashboard();
    }
  });
});

// City Search Form
document.getElementById("citySearchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.querySelectorAll(".demo-chip").forEach(b => b.classList.remove("active"));
  document.querySelector('[data-preset="live"]').classList.add("active");
  const city = document.getElementById("cityInput").value.trim() || "Rochester";
  fetchLiveWeather(city);
});

// Keyless Open-Meteo API Lookup
async function fetchLiveWeather(cityName) {
  document.getElementById("conditionBadge").textContent = "Fetching...";
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }
    const place = geoData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=mm`;
    const wRes = await fetch(weatherUrl);
    const wData = await wRes.json();
    const curr = wData.current;

    state.currentWeather = {
      city: `${place.name}${place.admin1 ? ", " + place.admin1 : ""}`,
      tempF: Math.round(curr.temperature_2m),
      feelsLikeF: Math.round(curr.apparent_temperature),
      windMph: Math.round(curr.wind_speed_10m),
      precipMm: curr.precipitation,
      condition: decodeWeatherCode(curr.weather_code)
    };
  } catch (err) {
    // Fallback if offline during demo
    state.currentWeather = { ...PRESETS.fall, city: `${cityName} (Offline Fallback)` };
  }
  renderDashboard();
}

function decodeWeatherCode(code) {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowfall";
  if (code <= 86) return "Snow Showers";
  return "Stormy";
}

function formatTemp(f) {
  return state.unit === "F" ? `${f}°F` : `${Math.round(((f - 32) * 5) / 9)}°C`;
}

function formatWind(mph) {
  return state.unit === "F" ? `${mph} mph` : `${Math.round(mph * 1.609)} km/h`;
}

// Recommendation Engine + Render
function renderDashboard() {
  const w = state.currentWeather;
  // Adjust effective temperature based on user's cold sensitivity
  const effectiveTempF = w.feelsLikeF - state.sensitivityOffsetF;
  const isWet = w.precipMm > 0.3 || w.condition.toLowerCase().includes("rain") || w.condition.toLowerCase().includes("snow");

  document.getElementById("locationTitle").textContent = w.city;
  document.getElementById("conditionBadge").textContent = w.condition;
  document.getElementById("tempDisplay").textContent = formatTemp(w.tempF);
  document.getElementById("feelsLikeText").textContent = `Feels like: ${formatTemp(w.feelsLikeF)} (Adjusted: ${formatTemp(effectiveTempF)})`;
  document.getElementById("windText").textContent = `Wind: ${formatWind(w.windMph)}`;
  document.getElementById("precipText").textContent = `Precipitation: ${w.precipMm} mm`;

  const tops = [];
  const bottoms = [];
  const gear = [];
  let torsoColor = "#e0683b";
  let legColor = "#4b5563";
  let hatColor = "transparent";
  let summary = "";

  if (effectiveTempF <= 32) {
    tops.push(state.wardrobe.includes("Heavy Parka") ? "Heavy Parka" : "Insulated Winter Coat");
    if (state.wardrobe.includes("Thermal Base")) tops.push("Thermal Base Layer");
    bottoms.push("Heavy Jeans / Lined Pants");
    bottoms.push(state.wardrobe.includes("Winter Boots") ? "Waterproof Winter Boots" : "Closed-Toe Boots");
    gear.push("Insulated Gloves", "Warm Beanie");
    torsoColor = "#3b82f6";
    hatColor = "#f59e0b";
    summary = "Freezing wind chill—bundle up in full thermal layers.";
  } else if (effectiveTempF <= 52) {
    tops.push(state.wardrobe.includes("Fleece / Hoodie") ? "Fleece / Hoodie" : "Midweight Sweater");
    if (isWet && state.wardrobe.includes("Rain Shell")) tops.push("Waterproof Rain Shell");
    else tops.push("Windbreaker / Light Jacket");
    bottoms.push("Full-Length Pants", "Water-Resistant Sneakers");
    if (w.windMph >= 15) gear.push("Light Scarf / Neck Gaiter");
    torsoColor = "#e0683b";
    summary = "Chilly air—layer a midweight top under a wind or rain shell.";
  } else if (effectiveTempF <= 72) {
    tops.push("Long-Sleeve Tee or Light Hoodie");
    bottoms.push("Chinos or Jeans", "Everyday Sneakers");
    torsoColor = "#f59e0b";
    summary = "Comfortable campus weather—one light layer is enough.";
  } else {
    tops.push("Breathable T-Shirt");
    bottoms.push("Shorts or Light Pants", "Breathable Sneakers");
    gear.push("Sunglasses", "Water Bottle");
    torsoColor = "#10b981";
    legColor = "#9ca3af";
    summary = "Warm conditions—stick to light, breathable fabrics.";
  }

  if (isWet) {
    if (state.wardrobe.includes("Umbrella") && w.windMph < 20) gear.push("Compact Umbrella");
    else if (w.windMph >= 20) gear.push("Hooded Shell (Too windy for umbrella)");
  }

  document.getElementById("decisionSummary").textContent = summary;

  // Update SVG Avatar
  document.getElementById("svgTorso").setAttribute("fill", torsoColor);
  document.getElementById("svgLeftArm").setAttribute("fill", torsoColor);
  document.getElementById("svgRightArm").setAttribute("fill", torsoColor);
  document.getElementById("svgLeftLeg").setAttribute("fill", legColor);
  document.getElementById("svgRightLeg").setAttribute("fill", legColor);
  document.getElementById("svgHat").setAttribute("fill", hatColor);

  renderTags("topTags", tops);
  renderTags("bottomTags", bottoms);
  renderTags("gearTags", gear.length ? gear : ["No extra gear needed"]);
}

function renderTags(elementId, items) {
  const container = document.getElementById(elementId);
  container.innerHTML = items.map(item => `<span class="tag">${item}</span>`).join("");
}

// Rule-based Gear Chat Assistant
document.getElementById("chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const q = input.value.trim();
  if (!q) return;

  appendBubble(q, "user");
  input.value = "";

  const w = state.currentWeather;
  const lower = q.toLowerCase();
  let reply = "";

  if (lower.includes("umbrella") || lower.includes("rain")) {
    if (w.windMph >= 20) {
      reply = `Wind is at ${formatWind(w.windMph)}—skip the umbrella so it doesn't invert, and rely on a hooded rain shell instead.`;
    } else if (w.precipMm > 0.3 || w.condition.toLowerCase().includes("rain")) {
      reply = `Yes, precipitation is active (${w.precipMm} mm). Bring an umbrella or waterproof outer layer.`;
    } else {
      reply = `No rain is currently detected in ${w.city} (${w.condition}), so you can leave the umbrella behind.`;
    }
  } else if (lower.includes("cold") || lower.includes("jacket") || lower.includes("coat")) {
    reply = `It currently feels like ${formatTemp(w.feelsLikeF)} in ${w.city}. With your sensitivity offset (${state.sensitivityOffsetF > 0 ? "+" : ""}${state.sensitivityOffsetF}°F), follow the outer layer listed in your Layer Preview card.`;
  } else {
    reply = `For ${w.city} (${formatTemp(w.tempF)}, ${w.condition}, wind ${formatWind(w.windMph)}), prioritize wind protection and check your highlighted tags above before heading out.`;
  }

  setTimeout(() => appendBubble(reply, "bot"), 250);
});

function appendBubble(text, sender) {
  const box = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = `chat-bubble ${sender}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
