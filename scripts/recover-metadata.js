const fs = require('fs');
const path = require('path');

const properNames = {
    "asynchronni-stroje": "Asynchronní stroje",
    "digitalni-elektrolaborator": "Digitální Elektrolaboratoř",
    "dioda": "Dioda: Interaktivní Průvodce",
    "elektrick-p-stroje-n-zk-ho-nap-t": "Elektrické přístroje NN",
    "elektro-prurez-master": "Výpočet průřezu vodičů",
    "interaktivn-simul-tor-pojistky": "Pojistky",
    "laborator-zesilovacu": "Laboratoř zesilovačů",
    "react-example": "Simulátor Elektroinstalace",
    "synclab-v1-0": "Synchronní stroje",
    "tranzistor-jako-spinac": "Tranzistor jako spínač",
    "virtu-ln-laborka-ss-stroje": "Stejnosměrné stroje"
};

const exercisesDir = path.join(__dirname, '..', 'exercises');
const manifestPath = path.join(exercisesDir, 'manifest.json');

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
        } catch (e) {}
    }

    meta.id = meta.id || folder;
    meta.folder = meta.folder || folder;
    meta.isBuilt = true;
    meta.name = properNames[folder] || meta.name || folder;
    
    if (!meta.description) meta.description = meta.name;
    if (!meta.icon) meta.icon = (folder.includes('stroje') || folder.includes('laborka')) ? '🏗️' : '⚡';
    if (folder.includes('elektro') || folder.includes('prurez')) meta.icon = '🔢';
    
    if (!meta.created) meta.created = meta.updated || new Date().toISOString().split('T')[0];
    delete meta.updated;

    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
    exercises.push(meta);
});

const manifest = { exercises: exercises.sort((a, b) => a.name.localeCompare(b.name, 'cs')) };
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('✨ Metadata a manifest byly úspěšně opraveny s českými názvy!');
