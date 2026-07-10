import { runHealthCheck } from './admin-health-core.mjs';

let currentRunId = null;

export function initAdminHealth() {
    const panel = document.getElementById('healthCheckPanel');
    if (!panel) return;

    panel.hidden = false;
    panel.setAttribute('aria-labelledby', 'healthCheckTitle');
    while (panel.firstChild) panel.removeChild(panel.firstChild);

    // Title & Header
    const header = document.createElement('div');
    header.className = 'health-check-header';

    const icon = document.createElement('span');
    icon.className = 'health-check-icon';
    icon.textContent = '🔍';

    const title = document.createElement('h3');
    title.id = 'healthCheckTitle';
    title.textContent = 'Kontrola zdraví galerie';

    header.appendChild(icon);
    header.appendChild(title);
    panel.appendChild(header);

    // Description
    const desc = document.createElement('p');
    desc.className = 'health-check-description';
    desc.textContent = 'Tato kontrola ověřuje dostupnost produkčního webu. Integritu repozitáře a uploadů hlídá GitHub Actions.';
    panel.appendChild(desc);

    // Run Button
    const runBtn = document.createElement('button');
    runBtn.className = 'btn btn-secondary health-check-btn';
    runBtn.id = 'runHealthCheck';
    runBtn.textContent = '🔍 Zkontrolovat galerii';
    panel.appendChild(runBtn);

    // Progress Container
    const progressContainer = document.createElement('div');
    progressContainer.id = 'healthCheckProgress';
    progressContainer.className = 'health-check-progress hidden';

    const progressBar = document.createElement('progress');
    progressBar.id = 'healthCheckProgressFill';
    progressBar.max = 100;
    progressBar.value = 0;

    const progressText = document.createElement('p');
    progressText.id = 'healthCheckProgressText';
    progressText.textContent = 'Připravuji kontrolu...';

    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    panel.appendChild(progressContainer);

    // Screen Reader Live Region
    const liveRegion = document.createElement('div');
    liveRegion.id = 'healthCheckLive';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    panel.appendChild(liveRegion);

    // Summary Result Container
    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'healthCheckSummary';
    summaryContainer.className = 'health-check-summary hidden';
    panel.appendChild(summaryContainer);

    // Details Grid/Table Container
    const detailsContainer = document.createElement('div');
    detailsContainer.id = 'healthCheckDetails';
    detailsContainer.className = 'health-check-details hidden';
    panel.appendChild(detailsContainer);

    // Action listener
    runBtn.addEventListener('click', () => startGalleryCheck(runBtn, progressContainer, progressBar, progressText, liveRegion, summaryContainer, detailsContainer));
}

async function startGalleryCheck(runBtn, progressContainer, progressBar, progressText, liveRegion, summaryContainer, detailsContainer) {
    const panel = document.getElementById('healthCheckPanel');
    const runId = Date.now();
    currentRunId = runId;

    // UI state change to active
    runBtn.disabled = true;
    panel.setAttribute('aria-busy', 'true');

    progressContainer.classList.remove('hidden');
    progressBar.value = 0;
    progressBar.removeAttribute('value'); // indeterminate state initially
    progressText.textContent = 'Navazuji spojení s manifestem...';
    liveRegion.textContent = 'Kontrola galerie byla spuštěna.';

    summaryContainer.classList.add('hidden');
    detailsContainer.classList.add('hidden');
    summaryContainer.innerHTML = '';
    detailsContainer.innerHTML = '';

    try {
        const results = await runHealthCheck({
            fetchFn: window.fetch.bind(window),
            baseOrigin: window.location.origin,
            timeoutMs: 8000,
            maxConcurrency: 4,
            onProgress: (progress) => {
                if (currentRunId !== runId) return; // Stale check run

                if (progress.type === 'status') {
                    progressText.textContent = progress.message;
                    liveRegion.textContent = progress.message;
                } else if (progress.type === 'app_progress') {
                    progressBar.value = Math.round((progress.current / progress.total) * 100);
                    const msg = `Kontroluji aplikaci ${progress.current} z ${progress.total}: ${progress.appName}`;
                    progressText.textContent = msg;
                    // Limit live region noise: only notify screen reader on every 4th app or first/last
                    if (progress.current === 1 || progress.current === progress.total || progress.current % 4 === 0) {
                        liveRegion.textContent = msg;
                    }
                }
            }
        });

        if (currentRunId !== runId) return; // Abort if newer run has started

        // Reset state
        panel.setAttribute('aria-busy', 'false');
        runBtn.disabled = false;
        runBtn.textContent = '🔄 Zkontrolovat znovu';
        progressContainer.classList.add('hidden');

        // Announce completion
        const outcomeMsg = `Kontrola dokončena. Nalezeno ${results.summary.errors} chyb a ${results.summary.warnings} varování.`;
        liveRegion.textContent = outcomeMsg;

        // Render outcomes
        renderSummary(summaryContainer, results);
        renderDetails(detailsContainer, results);

    } catch (err) {
        if (currentRunId !== runId) return;
        panel.setAttribute('aria-busy', 'false');
        runBtn.disabled = false;
        progressContainer.classList.add('hidden');

        const errMsg = `Neočekávaná chyba při diagnostice: ${err.message}`;
        liveRegion.textContent = errMsg;

        progressText.textContent = errMsg;
        progressContainer.classList.remove('hidden');
    }
}

function renderSummary(container, results) {
    container.classList.remove('hidden');

    const title = document.createElement('h4');
    title.textContent = 'Výsledek kontroly';
    container.appendChild(title);

    const statsGrid = document.createElement('div');
    statsGrid.className = 'health-stats-grid';

    const createStat = (label, value, isBad, isWarn, isGood) => {
        const item = document.createElement('div');
        item.className = 'health-stat-item';

        const textLabel = document.createElement('span');
        textLabel.className = 'health-stat-label';
        textLabel.textContent = label;

        const textVal = document.createElement('strong');
        textVal.className = 'health-stat-value';
        if (isBad) textVal.classList.add('text-danger');
        if (isWarn) textVal.classList.add('text-warning');
        if (isGood) textVal.classList.add('text-success');
        textVal.textContent = value;

        item.appendChild(textLabel);
        item.appendChild(textVal);
        return item;
    };

    statsGrid.appendChild(createStat('Celkem v manifestu:', results.summary.totalItems));
    statsGrid.appendChild(createStat('Bez chyb manifestu:', results.summary.validItems, false, false, results.summary.validItems > 0));
    statsGrid.appendChild(createStat('Dostupných (HTML):', results.summary.availableApps, false, false, results.summary.availableApps > 0));
    statsGrid.appendChild(createStat('Chyby celkem:', results.summary.errors, results.summary.errors > 0));
    statsGrid.appendChild(createStat('Varování celkem:', results.summary.warnings, false, results.summary.warnings > 0));

    container.appendChild(statsGrid);

    const timestamp = document.createElement('p');
    timestamp.className = 'health-check-timestamp';
    timestamp.textContent = `Kontrola dokončena: ${results.summary.timestamp}`;
    container.appendChild(timestamp);
}

function renderDetails(container, results) {
    container.classList.remove('hidden');

    // 1. System files table/list
    const sysSection = document.createElement('div');
    sysSection.className = 'health-system-section';

    const sysTitle = document.createElement('h4');
    sysTitle.textContent = 'Systémové soubory';
    sysSection.appendChild(sysTitle);

    const sysTable = document.createElement('table');
    sysTable.className = 'health-table';

    const sysThead = document.createElement('thead');
    const sysTheadRow = document.createElement('tr');
    for (const label of ['Soubor', 'Stav', 'Detail zprávy']) {
        const th = document.createElement('th');
        th.textContent = label;
        sysTheadRow.appendChild(th);
    }
    sysThead.appendChild(sysTheadRow);
    sysTable.appendChild(sysThead);

    const sysTbody = document.createElement('tbody');
    for (const sys of results.systemFiles) {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.className = 'health-font-mono';
        tdName.textContent = sys.name;

        const tdStatus = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `health-badge badge-${sys.status.toLowerCase()}`;
        badge.textContent = sys.status;
        tdStatus.appendChild(badge);

        const tdMsg = document.createElement('td');
        if (sys.code) {
            const codeSpan = document.createElement('strong');
            codeSpan.className = 'health-code-label';
            codeSpan.textContent = `[${sys.code}] `;
            tdMsg.appendChild(codeSpan);
        }
        const textSpan = document.createElement('span');
        textSpan.textContent = sys.message || 'Bez chyb';
        tdMsg.appendChild(textSpan);

        tr.appendChild(tdName);
        tr.appendChild(tdStatus);
        tr.appendChild(tdMsg);
        sysTbody.appendChild(tr);
    }
    sysTable.appendChild(sysTbody);
    sysSection.appendChild(sysTable);
    container.appendChild(sysSection);

    // 2. Apps section
    const appsSection = document.createElement('div');
    appsSection.className = 'health-apps-section';

    const appsTitle = document.createElement('h4');
    appsTitle.textContent = 'Stav jednotlivých cvičení';

    // Build apps table
    const appsTable = document.createElement('table');
    appsTable.className = 'health-table';

    const appsThead = document.createElement('thead');
    const appsTheadRow = document.createElement('tr');
    for (const label of ['Název', 'Složka', 'Manifest', 'index.html', 'Celkový stav', 'Odkaz']) {
        const th = document.createElement('th');
        th.textContent = label;
        appsTheadRow.appendChild(th);
    }
    appsThead.appendChild(appsTheadRow);
    appsTable.appendChild(appsThead);

    const appsTbody = document.createElement('tbody');

    // If manifest had fatal load error
    if (!results.manifestStatus.success) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'text-danger text-center';

        const codeSpan = document.createElement('strong');
        codeSpan.textContent = `[${results.manifestStatus.code}] `;

        const textSpan = document.createElement('span');
        textSpan.textContent = results.manifestStatus.message;

        td.appendChild(codeSpan);
        td.appendChild(textSpan);
        tr.appendChild(td);
        appsTbody.appendChild(tr);
    } else {
        for (const app of results.apps) {
            const tr = document.createElement('tr');

            // Name / Icon
            const tdName = document.createElement('td');
            const iconSpan = document.createElement('span');
            iconSpan.className = 'app-table-icon';
            iconSpan.textContent = app.icon || '⚡';
            const nameSpan = document.createElement('span');
            nameSpan.className = 'app-table-name';
            nameSpan.textContent = app.name || '(Neznámý)';
            tdName.appendChild(iconSpan);
            tdName.appendChild(nameSpan);

            // Folder
            const tdFolder = document.createElement('td');
            tdFolder.className = 'health-font-mono';
            tdFolder.textContent = app.folder || '(Chybí)';

            // Manifest status
            const tdManifest = document.createElement('td');
            if (app.manifestStatus === 'PASS') {
                const badge = document.createElement('span');
                badge.className = 'health-badge badge-pass';
                badge.textContent = 'PASS';
                tdManifest.appendChild(badge);
            } else {
                const badge = document.createElement('span');
                badge.className = 'health-badge badge-chyba';
                badge.textContent = 'CHYBA';
                tdManifest.appendChild(badge);

                const msgDiv = document.createElement('div');
                msgDiv.className = 'health-table-error-desc';
                msgDiv.textContent = app.manifestMessage;
                tdManifest.appendChild(msgDiv);
            }

            // index.html status
            const tdHtml = document.createElement('td');
            if (app.manifestStatus !== 'PASS') {
                tdHtml.textContent = '–';
            } else if (app.indexHtmlStatus === 'PASS') {
                const badge = document.createElement('span');
                badge.className = 'health-badge badge-pass';
                badge.textContent = 'PASS';
                tdHtml.appendChild(badge);
            } else {
                const badge = document.createElement('span');
                badge.className = 'health-badge badge-chyba';
                badge.textContent = 'CHYBA';
                tdHtml.appendChild(badge);

                const msgDiv = document.createElement('div');
                msgDiv.className = 'health-table-error-desc';
                msgDiv.textContent = app.indexHtmlMessage;
                tdHtml.appendChild(msgDiv);
            }

            // Overall status
            const tdOverall = document.createElement('td');
            const overallBadge = document.createElement('span');
            overallBadge.className = `health-badge badge-${app.overallStatus.toLowerCase()}`;
            overallBadge.textContent = app.overallStatus;
            tdOverall.appendChild(overallBadge);

            if (app.overallStatus !== 'PASS') {
                const codeSpan = document.createElement('div');
                codeSpan.className = 'health-table-error-desc';

                const boldCode = document.createElement('strong');
                boldCode.textContent = `[${app.code}] `;
                const textSpan = document.createElement('span');
                textSpan.textContent = app.message;

                codeSpan.appendChild(boldCode);
                codeSpan.appendChild(textSpan);
                tdOverall.appendChild(codeSpan);
            }

            // Wrapper link
            const tdLink = document.createElement('td');
            if (app.wrapperUrl) {
                const a = document.createElement('a');
                a.href = app.wrapperUrl;
                a.target = '_blank';
                a.className = 'health-link';
                a.textContent = 'Otevřít ↗';
                tdLink.appendChild(a);
            } else {
                tdLink.textContent = '–';
            }

            tr.appendChild(tdName);
            tr.appendChild(tdFolder);
            tr.appendChild(tdManifest);
            tr.appendChild(tdHtml);
            tr.appendChild(tdOverall);
            tr.appendChild(tdLink);
            appsTbody.appendChild(tr);
        }
    }
    appsTable.appendChild(appsTbody);

    // Collapsible logic: wrap details in <details> if there are no errors
    if (results.summary.errors === 0) {
        const detailsEl = document.createElement('details');
        detailsEl.className = 'health-details-collapse';

        const summaryEl = document.createElement('summary');
        summaryEl.textContent = 'Zobrazit detailní výpis aplikací (Všechny aplikace jsou PASS)';

        detailsEl.appendChild(summaryEl);
        detailsEl.appendChild(appsTable);

        appsSection.appendChild(appsTitle);
        appsSection.appendChild(detailsEl);
    } else {
        appsSection.appendChild(appsTitle);
        appsSection.appendChild(appsTable);
    }

    container.appendChild(appsSection);
}
