/**
 * Recovery script for Volt & Amper Kingdom
 * Ensures all exercise meta.json files and the main manifest.json are consistent.
 * This script is now integrated into the GitHub Actions workflow.
 */

const fs = require('fs');
const path = require('path');

const properNames = {
    "asynchronni-stroje": "Asynchronní stroje",
    "digitalni-elektrolaborator": "Digitální Elektrolaboratoř",
    "dioda": "Dioda: Interaktivní Průvodce",
    "elektrick-p-stroje-n-zk-ho-nap-t": "Elektrické přístroje NN",
    "elektro-prurez-master": "Výpočet průřezu vodičů",
    "hopkinsonova-laborator-v2-1": "Hopkinsonova laboratoř",
    "interaktivn-simul-tor-pojistky": "Pojistky",
    "interaktivni-vyuka-hromosvody": "Hromosvody",
    "kondenzator-lab": "Kondenzátor Lab",
    "laborator-zesilovacu": "Laboratoř zesilovačů",
    "simulace-sinusoveho-napeti": "Simulace sinusového napětí",
    "simulator-elektroinstalace-2": "Simulátor elektroinstalace",
    "synclab-v1-0": "Synchronní stroje",
    "tranzistor-jako-spinac": "Tranzistor jako spínač",
    "virtu-ln-laborka-ss-stroje": "Stejnosměrné stroje"
};

const exercisesDir = path.join(__dirname, '..', 'exercises');
const manifestPath = path.join(exercisesDir, 'manifest.json');

if (!fs.existsSync(exercisesDir)) {
    console.error('❌ Exercises directory not found!');
    process.exit(1);
}

const exerciseFolders = fs.readdirSync(exercisesDir).filter(f => {
    return fs.statSync(path.join(exercisesDir, f)).isDirectory();
});

const exercises = [];

exerciseFolders.forEach(folder => {
    const metaPath = path.join(exercisesDir, folder, 'meta.json');
    let meta = {};

    if (fs.existsSync(metaPath)) {
        try {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        } catch (e) {
            console.warn(`⚠️ Could not parse meta.json in ${folder}`);
        }
    }

    // Core fields - ensure they match the folder name
    meta.id = folder;
    meta.folder = folder;
    meta.isBuilt = true;

    // Display fields - preserve existing or use properNames/folder
    meta.name = properNames[folder] || meta.name || folder.replace(/-/g, ' ');
    if (!meta.description) meta.description = meta.name;

    // Icon logic
    if (!meta.icon || meta.icon === '⚡') {
        if (folder.includes('stroje') || folder.includes('laborka') || folder.includes('laborator')) meta.icon = '🏗️';
        else if (folder.includes('simulace') || folder.includes('simulator')) meta.icon = '⚡';
        else if (folder.includes('lab') || folder.includes('prurez')) meta.icon = '🔬';
        else meta.icon = '⚡';
    }
    
    // Ensure "Výpočet" has the measurement icon
    if ((folder.includes('elektro') || folder.includes('prurez')) && !folder.includes('simulator')) meta.icon = '🔢';
    
    // Date
    if (!meta.created) {
        meta.created = meta.updated || new Date().toISOString().split('T')[0];
    }
    delete meta.updated;

    // Save back to folder
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
    exercises.push(meta);
});

// Build and save manifest (sorted by ID for stability)
const manifest = { exercises: exercises.sort((a, b) => a.id.localeCompare(b.id)) };
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`✨ Processed ${exercises.length} exercises. Manifest updated!`);
