# IA Image Generator — Guide de déploiement Vercel

Projet portfolio : générateur d'images procédurales piloté par Claude AI.

## Structure du projet

```
portfolio-ia/
├── api/
│   └── generate.js       ← fonction serverless (backend)
├── public/
│   └── index.html        ← frontend
├── vercel.json           ← config Vercel
├── package.json
└── README.md
```

---

## Déploiement étape par étape

### 1. Créer un compte Vercel
Rends-toi sur https://vercel.com et connecte-toi avec ton compte GitHub.

### 2. Récupérer ta clé API Anthropic
- Va sur https://console.anthropic.com
- Clique sur "API Keys" → "Create Key"
- Copie la clé (commence par `sk-ant-...`)
- ⚠️ Ne la mets JAMAIS dans ton code ou sur GitHub

### 3. Mettre le projet sur GitHub
```bash
# Dans le dossier portfolio-ia/
git init
git add .
git commit -m "feat: IA image generator"
git branch -M main
git remote add origin https://github.com/TON_PSEUDO/ia-image-generator.git
git push -u origin main
```

### 4. Importer sur Vercel
- Sur vercel.com → "Add New Project"
- Sélectionne ton repo `ia-image-generator`
- Clique "Deploy" (les paramètres par défaut suffisent)

### 5. Ajouter la clé API en variable d'environnement
- Dans ton projet Vercel → "Settings" → "Environment Variables"
- Ajoute :
  - **Name** : `ANTHROPIC_API_KEY`
  - **Value** : `sk-ant-xxxxxxxxxx` (ta vraie clé)
  - **Environments** : cocher Production + Preview + Development
- Clique "Save"

### 6. Redéployer
- Onglet "Deployments" → clique les 3 points → "Redeploy"
- Ton site sera live sur `https://ia-image-generator.vercel.app`

---

## Tester en local

```bash
# Installer Vercel CLI
npm install -g vercel

# Dans le dossier portfolio-ia/
vercel dev
```

Crée un fichier `.env.local` :
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
```

Le site tourne sur http://localhost:3000

---

## Ajouter au portfolio principal

Dans ton `index.html` portfolio, remplace le lien du projet :

```html
<div class="card-links">
  <a href="https://ia-image-generator.vercel.app" target="_blank">Démo</a>
  <a href="https://github.com/TON_PSEUDO/ia-image-generator" target="_blank">GitHub</a>
</div>
```

---

## Notes techniques

- La clé API reste côté serveur dans `api/generate.js` — jamais exposée au navigateur
- Les requêtes passent par `/api/generate` (Vercel serverless)
- Pas de base de données nécessaire, tout est stateless
- Gratuit sur Vercel jusqu'à 100 000 requêtes/mois
