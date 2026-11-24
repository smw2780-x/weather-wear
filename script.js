/**
 * WeatherWear - Smart Commute & Wardrobe Readiness System (MGIS130 Build Project)
 * Uses Open-Meteo (100% Free, Zero API Keys Required) + Interactive SVG Avatar
 */

const state = {
  unit: "F",
  currentStep: 1,
  activeStyle: "casual",
  preferences: {
    coldThreshold: 50,
    heatThreshold: 80,
    preferredStyles: ["casual"],
    topsStyle: ["T-shirt", "Button-up / Polo", "Long Sleeve T-Shirt"],
    bottomsStyle: ["Jeans", "Chinos / Trousers", "Shorts"],
    layersStyle: ["Hoodie / Sweatshirt", "Light Cardigan / Sweater", "Puffer Jacket / Heavy Coat"],
    shoesStyle: ["Sneakers", "Boots"],
    accessoriesStyle: ["Sunglasses", "Cap / Beanie", "Umbrella"]
  },
  weather: {
    city: "Rochester, US",
    tempF: 66,
    feelsLikeF: 64,
    tempC: 19,
    feelsLikeC: 18,
    condition: "Partly Cloudy",
    isRain: false,
    isSnow: false,
    humidity: 55,
    windMph: 10,
    sourceLabel: "Live Forecast"
  },
  // Tracks what the SVG avatar is currently wearing
  avatarOutfit: {
    topType: "longsleeve",   // tank | tshirt | longsleeve | dressshirt
    bottomType: "pants",     // shorts | pants
    outerType: "light",      // none | light | heavy | blazer
    shoeType: "sneakers",    // sandals | sneakers | boots | dress
    headgear: "none",        // none | cap | beanie
    hasScarf: false,
    hasSunglasses: false,
    hasUmbrella: false
  }
};

// Demo Presets so live presentation never depends on unpredictable weather/Wi-Fi
const WEATHER_PRESETS = {
  blizzard: {
    city: "Rochester, NY (Simulation)",
    tempF: 16,
    feelsLikeF: 2,
    condition: "Heavy Lake-Effect Snow",
    isRain: false,
    isSnow: true,
    humidity: 86,
    windMph: 26,
    sourceLabel: "Demo Preset"
  },
  rainy: {
    city: "Seattle, WA (Simulation)",
    tempF: 45,
    feelsLikeF: 38,
    condition: "Windy Rain Showers",
    isRain: true,
    isSnow: false,
    humidity: 91,
    windMph: 21,
    sourceLabel: "Demo Preset"
  },
  mild: {
    city: "Rochester, NY (Simulation)",
    tempF: 66,
    feelsLikeF: 65,
    condition: "Crisp Partly Cloudy",
    isRain: false,
    isSnow: false,
    humidity: 52,
    windMph: 8,
    sourceLabel: "Demo Preset"
  },
  summer: {
    city: "Miami, FL (Simulation)",
    tempF: 88,
    feelsLikeF: 93,
    condition: "Clear & Sunny",
    isRain: false,
    isSnow: false,
    humidity: 72,
    windMph: 6,
    sourceLabel: "Demo Preset"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUnitToggleDisplay();
});

function setupEventListeners() {
  // Live range slider readouts
  document.getElementById("coldScale")?.addEventListener("input", (e) => {
    document.getElementById("coldTempVal").innerText = `${e.target.value}°F`;
  });
  document.getElementById("heatScale")?.addEventListener("input", (e) => {
    document.getElementById("heatTempVal").innerText = `${e.target.value}°F`;
  });

  // Step navigation
  document.getElementById("goToStep2Btn")?.addEventListener("click", () => {
    saveStep1Preferences();
    switchStep(2);
  });

  document.getElementById("backToStep1Btn")?.addEventListener("click", () => switchStep(1));

  // Auto-detect browser GPS location
  document.getElementById("detectLocationBtn")?.addEventListener("click", handleAutoDetectLocation);

  // Finish onboarding & fetch live weather
  document.getElementById("finishOnboardingBtn")?.addEventListener("click", async () => {
    const cityInput = document.getElementById("initialCityInput")?.value.trim() || "Rochester";
    document.getElementById("cityInput").value = cityInput;
    await fetchLiveWeatherByCity(cityInput);
    showDashboard();
  });

  // Reconfigure preferences
  document.getElementById("reconfigureBtn")?.addEventListener("click", () => {
    document.getElementById("dashboardSection")?.classList.add("hidden");
    document.getElementById("onboardingSection")?.classList.remove("hidden");
    document.getElementById("stepIndicator")?.classList.remove("hidden");
    switchStep(1);
  });

  // Dashboard city search
  document.getElementById("searchBtn")?.addEventListener("click", async () => {
    const city = document.getElementById("cityInput")?.value.trim();
    if (city) {
      await fetchLiveWeatherByCity(city);
      renderDashboard();
    }
  });

  document.getElementById("cityInput")?.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("searchBtn")?.click();
    }
  });

  // Demo simulation buttons
  document.querySelectorAll(".sim-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetKey = btn.getAttribute("data-preset");
      applyWeatherPreset(presetKey);
    });
  });

  // Avatar Style Switcher on Dashboard
  document.getElementById("activeStyleSwitcher")?.addEventListener("change", (e) => {
    state.activeStyle = e.target.value;
    updateAvatarVisuals();
  });

  // Unit Toggle (°F / °C)
  document.getElementById("unitToggle")?.addEventListener("click", () => {
    state.unit = state.unit === "F" ? "C" : "F";
    updateUnitToggleDisplay();
    renderDashboard();
  });

  // Smart Outfit Chat
  document.getElementById("chatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleChatSubmit();
  });
}

function saveStep1Preferences() {
  const coldVal = document.getElementById("coldScale");
  const heatVal = document.getElementById("heatScale");

  if (coldVal) state.preferences.coldThreshold = parseInt(coldVal.value, 10);
  if (heatVal) state.preferences.heatThreshold = parseInt(heatVal.value, 10);

  const checkedStyles = Array.from(document.querySelectorAll('input[name="preferredStyle"]:checked')).map(el => el.value);
  state.preferences.preferredStyles = checkedStyles.length ? checkedStyles : ["casual"];
  state.activeStyle = state.preferences.preferredStyles[0];

  const styleSwitcher = document.getElementById("activeStyleSwitcher");
  if (styleSwitcher) styleSwitcher.value = state.activeStyle;

  state.preferences.topsStyle = Array.from(document.querySelectorAll('input[name="topsStyle"]:checked')).map(el => el.value);
  state.preferences.bottomsStyle = Array.from(document.querySelectorAll('input[name="bottomsStyle"]:checked')).map(el => el.value);
  state.preferences.layersStyle = Array.from(document.querySelectorAll('input[name="layersStyle"]:checked')).map(el => el.value);
  state.preferences.shoesStyle = Array.from(document.querySelectorAll('input[name="shoesStyle"]:checked')).map(el => el.value);
  state.preferences.accessoriesStyle = Array.from(document.querySelectorAll('input[name="accessoriesStyle"]:checked')).map(el => el.value);
}

function switchStep(stepNumber) {
  state.currentStep = stepNumber;
  const step1 = document.getElementById("step1Content");
  const step2 = document.getElementById("step2Content");
  const badge1 = document.getElementById("badgeStep1");
  const badge2 = document.getElementById("badgeStep2");

  if (stepNumber === 1) {
    step1?.classList.remove("hidden");
    step2?.classList.add("hidden");
    badge1?.classList.add("active");
    badge2?.classList.remove("active");
  } else {
    step1?.classList.add("hidden");
    step2?.classList.remove("hidden");
    badge1?.classList.remove("active");
    badge2?.classList.add("active");
  }
}

function showDashboard() {
  document.getElementById("onboardingSection")?.classList.add("hidden");
  document.getElementById("stepIndicator")?.classList.add("hidden");
  document.getElementById("dashboardSection")?.classList.remove("hidden");
  renderDashboard();
}

// Geolocation Auto-Detect
function handleAutoDetectLocation() {
  const statusEl = document.getElementById("locationStatus");
  if (!navigator.geolocation) {
    if (statusEl) statusEl.innerText = "Geolocation not supported by browser. Please enter a city.";
    return;
  }
  if (statusEl) statusEl.innerText = "Detecting coordinates...";
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await fetchWeatherByCoords(latitude, longitude, "Current Location");
      if (statusEl) statusEl.innerText = "Location locked!";
      showDashboard();
    },
    () => {
      if (statusEl) statusEl.innerText = "Permission denied—using manual city entry.";
    }
  );
}

// Fetch coordinates via Open-Meteo Geocoding API (Zero API Key)
async function fetchLiveWeatherByCity(cityName) {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const place = geoData.results[0];
    const displayLabel = `${place.name}${place.admin1 ? ", " + place.admin1 : ""}, ${place.country_code}`;
    await fetchWeatherByCoords(place.latitude, place.longitude, displayLabel);
  } catch (err) {
    // Graceful fallback if offline
    applyWeatherPreset("mild");
    state.weather.city = `${cityName} (Offline Fallback)`;
  }
}

// Fetch live meteorological data via Open-Meteo Forecast API
async function fetchWeatherByCoords(lat, lon, displayLabel) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,snowfall,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  const cur = data.current;

  const tempF = Math.round(cur.temperature_2m);
  const feelsF = Math.round(cur.apparent_temperature);
  const code = cur.weather_code;

  state.weather = {
    city: displayLabel,
    tempF,
    feelsLikeF: feelsF,
    tempC: Math.round(((tempF - 32) * 5) / 9),
    feelsLikeC: Math.round(((feelsF - 32) * 5) / 9),
    condition: decodeWeatherCode(code),
    isRain: cur.rain > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code),
    isSnow: cur.snowfall > 0 || [71, 73, 75, 77, 85, 86].includes(code),
    humidity: cur.relative_humidity_2m,
    windMph: Math.round(cur.wind_speed_10m),
    sourceLabel: "Live Open-Meteo"
  };
}

function decodeWeatherCode(code) {
  if (code === 0) return "Clear Sky";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain Showers";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowfall";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Variable Conditions";
}

function applyWeatherPreset(presetKey) {
  const p = WEATHER_PRESETS[presetKey];
  if (!p) return;
  state.weather = {
    ...p,
    tempC: Math.round(((p.tempF - 32) * 5) / 9),
    feelsLikeC: Math.round(((p.feelsLikeF - 32) * 5) / 9)
  };
  renderDashboard();
}

function renderDashboard() {
  const w = state.weather;
  const tempDisplay = state.unit === "F" ? `${w.tempF}°F` : `${w.tempC}°C`;
  const feelsDisplay = state.unit === "F" ? `Feels like ${w.feelsLikeF}°F` : `Feels like ${w.feelsLikeC}°C`;

  document.getElementById("locationName").innerText = w.city;
  document.getElementById("weatherConditionBadge").innerText = w.sourceLabel;
  document.getElementById("tempDisplay").innerText = tempDisplay;
  document.getElementById("feelsLikeText").innerText = feelsDisplay;
  document.getElementById("conditionText").innerText = w.condition;
  document.getElementById("humidityVal").innerText = `${w.humidity}%`;
  document.getElementById("windVal").innerText = `${w.windMph} mph`;

  updateAdvisoryBanner();
  renderCategoryRecommendations(w.feelsLikeF);
}

function updateAdvisoryBanner() {
  const w = state.weather;
  const { coldThreshold, heatThreshold } = state.preferences;
  let advice = "Comfortable temperature range—standard single or light layer works well.";

  if (w.isSnow || w.feelsLikeF <= 28) {
    advice = "Sub-freezing wind chill risk. Insulated outerwear, gloves, and waterproof boots strongly advised.";
  } else if (w.isRain) {
    advice = w.windMph >= 18
      ? "High winds + rain: wear a hooded waterproof shell (wind may invert umbrellas)."
      : "Wet conditions detected: pack an umbrella and water-resistant footwear.";
  } else if (w.feelsLikeF <= coldThreshold) {
    advice = `Below your ${coldThreshold}°F cold threshold—add a warm outer layer before heading out.`;
  } else if (w.feelsLikeF >= heatThreshold) {
    advice = `Above your ${heatThreshold}°F heat threshold—prioritize breathable fabrics and sun protection.`;
  }

  document.getElementById("advisoryText").innerText = advice;
}

function renderCategoryRecommendations(effectiveTempF) {
  const { coldThreshold, heatThreshold } = state.preferences;
  const w = state.weather;

  // 1. Style tags
  renderTags("styleCategoryRecommendations", state.preferences.preferredStyles, "style");

  // 2. Tops
  let tops = [...state.preferences.topsStyle];
  if (effectiveTempF <= coldThreshold) {
    tops = tops.filter(i => i !== "Tank top");
  }
  if (!tops.length) tops = ["Long Sleeve T-Shirt", "Thermal Top"];
  renderTags("topRecommendations", tops, "top");

  // 3. Bottoms
  let bottoms = [...state.preferences.bottomsStyle];
  if (effectiveTempF <= coldThreshold) {
    bottoms = bottoms.filter(i => i !== "Shorts" && i !== "Skirts / Dresses");
  } else if (effectiveTempF >= heatThreshold) {
    bottoms = bottoms.filter(i => i !== "Sweatpants / Joggers");
  }
  if (!bottoms.length) bottoms = effectiveTempF >= heatThreshold ? ["Shorts"] : ["Jeans", "Chinos / Trousers"];
  renderTags("bottomRecommendations", bottoms, "bottom");

  // 4. Outerwear / Layers
  let layers = [];
  if (effectiveTempF <= 35) {
    layers = ["Puffer Jacket / Heavy Coat", "Thermal Fleece Layer"];
  } else if (effectiveTempF <= coldThreshold) {
    layers = state.preferences.layersStyle.length ? state.preferences.layersStyle : ["Hoodie / Sweatshirt", "Heavy Coat"];
  } else if (effectiveTempF < heatThreshold) {
    layers = w.isRain ? ["Windbreaker / Raincoat"] : ["Light Cardigan / Sweater", "Hoodie / Sweatshirt"];
  } else {
    layers = ["No outer layer needed"];
  }
  renderTags("layerRecommendations", layers, "layer");

  // 5. Footwear
  let shoes = [...state.preferences.shoesStyle];
  if (w.isSnow || w.isRain || effectiveTempF <= 40) {
    shoes = ["Boots", "Waterproof Sneakers"];
  } else if (effectiveTempF <= coldThreshold) {
    shoes = shoes.filter(i => i !== "Sandals / Slides");
  }
  if (!shoes.length) shoes = ["Sneakers"];
  renderTags("shoesRecommendations", shoes, "shoe");

  // 6. Accessories
  let gear = [];
  if (w.isRain) gear.push("Umbrella");
  if (effectiveTempF <= 38 || w.isSnow) gear.push("Knit Beanie", "Scarf & Gloves");
  if (effectiveTempF >= 65 && !w.isRain && !w.isSnow) gear.push("Sunglasses", "Cap");
  if (!gear.length) gear = state.preferences.accessoriesStyle.slice(0, 2);
  renderTags("gearRecommendations", gear, "gear");

  // Sync default Avatar outfit with top recommendations
  syncAvatarWithWeather(effectiveTempF);
}

function renderTags(elementId, itemsArray, category) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";

  itemsArray.forEach((item) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.style.cursor = "pointer";
    span.title = "Click to preview on avatar";

    if (category === "style") {
      span.style.background = "var(--primary-color)";
      span.style.color = "#ffffff";
      span.innerText = item.charAt(0).toUpperCase() + item.slice(1);
    } else {
      span.innerText = item;
    }

    // Interactive click-to-try-on for Avatar!
    span.addEventListener("click", () => {
      previewItemOnAvatar(item, category);
    });

    container.appendChild(span);
  });
}

// =========================================================
// DYNAMIC SVG HUMAN AVATAR ENGINE
// =========================================================
function syncAvatarWithWeather(effectiveTempF) {
  const w = state.weather;
  const { coldThreshold, heatThreshold } = state.preferences;

  state.avatarOutfit.hasUmbrella = w.isRain;
  state.avatarOutfit.hasSunglasses = effectiveTempF >= 68 && !w.isRain && !w.isSnow;
  state.avatarOutfit.hasScarf = effectiveTempF <= 34 || w.isSnow;

  // Headgear
  if (effectiveTempF <= 38 || w.isSnow) {
    state.avatarOutfit.headgear = "beanie";
  } else if (effectiveTempF >= 72 && !w.isRain) {
    state.avatarOutfit.headgear = "cap";
  } else {
    state.avatarOutfit.headgear = "none";
  }

  // Top & Outerwear
  if (effectiveTempF <= 38) {
    state.avatarOutfit.topType = "longsleeve";
    state.avatarOutfit.outerType = "heavy";
  } else if (effectiveTempF <= coldThreshold) {
    state.avatarOutfit.topType = "longsleeve";
    state.avatarOutfit.outerType = "light";
  } else if (effectiveTempF < heatThreshold) {
    state.avatarOutfit.topType = "tshirt";
    state.avatarOutfit.outerType = w.isRain ? "light" : "none";
  } else {
    state.avatarOutfit.topType = "tshirt";
    state.avatarOutfit.outerType = "none";
  }

  // Bottoms
  state.avatarOutfit.bottomType = effectiveTempF >= heatThreshold ? "shorts" : "pants";

  // Shoes
  if (w.isSnow || effectiveTempF <= 38) {
    state.avatarOutfit.shoeType = "boots";
  } else if (effectiveTempF >= heatThreshold + 4) {
    state.avatarOutfit.shoeType = "sandals";
  } else {
    state.avatarOutfit.shoeType = "sneakers";
  }

  updateAvatarVisuals();
}

function previewItemOnAvatar(itemLabel, category) {
  const lower = itemLabel.toLowerCase();

  if (category === "style") {
    state.activeStyle = lower;
    const switcher = document.getElementById("activeStyleSwitcher");
    if (switcher) switcher.value = lower;
  } else if (category === "top") {
    if (lower.includes("tank")) state.avatarOutfit.topType = "tank";
    else if (lower.includes("long")) state.avatarOutfit.topType = "longsleeve";
    else if (lower.includes("button") || lower.includes("blouse")) state.avatarOutfit.topType = "dressshirt";
    else state.avatarOutfit.topType = "tshirt";
  } else if (category === "bottom") {
    state.avatarOutfit.bottomType = lower.includes("short") || lower.includes("skirt") ? "shorts" : "pants";
  } else if (category === "layer") {
    if (lower.includes("no outer")) state.avatarOutfit.outerType = "none";
    else if (lower.includes("heavy") || lower.includes("puffer")) state.avatarOutfit.outerType = "heavy";
    else state.avatarOutfit.outerType = "light";
  } else if (category === "shoe") {
    if (lower.includes("boot")) state.avatarOutfit.shoeType = "boots";
    else if (lower.includes("sandal")) state.avatarOutfit.shoeType = "sandals";
    else if (lower.includes("loafer") || lower.includes("dress")) state.avatarOutfit.shoeType = "dress";
    else state.avatarOutfit.shoeType = "sneakers";
  } else if (category === "gear") {
    if (lower.includes("umbrella")) state.avatarOutfit.hasUmbrella = !state.avatarOutfit.hasUmbrella;
    if (lower.includes("sunglasses")) state.avatarOutfit.hasSunglasses = !state.avatarOutfit.hasSunglasses;
    if (lower.includes("beanie")) state.avatarOutfit.headgear = state.avatarOutfit.headgear === "beanie" ? "none" : "beanie";
    if (lower.includes("cap")) state.avatarOutfit.headgear = state.avatarOutfit.headgear === "cap" ? "none" : "cap";
    if (lower.includes("scarf")) state.avatarOutfit.hasScarf = !state.avatarOutfit.hasScarf;
  }

  updateAvatarVisuals();
}

function updateAvatarVisuals() {
  const outfit = state.avatarOutfit;
  const style = state.activeStyle;

  // Color palettes mapped to the user's chosen Aesthetic Style
  const stylePalettes = {
    casual:     { top: "#3b82f6", pants: "#334155", outer: "#1e293b", shoe: "#f8fafc" },
    formal:     { top: "#f8fafc", pants: "#1f2937", outer: "#111827", shoe: "#451a03" },
    athletic:   { top: "#10b981", pants: "#1e293b", outer: "#065f46", shoe: "#f59e0b" },
    streetwear: { top: "#e0683b", pants: "#18181b", outer: "#27272a", shoe: "#ef4444" },
    cozy:       { top: "#d97706", pants: "#57534e", outer: "#78350f", shoe: "#a8a29e" }
  };
  const palette = stylePalettes[style] || stylePalettes.casual;

  // 1. Toggle Accessories
  toggleSvgEl("avatarUmbrella", outfit.hasUmbrella);
  toggleSvgEl("avatarSunglasses", outfit.hasSunglasses);
  toggleSvgEl("avatarScarf", outfit.hasScarf);
  toggleSvgEl("avatarBeanie", outfit.headgear === "beanie");
  toggleSvgEl("avatarCap", outfit.headgear === "cap");

  // 2. Render Top & Sleeves
  const torso = document.getElementById("torsoShape");
  const sleeves = document.getElementById("sleevesShape");
  if (torso && sleeves) {
    torso.setAttribute("fill", palette.top);
    sleeves.setAttribute("fill", palette.top);

    if (outfit.topType === "tank") {
      sleeves.setAttribute("d", ""); // sleeveless
    } else if (outfit.topType === "tshirt") {
      sleeves.setAttribute("d", "M45 64 L34 92 L43 95 L49 80 M95 64 L106 92 L97 95 L91 80");
    } else {
      // Long sleeve or dress shirt
      sleeves.setAttribute("d", "M45 64 L29 124 L38 127 L49 80 M95 64 L111 124 L102 127 L91 80");
    }
  }

  // 3. Render Outerwear
  const outerGroup = document.getElementById("avatarOuterwear");
  if (outerGroup) {
    if (outfit.outerType === "none" && style !== "formal") {
      outerGroup.classList.add("hidden");
    } else {
      outerGroup.classList.remove("hidden");
      const outerColor = outfit.outerType === "heavy" ? "#e0683b" : palette.outer;
      document.getElementById("outerwearLeft")?.setAttribute("fill", outerColor);
      document.getElementById("outerwearRight")?.setAttribute("fill", outerColor);
      document.getElementById("outerwearSleeves")?.setAttribute("fill", outerColor);
    }
  }

  // 4. Render Bottoms (Shorts vs Long Pants)
  const pants = document.getElementById("pantsShape");
  if (pants) {
    pants.setAttribute("fill", palette.pants);
    if (outfit.bottomType === "shorts") {
      pants.setAttribute("d", "M51 138 L89 138 L90 176 L73 176 L70 160 L67 176 L50 176 Z");
    } else {
      pants.setAttribute("d", "M51 138 L89 138 L91 226 L76 226 L70 162 L64 226 L49 226 Z");
    }
  }

  // 5. Render Shoes
  const shoeLeft = document.getElementById("shoeLeft");
  const shoeRight = document.getElementById("shoeRight");
  if (shoeLeft && shoeRight) {
    const shoeColor = outfit.shoeType === "boots" ? "#78350f" : outfit.shoeType === "sandals" ? "#d97706" : palette.shoe;
    const shoeHeight = outfit.shoeType === "boots" ? "15" : outfit.shoeType === "sandals" ? "6" : "10";
    const shoeY = outfit.shoeType === "boots" ? "219" : outfit.shoeType === "sandals" ? "228" : "224";

    [shoeLeft, shoeRight].forEach((shoe) => {
      shoe.setAttribute("fill", shoeColor);
      shoe.setAttribute("height", shoeHeight);
      shoe.setAttribute("y", shoeY);
    });
  }

  // Update caption
  const caption = document.getElementById("avatarCaption");
  if (caption) {
    const layerLabel = outfit.outerType === "heavy" ? "Heavy Coat" : outfit.outerType === "light" ? "Layered" : "Light Fit";
    caption.innerText = `${style.charAt(0).toUpperCase() + style.slice(1)} • ${layerLabel}`;
  }
}

function toggleSvgEl(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  if (show) el.classList.remove("hidden");
  else el.classList.add("hidden");
}

function updateUnitToggleDisplay() {
  const btn = document.getElementById("unitToggle");
  if (btn) btn.innerText = `Unit: °${state.unit}`;
}

// =========================================================
// RULE-BASED OUTFIT ADVISOR CHAT (Evaluates Real Thresholds)
// =========================================================
function handleChatSubmit() {
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  appendChat(text, "user");
  input.value = "";

  const reply = evaluateOutfitQuestion(text.toLowerCase());
  setTimeout(() => appendChat(reply, "bot"), 300);
}

function evaluateOutfitQuestion(q) {
  const w = state.weather;
  const { coldThreshold, heatThreshold } = state.preferences;
  const temp = w.feelsLikeF;

  if (q.includes("short") || q.includes("skirt")) {
    return temp >= heatThreshold - 4
      ? `Yes! At ${temp}°F (feels like), shorts are right in your comfort zone.`
      : `Not recommended—it feels like ${temp}°F, which is below your ${coldThreshold}°F cold threshold. Stick with pants or jeans.`;
  }
  if (q.includes("sandal") || q.includes("flip")) {
    return !w.isRain && !w.isSnow && temp >= 72
      ? `Good to go—dry conditions and ${temp}°F work well for sandals.`
      : `Skip sandals today (${temp}°F, ${w.condition}). Closed-toe sneakers or boots are safer.`;
  }
  if (q.includes("umbrella") || q.includes("rain")) {
    return w.isRain
      ? (w.windMph >= 18 ? `Bring a hooded rain shell instead—winds are ${w.windMph} mph, which can break an umbrella.` : `Yes, bring an umbrella—rain is in the forecast.`)
      : `No umbrella needed right now (${w.condition}).`;
  }
  if (q.includes("coat") || q.includes("puffer") || q.includes("jacket") || q.includes("hoodie")) {
    if (temp <= 38) return `Definitely wear a heavy coat or puffer—it feels like ${temp}°F with ${w.windMph} mph wind.`;
    if (temp <= coldThreshold) return `A hoodie or medium jacket is ideal since ${temp}°F is below your ${coldThreshold}°F cold threshold.`;
    return `A heavy coat will likely overheat you at ${temp}°F. A light layer or T-shirt is plenty.`;
  }

  return `Based on ${temp}°F (${w.condition}) and your ${coldThreshold}°F–${heatThreshold}°F comfort range, stick with the ${state.activeStyle} outfit shown on your avatar!`;
}

function appendChat(text, sender) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
