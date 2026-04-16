export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, style, count } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt manquant ou invalide' });
  }

  const safeCount = Math.min(Math.max(parseInt(count) || 1, 1), 4);
  const safeStyle = ['abstract','landscape','portrait','architecture','glitch','minimal'].includes(style)
    ? style : 'abstract';

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: buildPrompt(prompt.trim(), safeStyle, safeCount),
        }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'Erreur API Anthropic' });
    }

    const data = await anthropicRes.json();
    const text = data.content?.[0]?.text || '';

    let parsed;
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: 'Réponse IA invalide' });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
}

function buildPrompt(prompt, style, count) {
  return `Tu es un moteur de génération d'images procédurale. À partir d'un prompt et d'un style, génère ${count} image(s) sous forme de données de rendu canvas.

Prompt utilisateur : "${prompt}"
Style : ${style}

Réponds UNIQUEMENT avec un JSON valide (aucun texte avant/après) au format :
{
  "images": [
    {
      "style": "${style}",
      "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
      "background": "#hex",
      "elements": [
        {
          "type": "circle|rect|polygon|line|arc|bezier",
          "x": 0-800, "y": 0-800,
          "w": 0-800, "h": 0-800,
          "r": 0-400,
          "color": "#hex",
          "alpha": 0.1-1.0,
          "points": [[x,y],...],
          "strokeWidth": 1-8,
          "stroke": "#hex|null",
          "fill": true|false,
          "x1":0,"y1":0,"x2":800,"y2":800,
          "cp1x":0,"cp1y":0,"cp2x":0,"cp2y":0
        }
      ]
    }
  ]
}

Crée des compositions artistiques riches avec 30-60 éléments par image. Utilise VRAIMENT le prompt pour guider l'esthétique et les formes. Les images doivent être très différentes entre elles. Canvas de 800x800.

Styles:
- abstract: formes géométriques organiques, superpositions, opacités variées
- landscape: couches horizontales, courbes, dégradés de formes pour horizon/ciel/sol
- portrait: formes ovales, lignes douces, composition centrée
- architecture: rectangles, lignes précises, grilles, perspective
- glitch: rectangles décalés, lignes horizontales, couleurs criardes, artefacts
- minimal: 5-10 éléments max, beaucoup d'espace, couleurs sobres`;
}
