const state = {
  unit: "F", // "F" or "C"
  coldThresholdF: 50,
  hotThresholdF: 80,
  avatar: {
    skin: "#ffdbac",
    hairStyle: "short", // short, long, bun, curly
    hairColor: "#1f1a17",
    outfitStyle: "casual", // casual, formal, athletic, streetwear, cozy
    glasses: false,
    mood: "happy" // happy, cool
  },
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

// Build Bitmoji-Style Illustrated SVG Character with Clothing Style Aesthetics
function buildCharacterSVG(outfit = { tier: "hoodie", beanie: false, sunglasses: false, scarf: false, shorts: false, boots: false }) {
  const { skin, hairStyle, hairColor, outfitStyle, glasses, mood } = state.avatar;

  // Back hair layer
  let backHair = "";
  if (hairStyle === "long") {
    backHair = `<path d="M44 48 C34 72, 34 115, 42 135 L118 135 C126 115, 126 72, 116 48 Z" fill="${hairColor}" />`;
  } else if (hairStyle === "curly") {
    backHair = `
      <circle cx="48" cy="46" r="16" fill="${hairColor}" />
      <circle cx="112" cy="46" r="16" fill="${hairColor}" />
      <circle cx="44" cy="66" r="15" fill="${hairColor}" />
      <circle cx="116" cy="66" r="15" fill="${hairColor}" />
      <circle cx="80" cy="34" r="22" fill="${hairColor}" />
    `;
  } else if (hairStyle === "bun") {
    backHair = `<circle cx="80" cy="22" r="15" fill="${hairColor}" />`;
  }

  // Front hair (or Streetwear snapback cap if not freezing)
  let frontHair = "";
  if (!outfit.beanie) {
    if (hairStyle === "short") {
      frontHair = `<path d="M51 54 C51 30, 109 30, 109 54 C104 42, 56 42, 51 54 Z" fill="${hairColor}" />`;
    } else if (hairStyle === "long" || hairStyle === "bun") {
      frontHair = `<path d="M50 56 C50 28, 110 28, 110 56 C98 40, 74 42, 50 56 Z" fill="${hairColor}" />`;
    } else if (hairStyle === "curly") {
      frontHair = `
        <circle cx="58" cy="38" r="12" fill="${hairColor}" />
        <circle cx="80" cy="34" r="14" fill="${hairColor}" />
        <circle cx="102" cy="38" r="12" fill="${hairColor}" />
      `;
    }
  }

  // Headwear: Winter Beanie OR Streetwear Cap
  let headwearSVG = "";
  if (outfit.beanie) {
    headwearSVG = `
      <path d="M49 52 C49 24, 111 24, 111 52 Z" fill="#e0683b" />
      <rect x="47" y="47" width="66" height="11" rx="5" fill="#f59e0b" />
      <circle cx="80" cy="22" r="7" fill="#f59e0b" />
    `;
  } else if (outfitStyle === "streetwear") {
    headwearSVG = `
      <path d="M50 48 C50 26, 110 26, 110 48 Z" fill="#18181b" />
      <rect x="48" y="44" width="76" height="7" rx="3.5" fill="#e0683b" />
    `;
  }

  // Eyewear
  let eyewearSVG = "";
  if (outfit.sunglasses) {
    eyewearSVG = `
      <rect x="57" y="57" width="19" height="11" rx="3" fill="#111827" stroke="#f59e0b" stroke-width="1.5" />
      <rect x="84" y="57" width="19" height="11" rx="3" fill="#111827" stroke="#f59e0b" stroke-width="1.5" />
      <line x1="76" y1="61" x2="84" y2="61" stroke="#f59e0b" stroke-width="2" />
    `;
  } else if (glasses) {
    eyewearSVG = `
      <rect x="57" y="56" width="19" height="12" rx="3" fill="rgba(255,255,255,0.12)" stroke="#e5e7eb" stroke-width="1.8" />
      <rect x="84" y="56" width="19" height="12" rx="3" fill="rgba(255,255,255,0.12)" stroke="#e5e7eb" stroke-width="1.8" />
      <line x1="76" y1="61" x2="84" y2="61" stroke="#e5e7eb" stroke-width="1.8" />
    `;
  }

  const mouthSVG =
    mood === "cool"
      ? `<path d="M72 78 Q82 81 90 75" fill="none" stroke="#3f2a1d" stroke-width="2.5" stroke-linecap="round" />`
      : `<path d="M70 76 Q80 86 90 76" fill="none" stroke="#3f2a1d" stroke-width="2.5" stroke-linecap="round" />`;

  // Style-based colors & garment details
  let topColor = "#e0683b";
  let sleeveColor = "#c8562b";
  let pantsColor = "#334155";
  let shoeColor = outfit.boots ? "#78350f" : "#f3f4f6";
  let shortSleeves = outfit.tier === "tshirt";
  let outfitDetailsSVG = "";

  if (outfitStyle === "formal") {
    topColor = "#1e293b";
    sleeveColor = "#0f172a";
    pantsColor = "#1e293b";
    shoeColor = "#111827";
    outfitDetailsSVG = `
      <polygon points="68,98 80,118 92,98" fill="#f8fafc" />
      <polygon points="77,104 83,104 81,134 79,134" fill="#e0683b" />
    `;
  } else if (outfitStyle === "athletic") {
    topColor = "#0284c7";
    sleeveColor = "#0369a1";
    pantsColor = "#1e293b";
    shoeColor = "#38bdf8";
    outfitDetailsSVG = `
      <line x1="52" y1="100" x2="52" y2="172" stroke="#38bdf8" stroke-width="3" />
      <line x1="108" y1="100" x2="108" y2="172" stroke="#38bdf8" stroke-width="3" />
      <line x1="54" y1="172" x2="54" y2="242" stroke="#38bdf8" stroke-width="2.5" />
      <line x1="106" y1="172" x2="106" y2="242" stroke="#38bdf8" stroke-width="2.5" />
    `;
  } else if (outfitStyle === "streetwear") {
    topColor = "#18181b";
    sleeveColor = "#27272a";
    pantsColor = "#3f3f46";
    shoeColor = "#e0683b";
    outfitDetailsSVG = `
      <rect x="58" y="116" width="44" height="16" rx="4" fill="#e0683b" />
      <line x1="73" y1="100" x2="73" y2="114" stroke="#f3f4f6" stroke-width="2" />
      <line x1="87" y1="100" x2="87" y2="114" stroke="#f3f4f6" stroke-width="2" />
    `;
  } else if (outfitStyle === "cozy") {
    topColor = "#d97706";
    sleeveColor = "#b45309";
    pantsColor = "#57534e";
    shoeColor = "#d6d3d1";
    outfitDetailsSVG = `
      <line x1="48" y1="118" x2="112" y2="118" stroke="#fef3c7" stroke-width="2" stroke-dasharray="4 4" />
      <line x1="48" y1="138" x2="112" y2="138" stroke="#fef3c7" stroke-width="2" stroke-dasharray="4 4" />
      <line x1="48" y1="158" x2="112" y2="158" stroke="#fef3c7" stroke-width="2" stroke-dasharray="4 4" />
    `;
  } else {
    // Casual
    outfitDetailsSVG = `
      <line x1="73" y1="100" x2="73" y2="124" stroke="#f3f4f6" stroke-width="2" stroke-linecap="round" />
      <line x1="87" y1="100" x2="87" y2="124" stroke="#f3f4f6" stroke-width="2" stroke-linecap="round" />
    `;
  }

  // Winter Puffer override when freezing
  if (outfit.tier === "puffer") {
    topColor = "#2563eb";
    sleeveColor = "#1d4ed8";
    shortSleeves = false;
    outfitDetailsSVG = `
      <line x1="46" y1="115" x2="114" y2="115" stroke="#1e40af" stroke-width="2" />
      <line x1="46" y1="135" x2="114" y2="135" stroke="#1e40af" stroke-width="2" />
      <line x1="46" y1="155" x2="114" y2="155" stroke="#1e40af" stroke-width="2" />
      <line x1="80" y1="98" x2="80" y2="174" stroke="#93c5fd" stroke-width="2" />
    `;
  }

  const scarfSVG = outfit.scarf
    ? `<rect x="58" y="92" width="44" height="13" rx="6" fill="#f59e0b" />
       <rect x="86" y="100" width="11" height="28" rx="4" fill="#d97706" />`
    : "";

  return `
    <svg viewBox="0 0 160 280" style="width:100%; height:100%;" role="img" aria-label="Custom Character Avatar">
      ${backHair}

      <!-- Neck -->
      <rect x="71" y="84" width="18" height="18" rx="6" fill="${skin}" />

      <!-- Ears -->
      <circle cx="51" cy="63" r="6" fill="${skin}" />
      <circle cx="109" cy="63" r="6" fill="${skin}" />

      <!-- Head -->
      <rect x="52" y="34" width="56" height="56" rx="26" fill="${skin}" />

      <!-- Eyes -->
      <circle cx="67" cy="62" r="3.5" fill="#1f1a17" />
      <circle cx="93" cy="62" r="3.5" fill="#1f1a17" />
      <circle cx="68" cy="61" r="1.2" fill="#ffffff" />
      <circle cx="94" cy="61" r="1.2" fill="#ffffff" />

      <!-- Cheeks -->
      <ellipse cx="61" cy="71" rx="4.5" ry="2.5" fill="rgba(224,104,59,0.35)" />
      <ellipse cx="99" cy="71" rx="4.5" ry="2.5" fill="rgba(224,104,59,0.35)" />

      ${mouthSVG}
      ${eyewearSVG}
      ${frontHair}
      ${headwearSVG}

      <!-- Arms -->
      ${
        shortSleeves
          ? `<rect x="28" y="102" width="16" height="62" rx="8" fill="${skin}" />
             <rect x="116" y="102" width="16" height="62" rx="8" fill="${skin}" />
             <rect x="27" y="100" width="18" height="24" rx="7" fill="${sleeveColor}" />
             <rect x="115" y="100" width="18" height="24" rx="7" fill="${sleeveColor}" />`
          : `<rect x="27" y="100" width="18" height="64" rx="8" fill="${sleeveColor}" />
             <rect x="115" y="100" width="18" height="64" rx="8" fill="${sleeveColor}" />
             <circle cx="36" cy="166" r="7" fill="${skin}" />
             <circle cx="124" cy="166" r="7" fill="${skin}" />`
      }

      <!-- Torso -->
      <rect x="46" y="98" width="68" height="76" rx="16" fill="${topColor}" />
      ${outfitDetailsSVG}
      ${scarfSVG}

      <!-- Legs -->
      ${
        outfit.shorts
          ? `<rect x="52" y="172" width="22" height="72" rx="8" fill="${skin}" />
             <rect x="86" y="172" width="22" height="72" rx="8" fill="${skin}" />
             <rect x="50" y="170" width="26" height="36" rx="6" fill="${pantsColor}" />
             <rect x="84" y="170" width="26" height="36" rx="6" fill="${pantsColor}" />`
          : `<rect x="51" y="170" width="24" height="76" rx="8" fill="${pantsColor}" />
             <rect x="85" y="170" width="24" height="76" rx="8" fill="${pantsColor}" />`
      }

      <!-- Footwear -->
      <rect x="46" y="${outfit.boots ? 236 : 242}" width="30" height="${outfit.boots ? 22 : 16}" rx="7" fill="${shoeColor}" />
      <rect x="84" y="${outfit.boots ? 236 : 242}" width="30" height="${outfit.boots ? 22 : 16}" rx="7" fill="${shoeColor}" />
    </svg>
  `;
}

function refreshAvatarPreview(outfitConfig) {
  const step1Mount = document.getElementById("step1AvatarMount");
  if (step1Mount) {
    step1Mount.innerHTML = buildCharacterSVG({
      tier: "hoodie",
      beanie: false,
      sunglasses: false,
      scarf: false,
      shorts: false,
      boots: false
    });
  }
  const step2Mount = document.getElementById("step2AvatarMount");
  if (step2Mount && outfitConfig) {
    step2Mount.innerHTML = buildCharacterSVG(outfitConfig);
  }
}

// Wire up Step 1 Bitmoji Controls
document.querySelectorAll("#skinSwatches .bitmoji-tile").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#skinSwatches .bitmoji-tile").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.avatar.skin = btn.dataset.skin;
    document.getElementById("skinNameLabel").textContent = btn.dataset.name;
    refreshAvatarPreview();
  });
});

document.querySelectorAll("#hairStylePills .bitmoji-tile").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#hairStylePills .bitmoji-tile").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.avatar.hairStyle = btn.dataset.hair;
    document.getElementById("hairStyleLabel").textContent = btn.dataset.name;
    refreshAvatarPreview();
  });
});

document.querySelectorAll("#hairColorSwatches .bitmoji-tile").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#hairColorSwatches .bitmoji-tile").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.avatar.hairColor = btn.dataset.hcolor;
    document.getElementById("hairColorLabel").textContent = btn.dataset.name;
    document.querySelectorAll(".hair-thumb path, .hair-thumb circle[fill='#1f1a17']").forEach(el => {
      if (el.getAttribute("fill") !== "#e0ac69") el.setAttribute("fill", state.avatar.hairColor);
    });
    refreshAvatarPreview();
  });
});

document.querySelectorAll("#avatarStylePills .bitmoji-tile").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#avatarStylePills .bitmoji-tile").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.avatar.outfitStyle = btn.dataset.astyle;
    document.getElementById("avatarStyleLabel").textContent = btn.dataset.name;
    refreshAvatarPreview();
  });
});

document.getElementById("toggleGlassesBtn").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  state.avatar.glasses = !state.avatar.glasses;
  document.getElementById("glassesText").textContent = `Glasses: ${state.avatar.glasses ? "On" : "Off"}`;
  btn.classList.toggle("active", state.avatar.glasses);
  refreshAvatarPreview();
});

document.getElementById("toggleSmileBtn").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  state.avatar.mood = state.avatar.mood === "happy" ? "cool" : "happy";
  document.getElementById("moodEmoji").textContent = state.avatar.mood === "happy" ? "😄" : "😏";
  document.getElementById("moodText").textContent = state.avatar.mood === "happy" ? "Happy Smile" : "Cool Smirk";
  refreshAvatarPreview();
});

refreshAvatarPreview();

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

document.getElementById("unitToggle").addEventListener("click", () => {
  state.unit = state.unit === "F" ? "C" : "F";
  document.getElementById("unitToggle").textContent = state.unit === "F" ? "Unit: °F" : "Unit: °C";
  updateSliderLabels();
  if (!step2.classList.contains("hidden")) {
    renderDashboard();
  }
});

function collectPreferences() {
  document.querySelectorAll(".checkbox-grid[data-category]").forEach(grid => {
    const cat = grid.dataset.category;
    state.preferences[cat] = Array.from(grid.querySelectorAll("input:checked")).map(cb => cb.value);
  });
}

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
  refreshAvatarPreview();
});

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

document.getElementById("citySearchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.querySelectorAll(".demo-chip[data-preset]").forEach(b => b.classList.remove("active"));
  document.querySelector('[data-preset="live"]').classList.add("active");
  const city = document.getElementById("cityInput").value.trim() || "Rochester";
  fetchLiveWeather(city);
});

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
    `Your Comfort Zone: ${formatTemp(state.coldThresholdF)} (Cold) – ${formatTemp(state.hotThresholdF)} (Hot) • Style: ${document.getElementById("avatarStyleLabel").textContent}`;

  const tops = [];
  const bottoms = [];
  const gear = [];
  let summary = "";

  const avatarOutfit = {
    tier: "hoodie",
    beanie: false,
    sunglasses: false,
    scarf: false,
    shorts: false,
    boots: false
  };

  if (feels <= state.coldThresholdF - 18) {
    tops.push(pickFromCloset(p.tops, ["Long Sleeve Shirts", "Button-ups / Polos"], "Thermal Top"));
    tops.push(pickFromCloset(p.outerwear, ["Heavy Coats / Puffers", "Hoodies & Sweatshirts"], "Heavy Winter Coat"));
    bottoms.push(pickFromCloset(p.bottoms, ["Jeans", "Chinos / Trousers", "Sweatpants / Joggers"], "Warm Pants"));
    bottoms.push(pickFromCloset(p.footwear, ["Boots", "Sneakers"], "Insulated Boots"));
    if (p.accessories.includes("Caps / Beanies")) gear.push("Warm Beanie");
    if (p.accessories.includes("Scarves & Gloves")) gear.push("Scarves & Gloves");
    else gear.push("Gloves Recommended");

    avatarOutfit.tier = "puffer";
    avatarOutfit.beanie = true;
    avatarOutfit.scarf = true;
    avatarOutfit.boots = true;
    summary = `Well below your ${formatTemp(state.coldThresholdF)} cold threshold—full insulated layers required.`;
  } else if (feels <= state.coldThresholdF) {
    tops.push(pickFromCloset(p.tops, ["Long Sleeve Shirts", "Button-ups / Polos", "T-Shirts"], "Long Sleeve Top"));
    tops.push(pickFromCloset(p.outerwear, ["Hoodies & Sweatshirts", "Light Sweaters & Cardigans", "Light Jackets (Denim, Leather)"], "Midweight Layer"));
    bottoms.push(pickFromCloset(p.bottoms, ["Jeans", "Chinos / Trousers", "Sweatpants / Joggers"], "Full-Length Pants"));
    bottoms.push(pickFromCloset(p.footwear, ["Boots", "Sneakers", "Loafers / Dress Shoes"], "Closed-Toe Shoes"));
    if (p.accessories.includes("Caps / Beanies") && w.windMph >= 12) {
      gear.push("Cap / Beanie");
      avatarOutfit.beanie = true;
    }

    avatarOutfit.tier = "hoodie";
    avatarOutfit.boots = p.footwear.includes("Boots");
    summary = `Below your ${formatTemp(state.coldThresholdF)} cold threshold—add a warm outer layer.`;
  } else if (feels < state.hotThresholdF) {
    tops.push(pickFromCloset(p.tops, ["T-Shirts", "Button-ups / Polos", "Blouses / Dress Shirts", "Long Sleeve Shirts"], "Breathable Top"));
    if (feels <= state.coldThresholdF + 10 && p.outerwear.length) {
      tops.push(pickFromCloset(p.outerwear, ["Light Sweaters & Cardigans", "Light Jackets (Denim, Leather)"], "Optional Light Layer"));
      avatarOutfit.tier = "hoodie";
    } else {
      avatarOutfit.tier = "tshirt";
    }
    bottoms.push(pickFromCloset(p.bottoms, ["Chinos / Trousers", "Jeans", "Skirts / Dresses", "Shorts"], "Comfortable Bottoms"));
    bottoms.push(pickFromCloset(p.footwear, ["Sneakers", "Loafers / Dress Shoes"], "Everyday Shoes"));
    if (p.accessories.includes("Sunglasses") && w.condition.includes("Clear")) {
      gear.push("Sunglasses");
      avatarOutfit.sunglasses = true;
    }
    summary = `Right inside your ${formatTemp(state.coldThresholdF)}–${formatTemp(state.hotThresholdF)} comfort sweet spot.`;
  } else {
    tops.push(pickFromCloset(p.tops, ["Tank Tops", "T-Shirts", "Blouses / Dress Shirts"], "Lightweight Top"));
    bottoms.push(pickFromCloset(p.bottoms, ["Shorts", "Skirts / Dresses", "Chinos / Trousers"], "Light Bottoms"));
    bottoms.push(pickFromCloset(p.footwear, ["Sandals / Slides", "Sneakers"], "Breathable Footwear"));
    if (p.accessories.includes("Sunglasses")) {
      gear.push("Sunglasses");
      avatarOutfit.sunglasses = true;
    }
    if (p.accessories.includes("Caps / Beanies")) gear.push("Sun Cap");

    avatarOutfit.tier = "tshirt";
    avatarOutfit.shorts = true;
    summary = `Above your ${formatTemp(state.hotThresholdF)} heat threshold—keep fabrics light and breathable.`;
  }

  if (isWet) {
    if (p.outerwear.includes("Raincoats / Windbreakers")) tops.push("Raincoat / Windbreaker");
    if (p.accessories.includes("Umbrella") && w.windMph < 20) gear.push("Umbrella");
    else if (w.windMph >= 20) gear.push("Hooded Layer (Too windy for umbrella)");
  }

  document.getElementById("decisionSummary").textContent = summary;
  refreshAvatarPreview(avatarOutfit);

  renderTags("topTags", tops);
  renderTags("bottomTags", bottoms);
  renderTags("gearTags", gear.length ? gear : ["No extra weather gear needed"]);
}

function renderTags(elementId, items) {
  const container = document.getElementById(elementId);
  container.innerHTML = items.map(item => `<span class="tag">${item}</span>`).join("");
}

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
