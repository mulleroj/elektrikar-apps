/**
 * Build Script for AI Studio Builder Apps — Volt & Amper Kingdom
 * 
 * Usage: node scripts/build-exercise.js <path-to-zip>
 * 
 * This script:
 * 1. Extracts the ZIP file
 * 2. Installs dependencies
 * 3. Builds the production version
 * 4. Fixes asset paths for subdirectory deployment
 * 5. Copies output to exercises folder
 * 6. Updates manifest.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const zipPath = process.argv[2];

if (!zipPath) {
    console.log('❌ Chyba: Nezadali jste cestu k ZIP souboru\n');
    console.log('Použití: npm run add-exercise <cesta-k-zip>');
    console.log('Příklad: npm run add-exercise C:\\Downloads\\ohmuv-zakon.zip');
    process.exit(1);
}

if (!fs.existsSync(zipPath)) {
    console.log(`❌ Soubor nenalezen: ${zipPath}`);
    process.exit(1);
}

console.log('🚀 Zpracovávám aplikaci z AI Studio Builderu...\n');

const tempDir = path.join(__dirname, '..', 'temp-build');
const exercisesDir = path.join(__dirname, '..', 'exercises');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

console.log('📦 Rozbaluji ZIP soubor...');
const zip = new AdmZip(zipPath);
zip.extractAllTo(tempDir, true);

let projectDir = tempDir;
const entries = fs.readdirSync(tempDir);
if (entries.length === 1) {
    const possibleDir = path.join(tempDir, entries[0]);
    if (fs.statSync(possibleDir).isDirectory()) projectDir = possibleDir;
}

const packageJsonPath = path.join(projectDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ Chyba: ZIP neobsahuje package.json');
    fs.rmSync(tempDir, { recursive: true });
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const projectName = packageJson.name || path.basename(zipPath, '.zip');
const safeName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

console.log(`📋 Název aplikace: ${projectName}`);

console.log('📥 Instaluji závislosti (npm install)...');
try {
    execSync('npm install', { cwd: projectDir, stdio: 'pipe', timeout: 180000 });
} catch (error) {
    console.log('⚠️ Varování: Některé závislosti se nepodařilo nainstalovat');
}

const viteConfigPath = path.join(projectDir, 'vite.config.ts');
const viteConfigJsPath = path.join(projectDir, 'vite.config.js');

if (fs.existsSync(viteConfigPath)) {
    let config = fs.readFileSync(viteConfigPath, 'utf8');
    if (!config.includes("base:")) {
        config = config.replace(/export default defineConfig\(\{/, "export default defineConfig({\n  base: './',");
        fs.writeFileSync(viteConfigPath, config);
        console.log('🔧 Upravuji vite.config.ts pro relativní cesty...');
    }
} else if (fs.existsSync(viteConfigJsPath)) {
    let config = fs.readFileSync(viteConfigJsPath, 'utf8');
    if (!config.includes("base:")) {
        config = config.replace(/export default defineConfig\(\{/, "export default defineConfig({\n  base: './',");
        fs.writeFileSync(viteConfigJsPath, config);
        console.log('🔧 Upravuji vite.config.js pro relativní cesty...');
    }
}

console.log('🔨 Vytvářím produkční build...');
try {
    execSync('npm run build', { cwd: projectDir, stdio: 'pipe', timeout: 180000 });
} catch (error) {
    console.log('❌ Chyba při buildu:');
    console.log(error.message);
    fs.rmSync(tempDir, { recursive: true });
    process.exit(1);
}

const possibleBuildDirs = ['dist', 'build', 'out', '.output'];
let buildDir = null;
for (const dir of possibleBuildDirs) {
    const fullPath = path.join(projectDir, dir);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) { buildDir = fullPath; break; }
}

if (!buildDir) {
    console.log('❌ Chyba: Nenalezen výstupní adresář (dist/build)');
    fs.rmSync(tempDir, { recursive: true });
    process.exit(1);
}

const indexHtmlPath = path.join(buildDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    html = html.replace(/href="\//g, 'href="./');
    html = html.replace(/src="\//g, 'src="./');
    fs.writeFileSync(indexHtmlPath, html);
    console.log('🔧 Opravuji cesty v index.html...');
}

const targetDir = path.join(exercisesDir, safeName);
if (fs.existsSync(targetDir)) {
    console.log(`⚠️ Nahrazuji existující aplikaci: ${safeName}`);
    fs.rmSync(targetDir, { recursive: true });
}

fs.mkdirSync(targetDir, { recursive: true });
copyRecursive(buildDir, targetDir);

const metaPath = path.join(targetDir, 'meta.json');
const meta = {
    id: `built-${safeName}`,
    name: projectName,
    description: packageJson.description || 'Aplikace pro elektrikáře',
    icon: '⚡',
    created: new Date().toISOString().split('T')[0],
    folder: safeName,
    isBuilt: true
};
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

updateManifest(exercisesDir, meta);
fs.rmSync(tempDir, { recursive: true });

console.log('\n✅ Aplikace úspěšně přidána!');
console.log(`📁 Umístění: exercises/${safeName}`);
console.log(`🌐 URL: /exercises/${safeName}/index.html`);
console.log('\nPro nasazení na Netlify:');
console.log('  git add .');
console.log('  git commit -m "Přidána aplikace: ' + projectName + '"');
console.log('  git push');

function copyRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function updateManifest(exercisesDir, newExercise) {
    const manifestPath = path.join(exercisesDir, 'manifest.json');
    let manifest = { exercises: [] };
    if (fs.existsSync(manifestPath)) {
        try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (e) { manifest = { exercises: [] }; }
    }
    manifest.exercises = manifest.exercises.filter(e => e.id !== newExercise.id);
    manifest.exercises.push(newExercise);
    manifest.exercises.sort((a, b) => a.name.localeCompare(b.name));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('📋 Manifest aktualizován');
}
