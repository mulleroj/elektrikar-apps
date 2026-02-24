# ⚡ Volt & Amper Kingdom

Galerie vzdělávacích aplikací pro obor **Elektrikář**, vytvořených pomocí vibe codingu v AI Studio Builderu.

## 🚀 Jak začít

```bash
npm install
npm run dev
```

## 📦 Přidání nové aplikace

### Způsob 1: Přes web (admin)

1. Otevřete web s parametrem `?admin`
2. Zadejte GitHub token v nastavení
3. Přetáhněte ZIP soubor do upload zóny
4. GitHub Actions automaticky zpracuje aplikaci

### Způsob 2: Lokálně

```bash
npm run add-exercise cesta/k/aplikaci.zip
git add .
git commit -m "Přidána nová aplikace"
git push
```

## 📁 Struktura projektu

```
elektrikar/
├── index.html          # Hlavní stránka
├── styles/main.css     # Styly (Volt & Amper theme)
├── scripts/
│   ├── app.js          # Hlavní aplikační logika
│   └── build-exercise.js  # Build skript pro ZIP
├── exercises/          # Složka s aplikacemi
│   └── manifest.json   # Seznam aplikací
├── uploads/            # Dočasné ZIP soubory
├── pic/                # Obrázky
└── .github/workflows/  # GitHub Actions
```
