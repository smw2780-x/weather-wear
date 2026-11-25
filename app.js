const state = {
  unit: "F", // "F" or "C"
  coldThresholdF: 50,
  hotThresholdF: 80,
  avatar: {
    genderSpectrum: 50, // 0 = Masculine, 50 = Androgynous, 100 = Feminine
    eyeStyle: "classic", // classic, lashes, soft
    browStyle: "natural", // natural, bold, arched
    jawStyle: "balanced", // balanced, defined, soft
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

function buildCharacterSVG(outfit = { tier: "hoodie", beanie: false, sunglasses: false, scarf: false, shorts: false, skirt: false, boots: false }) {
  const { genderSpectrum, eyeStyle, browStyle, jawStyle, skin, hairStyle, hairColor, outfitStyle, glasses, mood } = state.avatar;
  const femRatio = genderSpectrum / 100; // 0.0 (Masculine) -> 1.0 (Feminine)
  const isFem = femRatio >= 0.6;

  // Jaw / Face Contour
  let headRx = 26;
  if (jawStyle === "defined") headRx = 15;
  else if (jawStyle === "soft") headRx = 28;
  else headRx = Math.round(17 + femRatio * 11);

  const neckW = Math.round(20 - femRatio * 5);
  const neckX = 80 - neckW / 2;

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

  // Front hair
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

  // Headwear
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

  // Eyebrows
  let browsSVG = "";
  if (browStyle === "bold") {
    browsSVG = `
      <rect x="59" y="52" width="15" height="3.5" rx="1.7" fill="${hairColor}" />
      <rect x="86" y="52" width="15" height="3.5" rx="1.7" fill="${hairColor}" />
    `;
  } else if (browStyle === "arched") {
    browsSVG = `
      <path d="M59 54 Q66 49 74 53" fill="none" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" />
      <path d="M86 53 Q94 49 101 54" fill="none" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" />
    `;
  } else {
    const browThickness = (3.2 - femRatio * 1.2).toFixed(1);
    browsSVG = `
      <path d="M60 53 Q67 51 74 53" fill="none" stroke="${hairColor}" stroke-width="${browThickness}" stroke-linecap="round" />
      <path d="M86 53 Q93 51 100 53" fill="none" stroke="${hairColor}" stroke-width="${browThickness}" stroke-linecap="round" />
    `;
  }

  // Eyes & Lashes
  const showLashes = eyeStyle === "lashes" || (eyeStyle === "classic" && isFem);
  const lashesSVG = showLashes
    ? `
      <line x1="62" y1="60" x2="57" y2="57" stroke="#1f1a17" stroke-width="1.8" stroke-linecap="round" />
      <line x1="64" y1="59" x2="60" y2="55" stroke="#1f1a17" stroke-width="1.5" stroke-linecap="round" />
      <line x1="98" y1="60" x2="103" y2="57" stroke="#1f1a17" stroke-width="1.8" stroke-linecap="round" />
      <line x1="96" y1="59" x2="100" y2="55" stroke="#1f1a17" stroke-width="1.5" stroke-linecap="round" />
    `
    : "";

  const eyesSVG =
    eyeStyle === "soft"
      ? `
        <path d="M62 63 Q67 58 72 63" fill="none" stroke="#1f1a17" stroke-width="2.4" stroke-linecap="round" />
        <path d="M88 63 Q93 58 98 63" fill="none" stroke="#1f1a17" stroke-width="2.4" stroke-linecap="round" />
      `
      : `
        <circle cx="67" cy="62" r="3.6" fill="#1f1a17" />
        <circle cx="93" cy="62" r="3.6" fill="#1f1a17" />
        <circle cx="68" cy="61" r="1.2" fill="#ffffff" />
        <circle cx="94" cy="61" r="1.2" fill="#ffffff" />
        ${lashesSVG}
      `;

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

  // Cheek warmth & Lip tone
  const blushOpacity = (0.18 + femRatio * 0.38).toFixed(2);
  const lipColor = isFem ? "#e11d48" : "#3f2a1d";
  const mouthSVG =
    mood === "cool"
      ? `<path d="M72 78 Q82 81 90 75" fill="none" stroke="${lipColor}" stroke-width="2.7" stroke-linecap="round" />`
      : `<path d="M70 76 Q80 86 90 76" fill="none" stroke="${lipColor}" stroke-width="2.7" stroke-linecap="round" />`;

  // Dramatic Silhouette Morphing: Broad Block (Masc) vs. Fitted Waist + Flared Skirt (Fem)
  const shoulderW = Math.round(74 - femRatio * 18); // 74px masc -> 56px fem
  const waistW = Math.round(72 - femRatio * 26);    // 72px masc -> 46px fem
  const hipW = Math.round(70 - femRatio * 6);       // 70px masc -> 64px fem
  const sLeft = 80 - shoulderW / 2;
  const sRight = 80 + shoulderW / 2;
  const wLeft = 80 - waistW / 2;
  const wRight = 80 + waistW / 2;
  const hLeft = 80 - hipW / 2;
  const hRight = 80 + hipW / 2;

  // High-contrast bright colors so feminine skirts & jackets pop clearly against dark card
  let topColor = "#e0683b";
  let sleeveColor = "#c8562b";
  let bottomColor = "#475569";
  let shoeColor = outfit.boots ? "#92400e" : "#f8fafc";
  let shortSleeves = outfit.tier === "tshirt" || (isFem && outfit.tier !== "puffer" && outfitStyle === "casual");
  let outfitDetailsSVG = "";
  const useSkirt = outfit.skirt || (isFem && !outfit.shorts && outfit.tier !== "puffer");

  if (outfitStyle === "formal") {
    topColor = isFem ? "#be185d" : "#1e293b";      // Berry blazer (Fem) vs Navy suit (Masc)
    sleeveColor = isFem ? "#9d174d" : "#0f172a";
    bottomColor = isFem ? "#fbcfe8" : "#334155";   // Soft blush skirt (Fem) vs Slate trousers (Masc)
    shoeColor = isFem ? "#be185d" : "#111827";
    outfitDetailsSVG = isFem
      ? `
        <!-- Fitted V-neck blouse + gold waist belt -->
        <polygon points="70,98 80,122 90,98" fill="#fff1f2" />
        <circle cx="80" cy="112" r="2.6" fill="#f59e0b" />
        <rect x="${wLeft}" y="142" width="${waistW}" height="5" rx="2" fill="#f59e0b" />
      `
      : `
        <polygon points="68,98 80,118 92,98" fill="#f8fafc" />
        <polygon points="77,104 83,104 81,134 79,134" fill="#e0683b" />
      `;
  } else if (outfitStyle === "athletic") {
    topColor = isFem ? "#ec4899" : "#0284c7";      // Vibrant pink crop jacket (Fem) vs Cobalt track top (Masc)
    sleeveColor = isFem ? "#db2777" : "#0369a1";
    bottomColor = isFem ? "#f8fafc" : "#1e293b";   // Crisp white tennis skirt (Fem) vs Dark track pants (Masc)
    shoeColor = isFem ? "#f472b6" : "#38bdf8";
    outfitDetailsSVG = isFem
      ? `
        <line x1="80" y1="98" x2="80" y2="168" stroke="#fce7f3" stroke-width="2" />
        <rect x="${wLeft}" y="146" width="${waistW}" height="6" rx="2" fill="#fbcfe8" />
      `
      : `
        <line x1="${sLeft + 6}" y1="100" x2="${wLeft + 4}" y2="172" stroke="#38bdf8" stroke-width="3" />
        <line x1="${sRight - 6}" y1="100" x2="${wRight - 4}" y2="172" stroke="#38bdf8" stroke-width="3" />
      `;
  } else if (outfitStyle === "streetwear") {
    topColor = isFem ? "#a855f7" : "#18181b";      // Violet cropped hoodie (Fem) vs Black hoodie (Masc)
    sleeveColor = isFem ? "#9333ea" : "#27272a";
    bottomColor = isFem ? "#f43f5e" : "#52525b";   // Coral pleated skirt (Fem) vs Charcoal cargos (Masc)
    shoeColor = isFem ? "#fb7185" : "#e0683b";
    outfitDetailsSVG = isFem
      ? `
        <rect x="65" y="114" width="30" height="13" rx="4" fill="#fde047" />
        <line x1="74" y1="100" x2="74" y2="112" stroke="#ffffff" stroke-width="2" />
        <line x1="86" y1="100" x2="86" y2="112" stroke="#ffffff" stroke-width="2" />
      `
      : `
        <rect x="60" y="116" width="40" height="15" rx="4" fill="#e0683b" />
        <line x1="73" y1="100" x2="73" y2="114" stroke="#f3f4f6" stroke-width="2" />
        <line x1="87" y1="100" x2="87" y2="114" stroke="#f3f4f6" stroke-width="2" />
      `;
  } else if (outfitStyle === "cozy") {
    topColor = isFem ? "#fb7185" : "#d97706";      // Rose knit sweater (Fem) vs Amber sweater (Masc)
    sleeveColor = isFem ? "#f43f5e" : "#b45309";
    bottomColor = isFem ? "#fef3c7" : "#78716c";   // Cream knit skirt (Fem) vs Stone joggers (Masc)
    shoeColor = "#fde68a";
    outfitDetailsSVG = `
      <line x1="${wLeft + 3}" y1="118" x2="${wRight - 3}" y2="118" stroke="#fff1f2" stroke-width="2" stroke-dasharray="4 4" />
      <line x1="${wLeft + 3}" y1="138" x2="${wRight - 3}" y2="138" stroke="#fff1f2" stroke-width="2" stroke-dasharray="4 4" />
    `;
  } else {
    // Casual
    topColor = isFem ? "#f43f5e" : "#e0683b";      // Coral scoop-neck top (Fem) vs Terracotta hoodie (Masc)
    sleeveColor = isFem ? "#e11d48" : "#c8562b";
    bottomColor = isFem ? "#93c5fd" : "#475569";   // Light denim skater skirt (Fem) vs Slate jeans (Masc)
    outfitDetailsSVG = isFem
      ? `
        <path d="M68 98 Q80 114 92 98" fill="none" stroke="#ffe4e6" stroke-width="2.5" />
        <rect x="${wLeft}" y="144" width="${waistW}" height="5" rx="2" fill="#f59e0b" />
      `
      : `
        <line x1="73" y1="100" x2="73" y2="124" stroke="#f3f4f6" stroke-width="2" stroke-linecap="round" />
        <line x1="87" y1="100" x2="87" y2="124" stroke="#f3f4f6" stroke-width="2" stroke-linecap="round" />
      `;
  }

  // Winter Puffer override when freezing
  if (outfit.tier === "puffer") {
    topColor = isFem ? "#9333ea" : "#2563eb";
    sleeveColor = isFem ? "#7e22ce" : "#1d4ed8";
    shortSleeves = false;
    outfitDetailsSVG = `
      <line x1="${sLeft + 2}" y1="115" x2="${sRight - 2}" y2="115" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
      <line x1="${wLeft}" y1="135" x2="${wRight}" y2="135" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
      <line x1="${hLeft}" y1="155" x2="${hRight}" y2="155" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
      <line x1="80" y1="98" x2="80" y2="174" stroke="#fde68a" stroke-width="2" />
    `;
  }

  // Tapered Torso Polygon
  const torsoPolygon = `
    <path d="
      M ${sLeft + 6} 98
      L ${sRight - 6} 98
      Q ${sRight} 98, ${sRight} 106
      L ${wRight} 142
      L ${hRight} 166
      Q ${hRight} 170, ${hRight - 6} 170
      L ${hLeft + 6} 170
      Q ${hLeft} 170, ${hLeft} 166
      L ${wLeft} 142
      L ${sLeft} 106
      Q ${sLeft} 98, ${sLeft + 6} 98
      Z
    " fill="${topColor}" />
  `;

  const scarfSVG = outfit.scarf
    ? `<rect x="58" y="92" width="44" height="13" rx="6" fill="#f59e0b" />
       <rect x="86" y="100" width="11" height="28" rx="4" fill="#d97706" />`
    : "";

  // Bottoms: High-Contrast Flared Pleated Skirt vs. Shorts vs. Trousers
  const legW = isFem ? 18 : 24;
  const legsSVG = useSkirt
    ? `
      <!-- Visible legs below flared skirt -->
      <rect x="57" y="204" width="16" height="40" rx="8" fill="${skin}" />
      <rect x="87" y="204" width="16" height="40" rx="8" fill="${skin}" />
      <!-- Flared A-line skirt -->
      <polygon points="${hLeft - 2},166 ${hRight + 2},166 126,212 34,212" fill="${bottomColor}" />
      <line x1="66" y1="170" x2="56" y2="211" stroke="rgba(0,0,0,0.22)" stroke-width="2" />
      <line x1="80" y1="170" x2="80" y2="211" stroke="rgba(0,0,0,0.22)" stroke-width="2" />
      <line x1="94" y1="170" x2="104" y2="211" stroke="rgba(0,0,0,0.22)" stroke-width="2" />
    `
    : outfit.shorts
    ? `
      <rect x="53" y="172" width="${legW}" height="72" rx="8" fill="${skin}" />
      <rect x="${107 - legW}" y="172" width="${legW}" height="72" rx="8" fill="${skin}" />
      <rect x="50" y="168" width="26" height="36" rx="6" fill="${bottomColor}" />
      <rect x="84" y="168" width="26" height="36" rx="6" fill="${bottomColor}" />
    `
    : `
      <rect x="52" y="168" width="${legW}" height="78" rx="8" fill="${bottomColor}" />
      <rect x="${108 - legW}" y="168" width="${legW}" height="78" rx="8" fill="${bottomColor}" />
    `;

  const armW = isFem ? 12 : 17;

  // Footwear: Slimmer heeled/ankle boots for Fem vs. wider sneakers for Masc
  const footwearSVG = isFem
    ? `
      <rect x="51" y="238" width="24" height="19" rx="6" fill="${shoeColor}" />
      <rect x="85" y="238" width="24" height="19" rx="6" fill="${shoeColor}" />
      <rect x="54" y="253" width="18" height="4" rx="2" fill="#f59e0b" />
      <rect x="88" y="253" width="18" height="4" rx="2" fill="#f59e0b" />
    `
    : `
      <rect x="46" y="${outfit.boots ? 236 : 242}" width="30" height="${outfit.boots ? 22 : 16}" rx="7" fill="${shoeColor}" />
      <rect x="84" y="${outfit.boots ? 236 : 242}" width="30" height="${outfit.boots ? 22 : 16}" rx="7" fill="${shoeColor}" />
    `;

  return `
    <svg viewBox="0 0 160 280" style="width:100%; height:100%;" role="img" aria-label="Custom Character Avatar">
      ${backHair}

      <!-- Neck -->
      <rect x="${neckX}" y="84" width="${neckW}" height="18" rx="6" fill="${skin}" />

      <!-- Ears -->
      <circle cx="51" cy="63" r="6" fill="${skin}" />
      <circle cx="109" cy="63" r="6" fill="${skin}" />

      <!-- Head -->
      <rect x="52" y="34" width="56" height="56" rx="${headRx}" fill="${skin}" />

      ${browsSVG}
      ${eyesSVG}

      <!-- Cheeks -->
      <ellipse cx="61" cy="71" rx="4.5" ry="2.5" fill="rgba(224,104,59,${blushOpacity})" />
      <ellipse cx="99" cy="71" rx="4.5" ry="2.5" fill="rgba(224,104,59,${blushOpacity})" />

      ${mouthSVG}
      ${eyewearSVG}
      ${frontHair}
      ${headwearSVG}

      <!-- Arms -->
      ${
        shortSleeves
          ? `<rect x="${sLeft - armW + 1}" y="102" width="${armW - 2}" height="62" rx="7" fill="${skin}" />
             <rect x="${sRight + 1}" y="102" width="${armW - 2}" height="62" rx="7" fill="${skin}" />
             <rect x="${sLeft - armW}" y="100" width="${armW}" height="24" rx="7" fill="${sleeveColor}" />
             <rect x="${sRight}" y="100" width="${armW}" height="24" rx="7" fill="${sleeveColor}" />`
          : `<rect x="${sLeft - armW}" y="100" width="${armW}" height="64" rx="8" fill="${sleeveColor}" />
             <rect x="${sRight}" y="100" width="${armW}" height="64" rx="8" fill="${sleeveColor}" />
             <circle cx="${sLeft - armW / 2}" cy="166" r="6" fill="${skin}" />
             <circle cx="${sRight + armW / 2}" cy="166" r="6" fill="${skin}" />`
      }

      <!-- Tapered Torso -->
      ${torsoPolygon}
      ${outfitDetailsSVG}
      ${scarfSVG}

      <!-- Legs / Skirt -->
      ${legsSVG}

      <!-- Footwear -->
      ${footwearSVG}
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
      skirt: state.avatar.genderSpectrum >= 60,
      boots: false
    });
  }
  const step2Mount = document.getElementById("step2AvatarMount");
  if (step2Mount && outfitConfig) {
    step2Mount.innerHTML = buildCharacterSVG(outfitConfig);
  }
}

// 1. Masculinity <-> Femininity Spectrum Slider Listener
const genderSlider = document.getElementById("genderSpectrum");
genderSlider.addEventListener("input", () => {
  const val = parseInt(genderSlider.value, 10);
  state.avatar.genderSpectrum = val;
  let label = `Balanced / Androgynous (${val}%)`;
  if (val <= 20) label = `Strong Masculine (${100 - val}% Masc)`;
  else if (val < 45) label = `Soft Masculine (${100 - val}% Masc)`;
  else if (val > 80) label = `Strong Feminine (${val}% Fem)`;
  else if (val > 55) label = `Soft Feminine (${val}% Fem)`;
  document.getElementById("genderSpectrumLabel").textContent = label;
  refreshAvatarPreview();
});

// 2. Facial Feature Cyclers
const EYE_MODES = ["classic", "lashes", "soft"];
const BROW_MODES = ["natural", "bold", "arched"];
const JAW_MODES = ["balanced", "defined", "soft"];

function updateFacialSummary() {
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  document.getElementById("facialSummaryLabel").textContent =
    `${cap(state.avatar.browStyle)} Brows • ${cap(state.avatar.eyeStyle)} Eyes`;
}

document.getElementById("cycleEyesBtn").addEventListener("click", () => {
  const next = EYE_MODES[(EYE_MODES.indexOf(state.avatar.eyeStyle) + 1) % EYE_MODES.length];
  state.avatar.eyeStyle = next;
  document.getElementById("eyesBtnText").textContent = `Eyes: ${next.charAt(0).toUpperCase() + next.slice(1)}`;
  updateFacialSummary();
  refreshAvatarPreview();
});

document.getElementById("cycleBrowsBtn").addEventListener("click", () => {
  const next = BROW_MODES[(BROW_MODES.indexOf(state.avatar.browStyle) + 1) % BROW_MODES.length];
  state.avatar.browStyle = next;
  document.getElementById("browsBtnText").textContent = `Brows: ${next.charAt(0).toUpperCase() + next.slice(1)}`;
  updateFacialSummary();
  refreshAvatarPreview();
});

document.getElementById("cycleJawBtn").addEventListener("click", () => {
  const next = JAW_MODES[(JAW_MODES.indexOf(state.avatar.jawStyle) + 1) % JAW_MODES.length];
  state.avatar.jawStyle = next;
  document.getElementById("jawBtnText").textContent = `Face: ${next.charAt(0).toUpperCase() + next.slice(1)}`;
  refreshAvatarPreview();
});

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
    skirt: false,
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
    const mildBottom = pickFromCloset(p.bottoms, ["Chinos / Trousers", "Jeans", "Skirts / Dresses", "Shorts"], "Comfortable Bottoms");
    bottoms.push(mildBottom);
    bottoms.push(pickFromCloset(p.footwear, ["Sneakers", "Loafers / Dress Shoes"], "Everyday Shoes"));
    if (p.accessories.includes("Sunglasses") && w.condition.includes("Clear")) {
      gear.push("Sunglasses");
      avatarOutfit.sunglasses = true;
    }
    if (mildBottom === "Skirts / Dresses" || state.avatar.genderSpectrum >= 60) {
      avatarOutfit.skirt = true;
    }
    summary = `Right inside your ${formatTemp(state.coldThresholdF)}–${formatTemp(state.hotThresholdF)} comfort sweet spot.`;
  } else {
    tops.push(pickFromCloset(p.tops, ["Tank Tops", "T-Shirts", "Blouses / Dress Shirts"], "Lightweight Top"));
    const warmBottom = pickFromCloset(p.bottoms, ["Shorts", "Skirts / Dresses", "Chinos / Trousers"], "Light Bottoms");
    bottoms.push(warmBottom);
    bottoms.push(pickFromCloset(p.footwear, ["Sandals / Slides", "Sneakers"], "Breathable Footwear"));
    if (p.accessories.includes("Sunglasses")) {
      gear.push("Sunglasses");
      avatarOutfit.sunglasses = true;
    }
    if (p.accessories.includes("Caps / Beanies")) gear.push("Sun Cap");

    avatarOutfit.tier = "tshirt";
    if (warmBottom === "Skirts / Dresses" || state.avatar.genderSpectrum >= 60) {
      avatarOutfit.skirt = true;
    } else {
      avatarOutfit.shorts = true;
    }
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
