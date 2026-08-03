/**
 * Call Gemini vision to identify a meal photo, then map to Pakistani nutrition data.
 */
const { matchPakistaniFood } = require('./pakistaniFoodLookup');

function getModel() {
  const raw = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  // Free-tier quota for 2.0 Flash is 0 (model shut down). Ignore stale env.
  if (/^gemini-2\.0-flash(-lite)?$/i.test(raw)) {
    console.warn(
      `[meals/analyze] GEMINI_MODEL=${raw} is deprecated (free-tier limit 0). Using gemini-2.5-flash instead.`
    );
    return 'gemini-2.5-flash';
  }
  return raw || 'gemini-2.5-flash';
}

function extractJsonObject(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    /* fall through */
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch (_) {
      /* fall through */
    }
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch (_) {
      return null;
    }
  }
  return null;
}

async function identifyMealFromImage({ buffer, mimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured on the server');
    err.status = 503;
    throw err;
  }

  const model = getModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are a nutrition assistant for Pakistani and South Asian meals.
Look at this food photo and respond with ONLY valid JSON (no markdown) in this shape:
{
  "dishName": "most likely dish name",
  "confidence": 0.0,
  "candidates": ["alt name 1", "alt name 2"],
  "notes": "one short sentence"
}
Prefer common Pakistani dish names when possible (biryani, nihari, daal, karahi, chapli kabab, haleem, pulao, paratha, etc).
If the image is not food, set dishName to "" and confidence to 0.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType || 'image/jpeg',
              data: buffer.toString('base64'),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 512,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data?.error?.message ||
      `Gemini request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status >= 400 && res.status < 600 ? res.status : 502;
    throw err;
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') ||
    '';
  const parsed = extractJsonObject(text);
  if (!parsed || !parsed.dishName) {
    const err = new Error('Could not identify a meal in this photo. Try a clearer food photo.');
    err.status = 422;
    throw err;
  }

  return {
    dishName: String(parsed.dishName).trim(),
    confidence: Number(parsed.confidence) || 0,
    candidates: Array.isArray(parsed.candidates)
      ? parsed.candidates.map((c) => String(c).trim()).filter(Boolean)
      : [],
    notes: parsed.notes ? String(parsed.notes).trim() : '',
  };
}

function pickNutrition(identification) {
  const namesToTry = [
    identification.dishName,
    ...(identification.candidates || []),
  ].filter(Boolean);

  let best = null;
  for (const name of namesToTry) {
    const matches = matchPakistaniFood(name, { limit: 3 });
    if (!matches.length) continue;
    if (!best || matches[0].score > best.score) {
      best = { ...matches[0], queriedAs: name };
    }
  }

  if (!best) {
    return {
      matched: false,
      foodName: identification.dishName,
      nutrition: null,
      alternatives: [],
    };
  }

  const alternatives = matchPakistaniFood(identification.dishName, { limit: 4 })
    .filter((m) => m.food.id !== best.food.id)
    .slice(0, 3)
    .map((m) => ({
      id: m.food.id,
      name: m.food.name,
      score: Number(m.score.toFixed(3)),
      carbs_g: m.food.carbs_g,
      protein_g: m.food.protein_g,
      fat_g: m.food.fat_g,
      calories_kcal: m.food.calories_kcal,
    }));

  return {
    matched: true,
    matchScore: Number(best.score.toFixed(3)),
    foodName: best.food.name,
    queriedAs: best.queriedAs,
    nutrition: {
      carbohydrates: best.food.carbs_g,
      protein: best.food.protein_g,
      fat: best.food.fat_g,
      calories: best.food.calories_kcal,
      fiber_g: best.food.fiber_g,
      sugar_g: best.food.sugar_g,
    },
    alternatives,
  };
}

async function analyzeMealImage({ buffer, mimeType }) {
  const identification = await identifyMealFromImage({ buffer, mimeType });
  const nutritionMatch = pickNutrition(identification);

  return {
    identification,
    ...nutritionMatch,
    disclaimer:
      'AI meal estimates are approximate and for self-management only — not medical advice.',
  };
}

module.exports = {
  analyzeMealImage,
  getModel,
};
