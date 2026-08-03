/**
 * Call Gemini vision to identify a meal photo, then map to nutrition lookup data.
 */
const { matchPakistaniFood } = require('./pakistaniFoodLookup');
const { applyPortionToNutrition } = require('./mealNutritionCalc');

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

function getModel() {
  const raw = (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
  // 2.0 shut down; 2.5 blocked for new API projects — remap stale env.
  if (/^gemini-2\.(0|5)-flash(-lite)?$/i.test(raw)) {
    console.warn(
      `[meals/analyze] GEMINI_MODEL=${raw} is unavailable for new projects. Using ${DEFAULT_GEMINI_MODEL} instead.`
    );
    return DEFAULT_GEMINI_MODEL;
  }
  return raw || DEFAULT_GEMINI_MODEL;
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

function collectPartText(parts) {
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => {
      if (!p) return '';
      if (typeof p.text === 'string') return p.text;
      // Some Gemini builds nest output text differently
      if (typeof p.outputText === 'string') return p.outputText;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

function normalizeIdentification(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const dishName = String(
    parsed.dishName || parsed.dish_name || parsed.name || parsed.food || ''
  ).trim();
  if (!dishName) return null;
  return {
    dishName,
    confidence: Number(parsed.confidence ?? parsed.score) || 0,
    candidates: Array.isArray(parsed.candidates)
      ? parsed.candidates.map((c) => String(c).trim()).filter(Boolean)
      : Array.isArray(parsed.alternatives)
        ? parsed.alternatives.map((c) => String(c).trim()).filter(Boolean)
        : [],
    notes: parsed.notes ? String(parsed.notes).trim() : '',
  };
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

  const prompt = `Identify the South Asian / Pakistani dish in this photo.
Return ONLY a JSON object (no markdown) with this exact shape:
{"dishName":"string","confidence":0.0,"candidates":["alt1","alt2"],"notes":"short"}
Examples of good dishName values: White Chana, Chole, Chickpeas curry, Biryani, Nihari, Dal Makhani, Karahi, Haleem, Aloo Gosht.
If you see chickpeas in gravy, use "White Chana" or "Chole".
If the image is not food, use {"dishName":"","confidence":0,"candidates":[],"notes":"not food"}.`;

  const imagePart = {
    inline_data: {
      mime_type: mimeType || 'image/jpeg',
      data: buffer.toString('base64'),
    },
  };

  const body = {
    contents: [
      {
        // Image first often works better for vision models
        parts: [imagePart, { text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      // Avoid burning the output budget on thinking (Gemini 2.5/3.x)
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // If thinkingConfig / responseMimeType unsupported, retry simpler once
    const msg = data?.error?.message || '';
    if (
      res.status === 400 &&
      /thinkingConfig|responseMimeType|Unknown name/i.test(msg)
    ) {
      return identifyMealFromImageSimple({ buffer, mimeType, apiKey, model, prompt, imagePart });
    }
    const err = new Error(msg || `Gemini request failed (${res.status})`);
    err.status = res.status >= 400 && res.status < 600 ? res.status : 502;
    throw err;
  }

  return parseGeminiMealResponse(data);
}

async function identifyMealFromImageSimple({
  buffer,
  mimeType,
  apiKey,
  model,
  prompt,
  imagePart,
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [{ parts: [imagePart, { text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Gemini request failed (${res.status})`);
    err.status = res.status >= 400 && res.status < 600 ? res.status : 502;
    throw err;
  }
  return parseGeminiMealResponse(data);
}

function parseGeminiMealResponse(data) {
  const candidate = data?.candidates?.[0];
  const finishReason = candidate?.finishReason || candidate?.finish_reason || '';
  const blockReason =
    data?.promptFeedback?.blockReason ||
    data?.promptFeedback?.block_reason ||
    '';

  const text = collectPartText(candidate?.content?.parts);

  if (blockReason) {
    const err = new Error(
      `Gemini blocked this image (${blockReason}). Try another photo or enter nutrition manually.`
    );
    err.status = 422;
    throw err;
  }

  const parsed = normalizeIdentification(extractJsonObject(text));
  if (!parsed) {
    console.error('[meals/analyze] Gemini raw response parse failed', {
      finishReason,
      textPreview: String(text).slice(0, 400),
      candidate: candidate ? JSON.stringify(candidate).slice(0, 600) : null,
    });
    let message =
      'AI could not name this dish from the photo. Try again, or enter nutrition manually.';
    if (/MAX_TOKENS/i.test(finishReason)) {
      message =
        'AI response was cut off before naming the dish. Please try Analyze again.';
    } else if (/SAFETY/i.test(finishReason)) {
      message =
        'Gemini safety filters blocked this photo. Try another photo or enter nutrition manually.';
    }
    const err = new Error(message);
    err.status = 422;
    throw err;
  }

  return parsed;
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
      food: null,
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
    food: best.food,
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

async function analyzeMealImage({ buffer, mimeType, dishWeightG, oilG }) {
  const identification = await identifyMealFromImage({ buffer, mimeType });
  const nutritionMatch = pickNutrition(identification);

  if (nutritionMatch.matched && nutritionMatch.food) {
    const scaled = applyPortionToNutrition(nutritionMatch.nutrition, nutritionMatch.food, {
      dishWeightG,
      oilG,
    });
    nutritionMatch.nutrition = {
      carbohydrates: scaled.carbohydrates,
      protein: scaled.protein,
      fat: scaled.fat,
      calories: scaled.calories,
      fiber_g: scaled.fiber_g,
      sugar_g: scaled.sugar_g,
    };
    nutritionMatch.portion = {
      dishWeightG: Number(dishWeightG) || null,
      oilG: Number(oilG) > 0 ? Number(oilG) : 0,
      serving_basis: nutritionMatch.food.serving_basis || 'per_serving',
    };
  }

  // Don't leak full food row to clients
  const { food, ...safe } = nutritionMatch;

  return {
    identification,
    ...safe,
    disclaimer:
      'AI meal estimates are approximate and for self-management only — not medical advice. Scaled by the dish weight and oil you entered.',
  };
}

module.exports = {
  analyzeMealImage,
  getModel,
};
