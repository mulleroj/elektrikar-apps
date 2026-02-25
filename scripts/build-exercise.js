/**
 * Build Script for AI Studio Builder Apps — Volt & Amper Kingdom
 * 
 * Usage: node scripts/build-exercise.js <path-to-zip>
 * 
 * Extracts a ZIP file and copies its contents to the exercises folder.
 * Expects the ZIP to contain a pre-built static site with index.html.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipPath = process.argv[2];

if (!zipPath) {
    console.log('❌ Chyba: Nezadali jste cestu k ZIP souboru\n');
    console.log('Použití: npm run add-exercise <cesta-k-zip>');
    process.exit(1);
}

if (!fs.existsSync(zipPath)) {
    console.log(`❌ Soubor nenalezen: ${zipPath}`);
    process.exit(1);
}

console.log('🚀 Zpracovávám aplikaci...\n');

const tempDir = path.join(__dirname, '..', 'temp-build');
const exercisesDir = path.join(__dirname, '..', 'exercises');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

// Extract ZIP using system unzip (cross-platform fallback to PowerShell on Windows)
console.log('📦 Rozbaluji ZIP soubor...');
try {
    if (process.platform === 'win32') {
        execSync(`powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${tempDir}'"`, { stdio: 'pipe' });
    } else {
        execSync(`unzip -o "${zipPath}" -d "${tempDir}"`, { stdio: 'pipe' });
    }
} catch (error) {
    console.log('❌ Nepodařilo se rozbalit ZIP soubor');
    console.log(error.message);
    process.exit(1);
}

// Find the actual project root (handle ZIP with single subdirectory)
let projectDir = tempDir;
const entries = fs.readdirSync(tempDir).filter(e => !e.startsWith('.'));
if (entries.length === 1) {
    const possibleDir = path.join(tempDir, entries[0]);
    if (fs.statSync(possibleDir).isDirectory()) projectDir = possibleDir;
}

// Find index.html
if (!fs.existsSync(path.join(projectDir, 'index.html'))) {
    for (const subdir of ['dist', 'build', 'out', 'public']) {
        const checkPath = path.join(projectDir, subdir, 'index.html');
        if (fs.existsSync(checkPath)) {
            projectDir = path.join(projectDir, subdir);
            break;
        }
    }
}

if (!fs.existsSync(path.join(projectDir, 'index.html'))) {
    console.log('❌ ZIP neobsahuje index.html');
    fs.rmSync(tempDir, { recursive: true });
    process.exit(1);
}

// Validate index.html is not empty
const indexContent = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
if (indexContent.trim().length === 0) {
    console.log('❌ index.html je prázdný');
    fs.rmSync(tempDir, { recursive: true });
    process.exit(1);
}

console.log(`✅ Nalezen platný index.html (${indexContent.length} znaků)`);

// Get project name from ZIP filename
let projectName = path.basename(zipPath, '.zip').replace(/[^a-zA-Z0-9\s-]/g, '').trim();
const safeName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// Try to get a better name from package.json if it exists
const packageJsonPath = path.join(projectDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.name) projectName = pkg.name;
    } catch (e) { /* ignore */ }
}

console.log(`📋 Název: ${projectName} (${safeName})`);

// Copy to exercises folder
const targetDir = path.join(exercisesDir, safeName);
if (fs.existsSync(targetDir)) {
    console.log(`⚠️ Nahrazuji existující aplikaci: ${safeName}`);
    fs.rmSync(targetDir, { recursive: true });
}

fs.mkdirSync(targetDir, { recursive: true });
copyRecursive(projectDir, targetDir, ['node_modules', '.git', '.github', 'package-lock.json', '.env']);

// Create meta.json
const meta = {
    id: safeName,
    name: projectName,
    description: projectName.replace(/-/g, ' '),
    icon: '⚡',
    created: new Date().toISOString().split('T')[0],
    folder: safeName,
    isBuilt: true
};
fs.writeFileSync(path.join(targetDir, 'meta.json'), JSON.stringify(meta, null, 2));

// Update manifest
updateManifest(exercisesDir, meta);

// Cleanup
fs.rmSync(tempDir, { recursive: true });

console.log('\n✅ Aplikace úspěšně přidána!');
console.log(`📁 Umístění: exercises/${safeName}`);
console.log(`🌐 URL: /exercises/${safeName}/index.html`);

// === Helper functions ===

function copyRecursive(src, dest, excludes = []) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        if (excludes.includes(entry.name)) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath, excludes);
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
