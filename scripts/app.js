/**
 * Volt & Amper Kingdom - Aplikace pro elektrikáře
 * Main Application Logic
 * Supports:
 * 1. Built apps from exercises/ folder (production)
 * 2. ZIP upload to GitHub via API (web-based workflow)
 */

// ===== Configuration =====
const CONFIG = {
    storageKey: 'elektrikar-repository',
    githubSettingsKey: 'elektrikar-github-settings',
    exercisesFolder: 'exercises',
    exercisesManifest: 'exercises/manifest.json',
    uploadsFolder: 'uploads'
};

// ===== State =====
let exercises = [];
let builtExercises = [];
let isAdmin = false;
let githubSettings = {
    token: '',
    repo: 'mulleroj/elektrikar-apps'
};

// ===== DOM Elements =====
const elements = {
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    uploadProgress: document.getElementById('uploadProgress'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    exercisesGrid: document.getElementById('exercisesGrid'),
    emptyState: document.getElementById('emptyState'),
    modal: document.getElementById('exerciseModal'),
    modalClose: document.getElementById('modalClose'),
    exerciseFrame: document.getElementById('exerciseFrame'),
    githubToken: document.getElementById('githubToken'),
    githubRepo: document.getElementById('githubRepo'),
    saveSettings: document.getElementById('saveSettings')
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
    isAdmin = new URLSearchParams(window.location.search).has('admin');
    if (isAdmin) {
        const uploadSection = document.getElementById('upload');
        const howToSection = document.getElementById('how-to');
        const adminNavLink = document.getElementById('adminNavLink');
        if (uploadSection) uploadSection.hidden = false;
        if (howToSection) howToSection.hidden = false;
        if (adminNavLink) adminNavLink.hidden = false;
    }

    loadGitHubSettings();
    initUploadZone();
    initModal();
    initSettingsForm();
    await loadBuiltExercises();
    renderExercises();
});

// ===== GitHub Settings =====
function loadGitHubSettings() {
    try {
        const saved = localStorage.getItem(CONFIG.githubSettingsKey);
        if (saved) {
            githubSettings = JSON.parse(saved);
            if (elements.githubToken) elements.githubToken.value = githubSettings.token || '';
            if (elements.githubRepo) elements.githubRepo.value = githubSettings.repo || 'mulleroj/elektrikar-apps';
        }
    } catch (e) {
        console.warn('Could not load GitHub settings:', e);
    }
}

function saveGitHubSettings() {
    githubSettings = {
        token: elements.githubToken?.value || '',
        repo: elements.githubRepo?.value || 'mulleroj/elektrikar-apps'
    };
    localStorage.setItem(CONFIG.githubSettingsKey, JSON.stringify(githubSettings));
    showNotification('Nastavení uloženo!', 'success');
}

function initSettingsForm() {
    if (elements.saveSettings) {
        elements.saveSettings.addEventListener('click', saveGitHubSettings);
    }
}

// ===== Load Built Exercises =====
async function loadBuiltExercises() {
    try {
        const response = await fetch(CONFIG.exercisesManifest);
        if (response.ok) {
            const manifest = await response.json();
            builtExercises = manifest.exercises || [];
        }
    } catch (e) {
        builtExercises = await scanExercisesFolder();
    }
}

async function scanExercisesFolder() {
    const exercises = [];
    try {
        const response = await fetch('exercises/');
        if (!response.ok) return exercises;
        const html = await response.text();
        const folderMatches = html.match(/href="([^"]+)\/"/g) || [];
        for (const match of folderMatches) {
            const folderName = match.replace(/href="|\/"/g, '');
            if (folderName && !folderName.startsWith('.')) {
                try {
                    const metaResponse = await fetch(`exercises/${folderName}/meta.json`);
                    if (metaResponse.ok) {
                        const meta = await metaResponse.json();
                        exercises.push({
                            id: `built-${folderName}`,
                            name: meta.name || folderName,
                            description: meta.description || 'Aplikace pro elektrikáře',
                            icon: meta.icon || '⚡',
                            folder: folderName,
                            isBuilt: true
                        });
                    } else {
                        const indexResponse = await fetch(`exercises/${folderName}/index.html`, { method: 'HEAD' });
                        if (indexResponse.ok) {
                            exercises.push({
                                id: `built-${folderName}`,
                                name: folderName.replace(/-/g, ' '),
                                description: 'Aplikace pro elektrikáře',
                                icon: '⚡',
                                folder: folderName,
                                isBuilt: true
                            });
                        }
                    }
                } catch (e) {
                    console.warn(`Could not load app: ${folderName}`, e);
                }
            }
        }
    } catch (e) {
        console.warn('Could not scan exercises folder:', e);
    }
    return exercises;
}

// ===== Upload Zone =====
function initUploadZone() {
    const { uploadZone, fileInput } = elements;
    if (!uploadZone || !fileInput) return;

    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
    });
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.zip')) {
            handleFileUpload(file);
        } else {
            showNotification('Prosím nahrajte ZIP soubor', 'error');
        }
    });
}

// ===== File Upload Handler =====
async function handleFileUpload(file) {
    const { uploadProgress, progressFill, progressText } = elements;
    if (!githubSettings.token) {
        showNotification('Nejdříve zadejte GitHub token v nastavení výše', 'error');
        return;
    }
    if (!githubSettings.repo) {
        showNotification('Nejdříve zadejte GitHub repozitář v nastavení výše', 'error');
        return;
    }

    uploadProgress.hidden = false;
    progressText.textContent = 'Připravuji soubor...';
    progressFill.style.width = '20%';

    try {
        const base64Content = await fileToBase64(file);
        progressText.textContent = 'Nahrávám na GitHub...';
        progressFill.style.width = '50%';

        const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
        const path = `uploads/${fileName}`;
        const result = await uploadToGitHub(path, base64Content, `📦 Upload: ${file.name}`);

        if (result.success) {
            progressText.textContent = 'Úspěšně nahráno! GitHub Actions zpracovává...';
            progressFill.style.width = '100%';
            showNotification('✅ ZIP nahrán na GitHub! Za ~2 minuty bude aplikace dostupná.', 'success');
            setTimeout(() => { uploadProgress.hidden = true; progressFill.style.width = '0%'; }, 5000);
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        progressText.textContent = 'Chyba při nahrávání';
        progressFill.style.width = '0%';

        let errorMessage = 'Nahrávání selhalo: ';
        if (error.message.includes('401')) errorMessage += 'Neplatný GitHub token';
        else if (error.message.includes('404')) errorMessage += 'Repozitář nenalezen';
        else if (error.message.includes('422')) errorMessage += 'Soubor již existuje';
        else errorMessage += error.message;

        showNotification(errorMessage, 'error');
        setTimeout(() => { uploadProgress.hidden = true; }, 3000);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function uploadToGitHub(path, base64Content, message) {
    const [owner, repo] = githubSettings.repo.split('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubSettings.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({ message, content: base64Content })
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== Exercise Management =====
function renderExercises() {
    const { exercisesGrid, emptyState } = elements;
    if (!exercisesGrid || !emptyState) return;

    const allExercises = [...builtExercises];
    if (allExercises.length === 0) {
        exercisesGrid.innerHTML = '';
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;
    exercisesGrid.innerHTML = allExercises.map(exercise => `
        <article class="exercise-card" data-id="${exercise.id}">
            <div class="exercise-preview">${exercise.icon}</div>
            <div class="exercise-info">
                <h3 class="exercise-title">${escapeHtml(exercise.name)}</h3>
                <p class="exercise-description">${escapeHtml(exercise.description)}</p>
                <div class="exercise-actions">
                    <button class="btn btn-primary" onclick="launchExercise('${exercise.id}')">
                        ▶️ Spustit
                    </button>
                    ${isAdmin ? `
                    <button class="btn btn-secondary btn-sm" onclick="editExercise('${exercise.id}')">
                        ✏️ Upravit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteExercise('${exercise.id}')">
                        🗑️ Smazat
                    </button>` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

function launchExercise(id) {
    const exercise = builtExercises.find(e => e.id === id);
    if (!exercise) return;
    if (exercise.isBuilt) {
        window.open(`exercises/${exercise.folder}/`, '_blank');
    }
}

// ===== Modal =====
function initModal() {
    const { modal, modalClose } = elements;
    if (!modal || !modalClose) return;
    modalClose.addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
}

function closeModal() {
    elements.modal.hidden = true;
    elements.exerciseFrame.src = '';
    document.body.style.overflow = '';
}

// ===== Utilities =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">✕</button>`;

    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification { position: fixed; bottom: 24px; right: 24px; padding: 16px 24px; border-radius: 8px; background: #0f1f36; border: 1px solid #1c3354; color: #f0f6ff; display: flex; align-items: center; gap: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); z-index: 2000; animation: slideIn 0.3s ease; max-width: 400px; }
            .notification-success { border-color: #f59e0b; }
            .notification-error { border-color: #ef4444; }
            .notification-info { border-color: #06b6d4; }
            .notification button { background: none; border: none; color: #8ba3c4; cursor: pointer; font-size: 1rem; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        document.head.appendChild(style);
    }
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// ===== Delete Exercise =====
function deleteExercise(id) {
    const exercise = builtExercises.find(e => e.id === id);
    if (!exercise) return;
    if (!githubSettings.token) {
        showNotification('Nejdříve zadejte GitHub token v nastavení výše', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="confirm-modal-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="confirm-modal-content">
            <div class="confirm-icon">🗑️</div>
            <h3>Smazat aplikaci?</h3>
            <p>Opravdu chcete smazat <strong>${escapeHtml(exercise.name)}</strong>?</p>
            <p class="confirm-warning">Tato akce je nevratná!</p>
            <div class="confirm-actions">
                <button class="btn btn-secondary" onclick="this.closest('.confirm-modal').remove()">Zrušit</button>
                <button class="btn btn-danger" onclick="confirmDelete('${exercise.id}'); this.closest('.confirm-modal').remove();">🗑️ Smazat</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function confirmDelete(id) {
    const exercise = builtExercises.find(e => e.id === id);
    if (!exercise) return;
    showNotification('Mažu aplikaci...', 'info');
    try {
        const folderPath = `exercises/${exercise.folder}`;
        const success = await deleteFromGitHub(folderPath);
        if (success) {
            builtExercises = builtExercises.filter(e => e.id !== id);
            await updateManifest();
            renderExercises();
            showNotification(`✅ Aplikace "${exercise.name}" byla smazána!`, 'success');
        } else {
            showNotification('Nepodařilo se smazat aplikaci', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification(`Chyba při mazání: ${error.message}`, 'error');
    }
}

async function deleteFromGitHub(folderPath) {
    const [owner, repo] = githubSettings.repo.split('/');
    try {
        const listUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;
        const listResponse = await fetch(listUrl, {
            headers: { 'Authorization': `Bearer ${githubSettings.token}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!listResponse.ok) throw new Error(`Složka nenalezena: ${listResponse.status}`);
        const files = await listResponse.json();
        for (const file of files) {
            if (file.type === 'dir') {
                await deleteFromGitHub(file.path);
            } else {
                const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`;
                await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${githubSettings.token}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
                    body: JSON.stringify({ message: `🗑️ Smazáno: ${file.path}`, sha: file.sha })
                });
            }
        }
        return true;
    } catch (error) {
        console.error('GitHub delete error:', error);
        throw error;
    }
}

// ===== Expose functions globally =====
window.launchExercise = launchExercise;
window.deleteExercise = deleteExercise;
window.confirmDelete = confirmDelete;
window.editExercise = editExercise;
window.saveExercise = saveExercise;

// ===== Edit Exercise =====
const ICON_CATEGORIES = {
    'Elektro': ['⚡', '🔌', '💡', '🔋', '🔧', '🛠️', '⚙️', '🏗️'],
    'Měření': ['📏', '📐', '🔢', '📊', '📈', '🧮', '🔬', '🌡️'],
    'Bezpečnost': ['⚠️', '🛡️', '🧤', '👷', '🚨', '🔒', '✅', '❌'],
    'Komponenty': ['💻', '🖥️', '📱', '🔩', '🪛', '🔗', '📡', '🎛️'],
    'Témata': ['🏠', '🏭', '🏢', '🚗', '☀️', '🌍', '💼', '🎓'],
    'Cvičení & Hry': ['🎮', '🎯', '🏆', '⭐', '🎲', '🧩', '🎪', '🎨'],
    'Úrovně': ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '🔰', '🏅', '🥇']
};

function editExercise(id) {
    const exercise = builtExercises.find(e => e.id === id);
    if (!exercise) return;
    if (!githubSettings.token) {
        showNotification('Nejdříve zadejte GitHub token v nastavení výše', 'error');
        return;
    }

    let iconPickerHTML = '<div class="icon-picker" id="iconPicker">';
    iconPickerHTML += '<div class="icon-picker-toggle" onclick="toggleIconPicker()">';
    iconPickerHTML += `<span id="selectedIcon">${exercise.icon}</span>`;
    iconPickerHTML += '<span class="icon-arrow">▼</span></div>';
    iconPickerHTML += '<div class="icon-picker-dropdown" id="iconDropdown">';
    for (const [category, icons] of Object.entries(ICON_CATEGORIES)) {
        iconPickerHTML += `<div class="icon-category"><div class="icon-category-title">${category}</div><div class="icon-grid">`;
        for (const icon of icons) {
            iconPickerHTML += `<button type="button" class="icon-option" onclick="selectIcon('${icon}')">${icon}</button>`;
        }
        iconPickerHTML += '</div></div>';
    }
    iconPickerHTML += '</div></div>';

    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.id = 'editModal';
    modal.innerHTML = `
        <div class="edit-modal-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="edit-modal-content">
            <div class="edit-header"><span class="edit-icon">✏️</span><h3>Upravit aplikaci</h3></div>
            <form id="editForm" onsubmit="saveExercise('${exercise.id}'); return false;">
                <div class="form-group"><label for="editName">Název:</label><input type="text" id="editName" value="${escapeHtml(exercise.name)}" required></div>
                <div class="form-group"><label for="editDescription">Popis:</label><textarea id="editDescription" rows="3">${escapeHtml(exercise.description)}</textarea></div>
                <div class="form-group"><label>Ikona:</label>${iconPickerHTML}<input type="hidden" id="editIcon" value="${exercise.icon}"></div>
                <div class="edit-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.edit-modal').remove()">Zrušit</button>
                    <button type="submit" class="btn btn-primary">💾 Uložit</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    if (!document.getElementById('icon-picker-styles')) {
        const style = document.createElement('style');
        style.id = 'icon-picker-styles';
        style.textContent = `
            .icon-picker { position: relative; width: 100%; }
            .icon-picker-toggle { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #0a1628; border: 1px solid #1c3354; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
            .icon-picker-toggle:hover { border-color: #f59e0b; }
            #selectedIcon { font-size: 1.5rem; }
            .icon-arrow { color: #8ba3c4; font-size: 0.8rem; transition: transform 0.2s; }
            .icon-picker.open .icon-arrow { transform: rotate(180deg); }
            .icon-picker-dropdown { display: none; position: absolute; top: 100%; left: 0; right: 0; max-height: 300px; overflow-y: auto; background: #0f1f36; border: 1px solid #1c3354; border-radius: 8px; margin-top: 4px; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
            .icon-picker.open .icon-picker-dropdown { display: block; }
            .icon-category { padding: 8px; border-bottom: 1px solid #1c3354; }
            .icon-category:last-child { border-bottom: none; }
            .icon-category-title { font-size: 0.75rem; color: #8ba3c4; text-transform: uppercase; margin-bottom: 8px; padding: 0 4px; }
            .icon-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
            .icon-option { padding: 8px; font-size: 1.2rem; background: transparent; border: 1px solid transparent; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
            .icon-option:hover { background: #162a46; border-color: #f59e0b; transform: scale(1.1); }
        `;
        document.head.appendChild(style);
    }
    document.getElementById('editName').focus();
}

function toggleIconPicker() { document.getElementById('iconPicker').classList.toggle('open'); }
function selectIcon(icon) {
    document.getElementById('editIcon').value = icon;
    document.getElementById('selectedIcon').textContent = icon;
    document.getElementById('iconPicker').classList.remove('open');
}
document.addEventListener('click', (e) => {
    const picker = document.getElementById('iconPicker');
    if (picker && !picker.contains(e.target)) picker.classList.remove('open');
});

async function saveExercise(id) {
    const exercise = builtExercises.find(e => e.id === id);
    if (!exercise) return;
    const newName = document.getElementById('editName').value.trim();
    const newDescription = document.getElementById('editDescription').value.trim();
    const newIcon = document.getElementById('editIcon').value.trim() || '⚡';
    if (!newName) { showNotification('Název nesmí být prázdný', 'error'); return; }

    const modal = document.getElementById('editModal');
    if (modal) modal.remove();
    showNotification('Ukládám změny...', 'info');

    try {
        const meta = { name: newName, description: newDescription || 'Aplikace pro elektrikáře', icon: newIcon, updated: new Date().toISOString().split('T')[0] };
        const success = await updateMetaJson(exercise.folder, meta);
        if (success) {
            exercise.name = newName;
            exercise.description = newDescription || 'Aplikace pro elektrikáře';
            exercise.icon = newIcon;
            await updateManifest();
            renderExercises();
            showNotification(`✅ Aplikace "${newName}" byla aktualizována!`, 'success');
        } else {
            showNotification('Nepodařilo se uložit změny', 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification(`Chyba při ukládání: ${error.message}`, 'error');
    }
}

async function updateMetaJson(folder, meta) {
    const [owner, repo] = githubSettings.repo.split('/');
    const path = `exercises/${folder}/meta.json`;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    try {
        const getResponse = await fetch(url, { headers: { 'Authorization': `Bearer ${githubSettings.token}`, 'Accept': 'application/vnd.github.v3+json' } });
        let sha = null;
        if (getResponse.ok) { const fileData = await getResponse.json(); sha = fileData.sha; }
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(meta, null, 2))));
        const body = { message: `✏️ Aktualizováno: ${meta.name}`, content };
        if (sha) body.sha = sha;
        const updateResponse = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${githubSettings.token}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
            body: JSON.stringify(body)
        });
        return updateResponse.ok;
    } catch (error) {
        console.error('Update meta.json error:', error);
        throw error;
    }
}

// ===== Update Manifest on GitHub =====
async function updateManifest() {
    const [owner, repo] = githubSettings.repo.split('/');
    const path = 'exercises/manifest.json';
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    try {
        const getResponse = await fetch(url, { headers: { 'Authorization': `Bearer ${githubSettings.token}`, 'Accept': 'application/vnd.github.v3+json' } });
        let sha = null;
        if (getResponse.ok) { const fileData = await getResponse.json(); sha = fileData.sha; }
        const manifest = {
            exercises: builtExercises.map(e => ({
                id: e.id, name: e.name, description: e.description, icon: e.icon,
                created: e.created || new Date().toISOString().split('T')[0],
                folder: e.folder, isBuilt: true
            }))
        };
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(manifest, null, 2))));
        const body = { message: '📄 Aktualizován manifest.json', content };
        if (sha) body.sha = sha;
        const updateResponse = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${githubSettings.token}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
            body: JSON.stringify(body)
        });
        if (!updateResponse.ok) console.error('Failed to update manifest.json');
        return updateResponse.ok;
    } catch (error) {
        console.error('Update manifest error:', error);
        return false;
    }
}

// Expose icon picker functions globally
window.toggleIconPicker = toggleIconPicker;
window.selectIcon = selectIcon;
