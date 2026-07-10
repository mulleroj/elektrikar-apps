/**
 * Core health check logic for Volt & Amper Kingdom gallery.
 * This file contains pure JS diagnostics and is fully testable in Node.js
 * using dependency injection (custom fetch, origin, and timeouts).
 */

export async function runHealthCheck({
    fetchFn,
    baseOrigin,
    timeoutMs = 8000,
    maxConcurrency = 4,
    onProgress = () => {}
}) {
    const results = {
        manifestStatus: { success: true, code: 'PASS', message: 'Manifest je v pořádku' },
        apps: [],
        systemFiles: [],
        summary: {
            totalItems: 0,
            validItems: 0,
            availableApps: 0,
            errors: 0,
            warnings: 0,
            timestamp: ''
        }
    };

    let manifestObj = null;
    let exercises = [];

    // --- STEP 1: Verify and Load Manifest ---
    try {
        const manifestUrl = new URL('exercises/manifest.json', baseOrigin);
        if (manifestUrl.origin !== new URL(baseOrigin).origin) {
            throw new Error('Cross-origin URL detected');
        }

        onProgress({ type: 'status', message: 'Načítám manifest.json...' });

        let response;
        try {
            response = await fetchWithTimeout(fetchFn, manifestUrl.toString(), timeoutMs);
        } catch (fetchErr) {
            throw { code: 'H001', message: `Manifest nelze načíst: ${fetchErr.message}` };
        }

        if (!response.ok) {
            throw { code: 'H001', message: `Manifest nelze načíst (HTTP ${response.status})` };
        }

        const text = await response.text();
        try {
            manifestObj = JSON.parse(text);
        } catch (jsonErr) {
            throw { code: 'H002', message: 'Manifest není platný JSON' };
        }

        if (!manifestObj || typeof manifestObj !== 'object' || Array.isArray(manifestObj)) {
            throw { code: 'H003', message: 'Neplatná kořenová struktura manifestu (musí být objekt)' };
        }

        if (!Array.isArray(manifestObj.exercises)) {
            throw { code: 'H003', message: 'Manifest neobsahuje pole "exercises"' };
        }

        exercises = manifestObj.exercises;
        if (exercises.length === 0) {
            throw { code: 'H003', message: 'Pole "exercises" v manifestu je prázdné' };
        }

    } catch (err) {
        results.manifestStatus = {
            success: false,
            code: err.code || 'H001',
            message: err.message || 'Neznámá chyba při načítání manifestu'
        };
        results.summary.errors++;
    }

    // --- STEP 2: Validate Schema of Manifest Items ---
    const validAppsToCheck = [];
    const seenIds = new Set();
    const seenFolders = new Set();

    if (results.manifestStatus.success) {
        results.summary.totalItems = exercises.length;

        for (const item of exercises) {
            const appResult = {
                id: item?.id || '',
                name: item?.name || '',
                folder: item?.folder || '',
                icon: item?.icon || '',
                manifestStatus: 'PASS',
                manifestMessage: '',
                indexHtmlStatus: 'PASS',
                indexHtmlMessage: '',
                overallStatus: 'PASS',
                wrapperUrl: '',
                code: '',
                message: ''
            };

            // Schema checks
            const errors = [];
            const warnings = [];

            // ID check
            if (!item?.id || typeof item.id !== 'string') {
                errors.push('Chybějící nebo neplatné ID');
            } else if (!/^[a-z0-9_-]+$/.test(item.id)) {
                errors.push(`ID "${item.id}" obsahuje nepovolené znaky (povoleno pouze a-z, 0-9, _, -)`);
            } else if (seenIds.has(item.id)) {
                errors.push(`Duplicitní ID "${item.id}"`);
                appResult.code = 'H005';
            } else {
                seenIds.add(item.id);
            }

            // Folder check
            let isFolderValid = true;
            if (!item?.folder || typeof item.folder !== 'string') {
                errors.push('Chybějící nebo neplatná složka (folder)');
                isFolderValid = false;
            } else if (!/^[a-z0-9_-]+$/.test(item.folder)) {
                errors.push(`Složka "${item.folder}" obsahuje nepovolené znaky (povoleno pouze a-z, 0-9, _, -)`);
                isFolderValid = false;
            } else if (seenFolders.has(item.folder)) {
                errors.push(`Duplicitní složka "${item.folder}"`);
                appResult.code = 'H005';
                isFolderValid = false;
            } else {
                seenFolders.add(item.folder);
            }

            // Other fields
            if (!item?.name || typeof item.name !== 'string') {
                errors.push('Chybějící nebo neplatný název (name)');
            }
            if (!item?.description || typeof item.description !== 'string') {
                errors.push('Chybějící nebo neplatný popis (description)');
            }
            if (!item?.icon || typeof item.icon !== 'string') {
                errors.push('Chybějící nebo neplatná ikona (icon)');
            }
            if (item?.isBuilt !== true) {
                errors.push('Pole isBuilt musí být boolean a mít hodnotu true');
            }

            // Created date check (Warning HW01)
            if (item?.created !== undefined) {
                if (typeof item.created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.created)) {
                    warnings.push('HW01: Datum created nemá formát YYYY-MM-DD');
                } else {
                    const parsedDate = Date.parse(item.created);
                    if (isNaN(parsedDate)) {
                        warnings.push('HW01: Datum created je neplatné');
                    }
                }
            } else {
                warnings.push('HW01: Chybí nepovinné doporučené pole created');
            }

            // Evaluate item manifest errors
            if (errors.length > 0) {
                appResult.manifestStatus = 'CHYBA';
                appResult.overallStatus = 'CHYBA';
                appResult.manifestMessage = errors.join('; ');
                if (!appResult.code) {
                    appResult.code = 'H004';
                }
                appResult.message = appResult.manifestMessage;
                results.summary.errors++;
            } else {
                results.summary.validItems++;
                // Build wrapper URL safely
                appResult.wrapperUrl = `play.html?app=${encodeURIComponent(item.folder)}`;

                // Add warnings if present and no errors
                if (warnings.length > 0) {
                    appResult.overallStatus = 'VAROVÁNÍ';
                    appResult.code = 'HW01';
                    appResult.message = warnings.join('; ');
                    results.summary.warnings++;
                }

                // If folder is valid, schedule it for index.html check
                if (isFolderValid) {
                    validAppsToCheck.push(appResult);
                }
            }

            results.apps.push(appResult);
        }
    }

    // --- STEP 3: Concurrently Validate index.html files ---
    if (validAppsToCheck.length > 0) {
        const queue = [...validAppsToCheck];
        let completed = 0;
        const total = queue.length;

        async function worker() {
            while (queue.length > 0) {
                const app = queue.shift();
                if (!app) break;

                onProgress({
                    type: 'app_progress',
                    current: ++completed,
                    total: total,
                    appName: app.name
                });

                const checkResult = await checkAppHtml(fetchFn, baseOrigin, app.folder, timeoutMs);
                if (checkResult.status === 'PASS') {
                    app.indexHtmlStatus = 'PASS';
                    results.summary.availableApps++;
                } else {
                    app.indexHtmlStatus = 'CHYBA';
                    app.overallStatus = 'CHYBA';
                    app.code = checkResult.code;
                    app.message = checkResult.message;
                    results.summary.errors++;
                    // If it previously had a warning, decrement warning count since error takes precedence
                    if (app.code !== 'HW01' && itemHasWarning(app)) {
                        results.summary.warnings--;
                    }
                }
            }
        }

        const workers = Array.from(
            { length: Math.min(maxConcurrency, queue.length) },
            () => worker()
        );
        await Promise.all(workers);
    }

    // Helper to see if app details had warning before
    function itemHasWarning(app) {
        const item = exercises.find(x => x.id === app.id);
        return item && (item.created === undefined || typeof item.created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.created) || isNaN(Date.parse(item.created)));
    }

    // --- STEP 4: Validate System Files ---
    onProgress({ type: 'status', message: 'Kontroluji systémové soubory...' });
    const systemChecks = [
        { name: 'play.html', errorCode: 'H009', warnCode: '', severity: 'CHYBA' },
        { name: 'robots.txt', errorCode: '', warnCode: 'HW02', severity: 'VAROVÁNÍ' },
        { name: 'sitemap.xml', errorCode: '', warnCode: 'HW03', severity: 'VAROVÁNÍ' }
    ];

    const sysResults = await Promise.all(
        systemChecks.map(async (sys) => {
            const url = new URL(sys.name, baseOrigin).toString();
            try {
                const response = await fetchWithTimeout(fetchFn, url, timeoutMs);
                if (!response.ok) {
                    return {
                        name: sys.name,
                        status: sys.severity,
                        code: sys.errorCode || sys.warnCode,
                        message: `Soubor nedostupný (HTTP ${response.status})`
                    };
                }
                const text = await response.text();
                if (text.trim().length === 0) {
                    return {
                        name: sys.name,
                        status: sys.severity,
                        code: sys.errorCode || sys.warnCode,
                        message: 'Soubor je prázdný'
                    };
                }
                return { name: sys.name, status: 'PASS', code: '', message: '' };
            } catch (err) {
                return {
                    name: sys.name,
                    status: sys.severity,
                    code: sys.errorCode || sys.warnCode,
                    message: `Chyba sítě: ${err.message}`
                };
            }
        })
    );

    for (const sysRes of sysResults) {
        if (sysRes.status !== 'PASS') {
            if (sysRes.status === 'CHYBA') {
                results.summary.errors++;
            } else {
                results.summary.warnings++;
            }
        }
        results.systemFiles.push(sysRes);
    }

    // Finalize summary timestamp
    const now = new Date();
    results.summary.timestamp = now.toLocaleString('cs-CZ');

    return results;
}

// --- HELPER FUNCTIONS ---

async function fetchWithTimeout(fetchFn, url, timeoutMs) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchFn(url, {
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

async function checkAppHtml(fetchFn, baseOrigin, folder, timeoutMs) {
    const url = new URL(`exercises/${folder}/index.html`, baseOrigin);
    if (url.origin !== new URL(baseOrigin).origin) {
        return { status: 'CHYBA', code: 'H006', message: 'Detekován pokus o cross-origin přístup' };
    }

    try {
        const response = await fetchWithTimeout(fetchFn, url.toString(), timeoutMs);
        if (!response.ok) {
            return {
                status: 'CHYBA',
                code: 'H006',
                message: `Soubor index.html nedostupný (HTTP ${response.status})`
            };
        }
        const text = await response.text();
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            return {
                status: 'CHYBA',
                code: 'H007',
                message: 'Soubor index.html je prázdný'
            };
        }

        const sliceText = trimmed.slice(0, 5000).toLowerCase();
        if (!sliceText.includes('<!doctype html') && !sliceText.includes('<html')) {
            return {
                status: 'CHYBA',
                code: 'H007',
                message: 'Soubor index.html neobsahuje platný HTML dokument (chybí <!doctype html> nebo <html>)'
            };
        }

        return { status: 'PASS' };
    } catch (err) {
        if (err.name === 'AbortError') {
            return {
                status: 'CHYBA',
                code: 'H008',
                message: `Timeout požadavku (překročeno ${timeoutMs / 1000}s)`
            };
        }
        return {
            status: 'CHYBA',
            code: 'H006',
            message: `Chyba sítě při načítání: ${err.message}`
        };
    }
}
