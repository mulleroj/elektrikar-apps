/**
 * Build Script for AI Studio Builder Apps — Volt & Amper Kingdom
 * 
 * Usage: node scripts/build-exercise.js <path-to-zip>
 * 
 * Supports:
 * A) Node.js projects with package.json + build script → npm install + npm run build
 * B) Static HTML projects (just index.html) → copy as-is
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

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

console.log('🚀 Zpracovávám aplikaci z AI Studio Builderu...\n');

const tempDir = path.join(__dirname, '..', 'temp-build');
const exercisesDir = path.join(__dirname, '..', 'exercises');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

console.log('📦 Rozbaluji ZIP soubor...');
const zip = new AdmZip(zipPath);
zip.extractAllTo(tempDir, true);

// Find the actual project root (handle ZIP with single subdirectory)
let projectDir = tempDir;
const entries = fs.readdirSync(tempDir).filter(e => !e.startsWith('.'));
if (entries.length === 1) {
    const possibleDir = path.join(tempDir, entries[0]);
    if (fs.statSync(possibleDir).isDirectory()) projectDir = possibleDir;
}

// Determine project type and name
const packageJsonPath = path.join(projectDir, 'package.json');
const hasPackageJson = fs.existsSync(packageJsonPath);
const hasIndexHtml = fs.existsSync(path.join(projectDir, 'index.html'));

let projectName = path.basename(zipPath, '.zip').replace(/[^a-zA-Z0-9\s-]/g, '').trim();
let packageJson = {};

if (hasPackageJson) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    projectName = packageJson.name || projectName;
}

const safeName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
console.log(`📋 Název aplikace: ${projectName} (${safeName})`);

let outputDir = null;

if (hasPackageJson && packageJson.scripts && packageJson.scripts.build) {
    // === PATH A: Node.js project with build script ===
    console.log('🔧 Detekován Node.js projekt s build scriptem');

    console.log('📥 Instaluji závislosti (npm install)...');
    try {
        execSync('npm install', { cwd: projectDir, stdio: 'pipe', timeout: 180000 });
        console.log('✅ Závislosti nainstalovány');
    } catch (error) {
        console.log('⚠️ Varování: Některé závislosti se nepodařilo nainstalovat');
    }

    // Patch vite config for relative paths
    for (const configFile of ['vite.config.ts', 'vite.config.js', 'vite.config.mjs']) {
        const configPath = path.join(projectDir, configFile);
        if (fs.existsSync(configPath)) {
            let config = fs.readFileSync(configPath, 'utf8');
            if (!config.includes("base:") && !config.includes("base :")) {
                config = config.replace(
                    /export default defineConfig\(\{/,
                    "export default defineConfig({\n  base: './',"
                );
                fs.writeFileSync(configPath, config);
                console.log(`🔧 Upravuji ${configFile} pro relativní cesty...`);
            }
            break;
        }
    }

    console.log('🔨 Vytvářím produkční build...');
    try {
        execSync('npm run build', { cwd: projectDir, stdio: 'pipe', timeout: 300000 });
        console.log('✅ Build úspěšný');
    } catch (error) {
        console.log('⚠️ Build selhal, zkouším použít zdrojové soubory...');
        // Fallback: if build fails but index.html exists, use as static
        if (hasIndexHtml) {
            outputDir = projectDir;
        } else {
            console.log('❌ Build selhal a nebyl nalezen index.html');
            fs.rmSync(tempDir, { recursive: true });
            process.exit(1);
        }
    }

    if (!outputDir) {
        // Find build output directory
        const possibleBuildDirs = ['dist', 'build', 'out', '.output', 'public'];
        for (const dir of possibleBuildDirs) {
            const fullPath = path.join(projectDir, dir);
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
                // Make sure the directory has an index.html
                if (fs.existsSync(path.join(fullPath, 'index.html'))) {
                    outputDir = fullPath;
                    break;
                }
            }
        }

        if (!outputDir) {
            // Try using project dir itself if it has index.html
            if (hasIndexHtml) {
                console.log('⚠️ Nenalezen výstupní adresář, používám zdrojové soubory');
                outputDir = projectDir;
            } else {
                console.log('❌ Nenalezen výstupní adresář s index.html');
                fs.rmSync(tempDir, { recursive: true });
                process.exit(1);
            }
        }
    }

} else if (hasIndexHtml) {
    // === PATH B: Static HTML project ===
    console.log('📄 Detekován statický HTML projekt (žádný build potřeba)');
    outputDir = projectDir;

} else if (hasPackageJson) {
    // Has package.json but no build script — try if there's an index.html somewhere
    console.log('📦 Package.json bez build scriptu');
    if (hasIndexHtml) {
        outputDir = projectDir;
    } else {
        // Check if there's a public or src directory with index.html
        for (const dir of ['public', 'src', 'dist', 'build']) {
            const checkPath = path.join(projectDir, dir, 'index.html');
            if (fs.existsSync(checkPath)) {
                outputDir = path.join(projectDir, dir);
                break;
            }
        }
        if (!outputDir) {
            console.log('❌ Nelze najít index.html v projektu');
            fs.rmSync(tempDir, { recursive: true });
            process.exit(1);
        }
    }

} else {
    console.log('❌ ZIP neobsahuje ani package.json ani index.html');
    fs.rmSync(tempDir, { recursive: true });
    process.exit(1);
}

// Fix asset paths in index.html
const indexHtmlPath = path.join(outputDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    html = html.replace(/href="\//g, 'href="./');
    html = html.replace(/src="\//g, 'src="./');
    fs.writeFileSync(indexHtmlPath, html);
    console.log('🔧 Opravuji cesty v index.html...');
}

// Copy to exercises folder
const targetDir = path.join(exercisesDir, safeName);
if (fs.existsSync(targetDir)) {
    console.log(`⚠️ Nahrazuji existující aplikaci: ${safeName}`);
    fs.rmSync(targetDir, { recursive: true });
}

fs.mkdirSync(targetDir, { recursive: true });

// Filter out node_modules and other unnecessary files
copyRecursive(outputDir, targetDir, ['node_modules', '.git', '.github', 'temp-build']);

// Create meta.json
const meta = {
    id: `built-${safeName}`,
    name: projectName,
    description: packageJson.description || 'Aplikace pro elektrikáře',
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
