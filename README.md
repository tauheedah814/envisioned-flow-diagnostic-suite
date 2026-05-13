# Envisioned Flow™ Diagnostic Suite

Two AI-powered assessment tools — AI Governance Readiness Assessment and Software Development Process Evaluator — built in pure HTML/JS with a shared Netlify serverless function.

---

## File Structure

```
diagnostic-suite/
├── index.html                          ← Landing page (tool selector)
├── governance/
│   └── index.html                      ← AI Governance Assessment
├── software/
│   └── index.html                      ← Software Dev Process Evaluator
├── netlify/
│   └── functions/
│       └── analyze-governance.js       ← Shared API handler (used by both tools)
├── netlify.toml                        ← Netlify build config
└── README.md
```

---

## Deploy to Netlify in 4 Steps

### 1. Push to GitHub
Create a new private GitHub repo and push this entire folder.

### 2. Connect to Netlify
- Go to app.netlify.com
- Click "Add new site" → "Import an existing project"
- Connect your GitHub repo
- Build settings are auto-detected from netlify.toml

### 3. Add your API key
In Netlify → Site configuration → Environment variables:
```
ANTHROPIC_API_KEY = sk-ant-your-key-here
```

### 4. Deploy
Netlify builds and deploys automatically. Your URLs will be:
- Landing page:   `your-site.netlify.app/`
- Governance:     `your-site.netlify.app/governance/`
- Software:       `your-site.netlify.app/software/`

---

## Custom Domain (optional)
In Netlify → Domain management → Add custom domain:
`diagnostics.envisionedflow.com`

---

## How it works
1. User completes assessment in the browser
2. On submit, answers are scored client-side and a structured prompt is built
3. Prompt is POSTed to `/.netlify/functions/analyze-governance`
4. Netlify function calls Anthropic API server-side (key never touches the browser)
5. JSON report is returned and rendered instantly

No data is stored anywhere. No backend required beyond the single serverless function.

---

## Linking from envisionedflow.com
Add a "Diagnostic Suite" link in the main site nav pointing to your deployed URL.
