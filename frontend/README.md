# Frontend

React-Dashboard fuer taupunkt-lueftung.

## Einrichtung

### 1. Abhängigkeiten installieren
```bash
cd frontend
npm install
```

### 2. Umgebungsvariablen setzen
`.env.local` im `frontend/` Ordner anlegen:
```
VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
VITE_SUPABASE_KEY=dein-anon-public-key
```
Beide Werte findest du in: Supabase Dashboard -> Settings -> API

### 3. Lokal starten
```bash
npm run dev
```
Browser: http://localhost:5173

### 4. Auf GitHub Pages deployen
```bash
npm run deploy
```
Danach in GitHub: Settings -> Pages -> Branch: `gh-pages` -> Save

Bei jedem weiteren Update:
```bash
git add .
git commit -m "Update"
git push
npm run deploy
```
