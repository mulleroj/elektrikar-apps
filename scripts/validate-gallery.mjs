import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for parsing CLI arguments
const args = process.argv.slice(2);
let rootDir = process.cwd();
const rootIdx = args.indexOf('--root');
if (rootIdx !== -1 && args[rootIdx + 1]) {
    rootDir = path.resolve(args[rootIdx + 1]);
}

const exercisesDir = path.join(rootDir, 'exercises');
const manifestPath = path.join(exercisesDir, 'manifest.json');

const errors = [];
const warnings = [];
let appCount = 0;

function logError(code, message) {
    errors.push({ code, message });
    console.error(`❌ [${code}] ERROR: ${message}`);
}

function logWarning(code, message) {
    warnings.push({ code, message });
    console.warn(`⚠️ [${code}] WARNING: ${message}`);
}

// 1. Check Manifest Existence and JSON Parsing
if (!fs.existsSync(manifestPath)) {
    logError('E001', `Manifest file is missing: ${manifestPath}`);
    printSummaryAndExit();
}

let manifest = null;
try {
    const rawContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(rawContent);
} catch (err) {
    logError('E001', `Failed to parse manifest.json: ${err.message}`);
    printSummaryAndExit();
}

// 2. Validate Root Schema
if (typeof manifest !== 'object' || manifest === null || Array.isArray(manifest)) {
    logError('E001', 'Manifest root must be a JSON object.');
    printSummaryAndExit();
}

if (!('exercises' in manifest)) {
    logError('E001', 'Manifest is missing the "exercises" key.');
    printSummaryAndExit();
}

const exercises = manifest.exercises;
if (!Array.isArray(exercises)) {
    logError('E001', 'The "exercises" key must be a JSON Array.');
    printSummaryAndExit();
}

appCount = exercises.length;

// Sets to check uniqueness
const seenIds = new Set();
const seenFolders = new Set();

// Folder validation regex (lowercase, numbers, dashes, underscores)
const folderRegex = /^[a-z0-9_-]+$/;

// 3. Validate Each Exercise Entry
exercises.forEach((app, index) => {
    const appLabel = app && (app.name || app.id || app.folder || `Index ${index}`);
    
    if (typeof app !== 'object' || app === null) {
        logError('E002', `Exercise entry at index ${index} is not an object.`);
        return;
    }

    // Check mandatory fields
    const mandatoryFields = ['id', 'name', 'description', 'icon', 'folder', 'isBuilt'];
    mandatoryFields.forEach(field => {
        if (!(field in app)) {
            logError('E002', `Exercise "${appLabel}" is missing mandatory field "${field}".`);
        }
    });

    // Validate type and non-emptiness of strings
    ['id', 'name', 'description', 'icon', 'folder'].forEach(field => {
        if (field in app) {
            if (typeof app[field] !== 'string') {
                logError('E002', `Exercise "${appLabel}" field "${field}" must be a string.`);
            } else if (app[field].trim() === '') {
                logError('E002', `Exercise "${appLabel}" field "${field}" cannot be empty.`);
            }
        }
    });

    // Validate isBuilt boolean
    if ('isBuilt' in app) {
        if (typeof app.isBuilt !== 'boolean') {
            logError('E002', `Exercise "${appLabel}" field "isBuilt" must be a boolean.`);
        } else if (app.isBuilt !== true) {
            logError('E002', `Exercise "${appLabel}" field "isBuilt" must be true.`);
        }
    }

    // Validate optional/recommended fields (created date)
    if ('created' in app) {
        if (typeof app.created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(app.created)) {
            logWarning('W002', `Exercise "${appLabel}" optional field "created" should be in YYYY-MM-DD format.`);
        }
    }

    // Validate uniqueness of ID
    if (app.id) {
        if (seenIds.has(app.id)) {
            logError('E003', `Duplicate exercise ID detected: "${app.id}"`);
        } else {
            seenIds.add(app.id);
        }
    }

    // Validate folder slug format, uniqueness, and filesystem properties
    if (app.folder) {
        if (seenFolders.has(app.folder)) {
            logError('E003', `Duplicate exercise folder detected: "${app.folder}"`);
        } else {
            seenFolders.add(app.folder);
        }

        if (!folderRegex.test(app.folder)) {
            logError('E004', `Dangerous or invalid folder slug: "${app.folder}" (must match ^[a-z0-9_-]+$)`);
        } else {
            const appPath = path.join(exercisesDir, app.folder);
            
            // Check existence and verify it is not a symlink
            if (!fs.existsSync(appPath)) {
                logError('E005', `Physical folder does not exist for exercise "${appLabel}": exercises/${app.folder}/`);
            } else {
                try {
                    const dirLstat = fs.lstatSync(appPath);
                    if (dirLstat.isSymbolicLink()) {
                        logError('E005', `Symbolic link is forbidden for exercise directory: exercises/${app.folder}/`);
                    } else if (!dirLstat.isDirectory()) {
                        logError('E005', `Path is not a directory: exercises/${app.folder}/`);
                    }

                    // Check index.html existence, symlink check, type, and size
                    const indexPath = path.join(appPath, 'index.html');
                    if (!fs.existsSync(indexPath)) {
                        logError('E006', `Missing index.html in exercise folder: exercises/${app.folder}/`);
                    } else {
                        const fileLstat = fs.lstatSync(indexPath);
                        if (fileLstat.isSymbolicLink()) {
                            logError('E006', `Symbolic link is forbidden for index.html: exercises/${app.folder}/index.html`);
                        } else if (!fileLstat.isFile()) {
                            logError('E006', `Path is not a regular file: exercises/${app.folder}/index.html`);
                        } else if (fileLstat.size === 0) {
                            logError('E006', `index.html is empty: exercises/${app.folder}/index.html`);
                        }

                        // Path traversal verification using realpath
                        const realIndexPath = fs.realpathSync(indexPath);
                        const realExercisesDir = fs.realpathSync(exercisesDir);
                        if (!realIndexPath.startsWith(realExercisesDir)) {
                            logError('E004', `Path traversal detected! Resolved path "${realIndexPath}" is outside "exercises" directory.`);
                        }
                    }
                } catch (e) {
                    logError('E005', `Error verifying filesystem path: exercises/${app.folder}/ - ${e.message}`);
                }
            }
        }
    }
});

// 4. Scan for Dangling Directories (directories with index.html not registered in manifest)
try {
    if (fs.existsSync(exercisesDir)) {
        const files = fs.readdirSync(exercisesDir);
        files.forEach(file => {
            const fullPath = path.join(exercisesDir, file);
            if (fs.existsSync(fullPath)) {
                const stat = fs.lstatSync(fullPath);
                if (stat.isDirectory() && !stat.isSymbolicLink()) {
                    // Check if it's in the manifest folders
                    if (!seenFolders.has(file)) {
                        const checkIndexPath = path.join(fullPath, 'index.html');
                        if (fs.existsSync(checkIndexPath)) {
                            logWarning('W001', `Dangling exercise folder: exercises/${file}/ contains an index.html but is not registered in the manifest.`);
                        }
                    }
                }
            }
        });
    }
} catch (e) {
    logWarning('W001', `Could not scan exercises folder for dangling directories: ${e.message}`);
}

printSummaryAndExit();

function printSummaryAndExit() {
    console.log('\n=========================================');
    if (errors.length > 0) {
        console.log(`❌ FAIL: ${appCount} cvičení, ${errors.length} chyb, ${warnings.length} varování.`);
        process.exit(1);
    } else {
        console.log(`✅ PASS: ${appCount} cvičení, ${errors.length} chyb, ${warnings.length} varování.`);
        process.exit(0);
    }
}
