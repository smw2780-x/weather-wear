const state = {
  unit: "F", // "F" or "C"
  coldThresholdF: 50,
  hotThresholdF: 80,
  preferences: {
    styles: ["Casual"],
    tops: ["T-Shirts", "Button-ups / Polos", "Long Sleeve Shirts"],
    bottoms: ["Jeans", "Chinos / Trousers", "Shorts"],
    outerwear: ["Hoodies & Sweatshirts", "Light Sweaters & Cardigans", "Heavy Coats / Puffers"],
    footwear: ["Sneakers", "Boots"],
    accessories: ["Sunglasses", "Caps / Beanies", "Umbrella"]
  },
  currentWeather: {
    city: "Rochester, NY",
    tempF: 40,
    feelsLikeF: 33,
    windMph: 14,
    precipMm: 0.0,
    condition: "Partly Cloudy"
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
const coldSlider = document.getElementById("coldThreshold");
const hotSlider = document.getElementById("hotThreshold");

function formatTemp(f) {
  return state.unit === "F" ? `${f}°F` : `${Math.round(((f - 32) * 5) / 9)}°C`;
}

function formatWind(mph) {
  return state.unit === "F" ? `${mph} mph` : `${Math.round(mph * 1.609)} km/h`;
}

function updateSliderLabels() {
  state.coldThresholdF = parseInt(coldSlider.value, 10);
  state.hotThresholdF = parseInt(hotSlider.value, 10);

  document.getElementById("coldReadout").textContent = `Selected Threshold: ${formatTemp(state.coldThresholdF)}`;
  document.getElementById("hotReadout").textContent = `Selected Threshold: ${formatTemp(state.hotThresholdF)}`;

  document.getElementById("coldMinLabel").textContent = `${formatTemp(30)} (High Tolerance)`;
  document.getElementById("coldMidLabel").textContent = `${formatTemp(50)} (Average)`;
  document.getElementById("coldMaxLabel").textContent = `${formatTemp(70)} (Low Tolerance)`;

  document.getElementById("hotMinLabel").textContent = `${formatTemp(65)} (Low Tolerance)`;
  document.getElementById("hotMidLabel").textContent = `${formatTemp(80)} (Average)`;
  document.getElementById("hotMaxLabel").textContent = `${formatTemp(95)} (High Tolerance)`;
}

coldSlider.addEventListener("input", updateSliderLabels);
hotSlider.addEventListener("input", updateSliderLabels);

// Unit Toggle
document.getElementById("unitToggle").addEventListener("click", () => {
  state.unit = state.unit === "F" ? "C" : "F";
  document.getElementById("unitToggle").textContent = state.unit === "F" ? "Unit: °F" : "Unit: °C";
  updateSliderLabels();
  if (!step2.classList.contains("hidden")) {
    renderDashboard();
  }
});

// Read all 6 preference groups
function collectPreferences() {
  document.querySelectorAll(".checkbox-grid[data-category]").forEach(grid => {
    const cat = grid.dataset.category;
    state.preferences[cat] = Array.from(grid.querySelectorAll("input:checked")).map(cb => cb.value);
  });
}

// Step Navigation
document.getElementById("toDashboardBtn").addEventListener("click", () => {
  collectPreferences();
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
document.querySelectorAll(".demo-chip[data-preset]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".demo-chip[data-preset]").forEach(b => b.classList.remove("active"));
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
  document.querySelectorAll(".demo-chip[data-preset]").forEach(b => b.classList.remove("active"));
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
    if (!geoData.results || geoData.results.length === 0) throw new Error("City not found");

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

function pickFromCloset(categoryList, preferredOptions, fallback) {
  for (const item of preferredOptions) {
    if (categoryList.includes(item)) return item;
  }
  return categoryList.length ? categoryList[0] : fallback;
}

// Personalized Recommendation Engine
function renderDashboard() {
  const w = state.currentWeather;
  const p = state.preferences;
  const feels = w.feelsLikeF;
  const isWet = w.precipMm > 0.3 || w.condition.toLowerCase().includes("rain") || w.condition.toLowerCase().includes("snow");

  document.getElementById("locationTitle").textContent = w.city;
  document.getElementById("conditionBadge").textContent = w.condition;
  document.getElementById("tempDisplay").textContent = formatTemp(w.tempF);
  document.getElementById("feelsLikeText").textContent = `Feels like: ${formatTemp(feels)}`;
  document.getElementById("windText").textContent = `Wind: ${formatWind(w.windMph)}`;
  document.getElementById("precipText").textContent = `Precipitation: ${w.precipMm} mm`;
  document.getElementById("thresholdSummary").textContent =
    `Your Comfort Zone: ${formatTemp(state.coldThresholdF)} (Cold) – ${formatTemp(state.hotThresholdF)} (Hot)`;

  const tops = [];
  const bottoms = [];
  const gear = [];
  let torsoColor = "#e0683b";
  let legColor = "#4b5563";
  let hatColor = "transparent";
  let summary = "";

  if (feels <= state.coldThresholdF - 18) {
    // Deep Cold
    tops.push(pickFromCloset(p.tops, ["Long Sleeve Shirts", "Button-ups / Polos"], "Thermal Top"));
    tops.push(pickFromCloset(p.outerwear, ["Heavy Coats / Puffers", "Hoodies & Sweatshirts"], "Heavy Winter Coat"));
    bottoms.push(pickFromCloset(p.bottoms, ["Jeans", "Chinos / Trousers", "Sweatpants / Joggers"], "Warm Pants"));
    bottoms.push(pickFromCloset(p.footwear, ["Boots", "Sneakers"], "Insulated Boots"));
    if (p.accessories.includes("Caps / Beanies")) gear.push("Warm Beanie");
    if (p.accessories.includes("Scarves & Gloves")) gear.push("Scarves & Gloves");
    else gear.push("Gloves Recommended");
    torsoColor = "#3b82f6";
    hatColor = "#f59e0b";
    summary = `Well below your ${formatTemp(state.coldThresholdF)} cold threshold—full insulated layers required.`;
  } else if (feels <= state.coldThresholdF) {
    // Below User's Cold Threshold
    tops.push(pickFromCloset(p.tops, ["Long Sleeve Shirts", "Button-ups / Polos", "T-Shirts"], "Long Sleeve Top"));
    tops.push(pickFromCloset(p.outerwear, ["Hoodies & Sweatshirts", "Light Sweaters & Cardigans", "Light Jackets (Denim, Leather)"], "Midweight Layer"));
    bottoms.push(pickFromCloset(p.bottoms, ["Jeans", "Chinos / Trousers", "Sweatpants / Joggers"], "Full-Length Pants"));
    bottoms.push(pickFromCloset(p.footwear, ["Boots", "Sneakers", "Loafers / Dress Shoes"], "Closed-Toe Shoes"));
    if (p.accessories.includes("Caps / Beanies") && w.windMph >= 12) gear.push("Cap / Beanie");
    torsoColor = "#e0683b";
    summary = `Below your ${formatTemp(state.coldThresholdF)} cold threshold—add a warm outer layer.`;
  } else if (feels < state.hotThresholdF) {
    // Inside User's Ideal Comfort Zone
    tops.push(pickFromCloset(p.tops, ["T-Shirts", "Button-ups / Polos", "Blouses / Dress Shirts", "Long Sleeve Shirts"], "Breathable Top"));
    if (feels <= state.coldThresholdF + 10 && p.outerwear.length) {
      tops.push(pickFromCloset(p.outerwear, ["Light Sweaters & Cardigans", "Light Jackets (Denim, Leather)"], "Optional Light Layer"));
    }
    bottoms.push(pickFromCloset(p.bottoms, ["Chinos / Trousers", "Jeans", "Skirts / Dresses", "Shorts"], "Comfortable Bottoms"));
    bottoms.push(pickFromCloset(p.footwear, ["Sneakers", "Loafers / Dress Shoes"], "Everyday Shoes"));
    if (p.accessories.includes("Sunglasses") && w.condition.includes("Clear")) gear.push("Sunglasses");
    torsoColor = "#f59e0b";
    summary = `Right inside your ${formatTemp(state.coldThresholdF)}–${formatTemp(state.hotThresholdF)} comfort sweet spot.`;
  } else {
    // Above User's Hot Threshold
    tops.push(pickFromCloset(p.tops, ["Tank Tops", "T-Shirts", "Blouses / Dress Shirts"], "Lightweight Top"));
    bottoms.push(pickFromCloset(p.bottoms, ["Shorts", "Skirts / Dresses", "Chinos / Trousers"], "Light Bottoms"));
    bottoms.push(pickFromCloset(p.footwear, ["Sandals / Slides", "Sneakers"], "Breathable Footwear"));
    if (p.accessories.includes("Sunglasses")) gear.push("Sunglasses");
    if (p.accessories.includes("Caps / Beanies")) gear.push("Sun Cap");
    torsoColor = "#10b981";
    legColor = "#9ca3af";
    summary = `Above your ${formatTemp(state.hotThresholdF)} heat threshold—keep fabrics light and breathable.`;
  }

  if (isWet) {
    if (p.outerwear.includes("Raincoats / Windbreakers")) tops.push("Raincoat / Windbreaker");
    if (p.accessories.includes("Umbrella") && w.windMph < 20) gear.push("Umbrella");
    else if (w.windMph >= 20) gear.push("Hooded Layer (Too windy for umbrella)");
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
  renderTags("gearTags", gear.length ? gear : ["No extra weather gear needed"]);
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
      reply = `Wind is at ${formatWind(w.windMph)}—skip the umbrella so it doesn't invert, and wear a hooded shell instead.`;
    } else if (w.precipMm > 0.3 || w.condition.toLowerCase().includes("rain")) {
      reply = `Yes, precipitation is active (${w.precipMm} mm). Bring an umbrella or waterproof outer layer.`;
    } else {
      reply = `No rain is currently detected in ${w.city} (${w.condition}), so you can leave your umbrella behind.`;
    }
  } else if (lower.includes("skirt") || lower.includes("shorts") || lower.includes("dress")) {
    if (w.feelsLikeF < state.coldThresholdF) {
      reply = `It feels like ${formatTemp(w.feelsLikeF)}, which is below your ${formatTemp(state.coldThresholdF)} cold threshold. If you wear a skirt or dress, pair it with thermal tights and boots—otherwise stick to full-length pants.`;
    } else {
      reply = `At ${formatTemp(w.feelsLikeF)} (above your ${formatTemp(state.coldThresholdF)} cold threshold), a skirt or shorts will feel comfortable!`;
    }
  } else if (lower.includes("cold") || lower.includes("jacket") || lower.includes("coat")) {
    reply = `It currently feels like ${formatTemp(w.feelsLikeF)} in ${w.city} compared to your ${formatTemp(state.coldThresholdF)} cold threshold—check your Recommended Outfit tags above for the exact layers from your closet.`;
  } else {
    reply = `For ${w.city} (${formatTemp(w.tempF)}, feels like ${formatTemp(w.feelsLikeF)}, wind ${formatWind(w.windMph)}), your outfit is calibrated to your ${formatTemp(state.coldThresholdF)}–${formatTemp(state.hotThresholdF)} comfort range.`;
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
