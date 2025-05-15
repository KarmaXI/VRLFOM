// js/verlofroosterModal_logic.js

/**
 * Logica specifiek voor modals binnen de Verlofrooster applicatie.
 */

// Globale modal-specifieke variabelen
if (typeof window.currentModalActionCallback === 'undefined') {
    window.currentModalActionCallback = null;
}
if (typeof window.huidigeRegistratieStap === 'undefined') {
    window.huidigeRegistratieStap = 1;
}
if (typeof window.registratieFormDataStap1 === 'undefined') {
    window.registratieFormDataStap1 = {};
}
// Specifiek voor de Admin Zittingvrij modal
let zittingVrijModalGeselecteerdeMedewerker = {
    gebruikersnaam: null, // Genormaliseerde username (bijv. domein\gebruiker)
    displayName: null
};
let alleMedewerkersVoorZtvLookup = []; // Cache voor de ZTV modal medewerker lookup


// --- Algemene Modal Functies ---
/**
 * Opent een generieke modal.
 * @param {string} titel - De titel van de modal.
 * @param {string} contentHtml - De HTML-inhoud voor de modal body.
 * @param {string} actionButtonText - Tekst voor de primaire actieknop. Null als geen actieknop.
 * @param {Function} actionCallback - Callback functie voor de primaire actieknop.
 * @param {boolean} showCancelButton - Of de annuleer/sluit knop getoond moet worden.
 * @param {boolean} showPrevButton - Of een 'Vorige' knop getoond moet worden (voor meerstaps modals).
 * @param {Function} prevButtonCallback - Callback voor de 'Vorige' knop.
 * @param {string} modalSizeClass - Optionele Tailwind class voor modal breedte.
 */
function openModal(titel, contentHtml, actionButtonText, actionCallback, showCancelButton = true, showPrevButton = false, prevButtonCallback = null, modalSizeClass = 'max-w-md') {
    console.log("[VerlofroosterModalLogic] Openen modal met titel:", titel);
    if (!window.domRefsLogic || !window.domRefsLogic.modalPlaceholder || !window.domRefsLogic.modalTitle || !window.domRefsLogic.modalContent || !window.domRefsLogic.modalActionButton || !window.domRefsLogic.modalCloseButton || !window.domRefsLogic.modalActionsContainer || !window.domRefsLogic.modalCard || !window.domRefsLogic.modalStepNavigationContainer) {
        console.error("[VerlofroosterModalLogic] Modal DOM elementen (of domRefsLogic) niet volledig geïnitialiseerd! Kan modal niet openen.");
        if (typeof toonNotificatie === 'function') { 
            toonNotificatie("Fout: Modal kan niet worden geopend. Essentiële elementen missen.", "error");
        } else {
            alert("Fout: Modal kan niet worden geopend. Essentiële elementen missen.");
        }
        return;
    }
    window.domRefsLogic.modalTitle.textContent = titel;
    window.domRefsLogic.modalContent.innerHTML = contentHtml;
    window.currentModalActionCallback = null; 

    const modalDialog = window.domRefsLogic.modalCard.parentElement; 
    if (modalDialog) {
        modalDialog.classList.remove('max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl');
        modalDialog.classList.add(modalSizeClass);
    }

    if (actionButtonText && typeof actionCallback === 'function') {
        window.domRefsLogic.modalActionButton.textContent = actionButtonText;
        window.domRefsLogic.modalActionButton.classList.remove('hidden');
        window.currentModalActionCallback = actionCallback; 
    } else {
        window.domRefsLogic.modalActionButton.classList.add('hidden');
    }

    window.domRefsLogic.modalCloseButton.classList.toggle('hidden', !showCancelButton);
    window.domRefsLogic.modalStepNavigationContainer.innerHTML = ''; 
    if (showPrevButton && typeof prevButtonCallback === 'function') {
        const prevButton = document.createElement('button');
        prevButton.id = 'modal-prev-step-button';
        prevButton.textContent = 'Vorige';
        prevButton.className = 'modal-button-secondary py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all';
        if (document.body.classList.contains('dark-theme')) {
             prevButton.classList.add('dark:bg-gray-600', 'dark:hover:bg-gray-500', 'dark:text-white');
        } else {
             prevButton.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
        }
        prevButton.addEventListener('click', prevButtonCallback);
        window.domRefsLogic.modalStepNavigationContainer.appendChild(prevButton);
        window.domRefsLogic.modalStepNavigationContainer.classList.remove('hidden');
    } else {
        window.domRefsLogic.modalStepNavigationContainer.classList.add('hidden');
    }

    const hasAction = actionButtonText && typeof actionCallback === 'function';
    const hasPrev = showPrevButton && typeof prevButtonCallback === 'function';
    window.domRefsLogic.modalActionsContainer.classList.toggle('hidden', !hasAction && !showCancelButton && !hasPrev);

    window.domRefsLogic.modalPlaceholder.classList.remove('hidden');
    void window.domRefsLogic.modalCard.offsetWidth; 
    window.domRefsLogic.modalCard.classList.remove('opacity-0', 'scale-95');
    window.domRefsLogic.modalCard.classList.add('opacity-100', 'scale-100');
}

/**
 * Sluit de actieve modal.
 */
function closeModal() {
    console.log("[VerlofroosterModalLogic] Sluiten modal...");
    if (!window.domRefsLogic || !window.domRefsLogic.modalPlaceholder || !window.domRefsLogic.modalCard) { 
        console.error("[VerlofroosterModalLogic] Modal DOM elementen (of domRefsLogic) niet gevonden voor sluiten!");
        return;
    }
    window.domRefsLogic.modalCard.classList.add('opacity-0', 'scale-95');
    window.domRefsLogic.modalCard.classList.remove('opacity-100', 'scale-100');
    setTimeout(() => {
        if (window.domRefsLogic.modalPlaceholder) window.domRefsLogic.modalPlaceholder.classList.add('hidden');
        if (window.domRefsLogic.modalContent) window.domRefsLogic.modalContent.innerHTML = ''; 
        if (window.domRefsLogic.modalTitle) window.domRefsLogic.modalTitle.textContent = 'Modal Titel'; 
        window.currentModalActionCallback = null; 
        window.huidigeRegistratieStap = 1; 
        window.registratieFormDataStap1 = {}; 
        zittingVrijModalGeselecteerdeMedewerker = { gebruikersnaam: null, displayName: null };
    }, 200); 
}

// --- Registratie Modal Functies ---
function openRegistratieModal() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
function renderRegistratieModalStap1() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ return "";}
function renderRegistratieModalStap2() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ return "";}
function navigateToRegistratieStap(stapNummer) { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
async function handleRegistratieSubmit() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }

// --- Verlof Aanvraag Modal Functies ---
function openVerlofAanvraagModal() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
async function handleVerlofAanvraagSubmit() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }

// --- Compensatie Modal Functies ---
function openCompensatieModal() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
async function handleCompensatieSubmit() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }

// --- Ziek/Beter Melden Modal Functies ---
function openZiekBeterModal() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }
async function handleZiekBeterSubmit() { /* ... Implementatie zoals in artifact verlofroosterModal_logic_js_02 ... */ }


// --- Admin Zittingvrij Modal Functies (NIEUW/GEÏNTEGREERD) ---

/**
 * Opent de modal voor het registreren van incidenteel zittingvrij.
 * @param {string | null} geselecteerdeClaimsUsername - De volledige claims-based username (bijv. i:0#.w|org\user) van de vooraf geselecteerde medewerker, of null.
 * @param {string | null} geselecteerdeDisplayName - De display naam van de vooraf geselecteerde medewerker, of null.
 */
window.openAdminZittingVrijModal = async function(geselecteerdeClaimsUsername, geselecteerdeDisplayName) {
    console.log(`[VerlofroosterModalLogic] Openen Admin Zittingvrij modal. Medewerker: ${geselecteerdeDisplayName || 'Nog niet geselecteerd'}`);
    
    // Reset en vul de globale variabele voor deze modal
    zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam = geselecteerdeClaimsUsername ? (typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? window.trimLoginNaamPrefixMachtigingen(geselecteerdeClaimsUsername) : geselecteerdeClaimsUsername) : null;
    zittingVrijModalGeselecteerdeMedewerker.displayName = geselecteerdeDisplayName;

    const nu = new Date();
    const vandaagISO = nu.toISOString().split('T')[0];
    const defaultStartTijd = "09:00";
    const defaultEindTijd = "17:00";

    const isGebruikersnaamReadOnly = !!zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam;
    const gebruikersnaamInputValue = zittingVrijModalGeselecteerdeMedewerker.displayName || '';
    const gebruikersnaamPlaceholder = isGebruikersnaamReadOnly ? '' : 'Typ volledige naam medewerker...';
    const gebruikersnaamExtraClasses = isGebruikersnaamReadOnly 
        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
        : 'dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100';

    const modalContentHtml = `
        <form id="admin-zittingvrij-form-modal" class="space-y-4">
            <input type="hidden" id="admin-zv-form-titel-hidden-modal" name="TitelModal">

            <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Medewerker Informatie</legend>
                <div>
                    <label for="admin-zv-form-gebruikersnaam-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medewerker <span class="text-red-500">*</span></label>
                    <input type="text" id="admin-zv-form-gebruikersnaam-modal" name="GebruikersnaamDisplayModal"
                           class="modal-form-input mt-1 block w-full ${gebruikersnaamExtraClasses}"
                           value="${gebruikersnaamInputValue}" placeholder="${gebruikersnaamPlaceholder}" 
                           ${isGebruikersnaamReadOnly ? 'readonly' : ''}>
                    <p id="admin-zv-gebruikersnaam-status-modal" class="text-xs mt-1 ml-1"></p>
                </div>
            </fieldset>

            <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Periode Zittingvrij</legend>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="admin-zv-form-start-datum-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum <span class="text-red-500">*</span></label>
                        <input type="date" id="admin-zv-form-start-datum-modal" name="startDatumModal" class="modal-form-input dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100" value="${vandaagISO}" required>
                    </div>
                    <div>
                        <label for="admin-zv-form-start-tijd-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starttijd <span class="text-red-500">*</span></label>
                        <input type="time" id="admin-zv-form-start-tijd-modal" name="startTijdModal" class="modal-form-input dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100" value="${defaultStartTijd}" required>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label for="admin-zv-form-eind-datum-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum <span class="text-red-500">*</span></label>
                        <input type="date" id="admin-zv-form-eind-datum-modal" name="eindDatumModal" class="modal-form-input dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100" value="${vandaagISO}" required>
                    </div>
                    <div>
                        <label for="admin-zv-form-eind-tijd-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eindtijd <span class="text-red-500">*</span></label>
                        <input type="time" id="admin-zv-form-eind-tijd-modal" name="eindTijdModal" class="modal-form-input dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100" value="${defaultEindTijd}" required>
                    </div>
                </div>
            </fieldset>

            <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Details</legend>
                <div>
                    <label for="admin-zv-form-opmerking-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opmerking (intern, voor Beheer)</label>
                    <textarea id="admin-zv-form-opmerking-modal" name="OpmerkingModal" rows="3" class="modal-form-input dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100" placeholder="Reden of aanvullende details..."></textarea>
                </div>
            </fieldset>

            <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                <legend class="text-sm font-semibold px-2 text-gray-700 dark:text-gray-300">Herhaling</legend>
                <div class="flex items-center mt-2 mb-4">
                    <input id="admin-zv-form-terugkerend-modal" name="TerugkerendModal" type="checkbox" class="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="admin-zv-form-terugkerend-modal" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Terugkerend evenement</label>
                </div>
                <div id="admin-zv-recurring-fields-container-modal" class="space-y-4 hidden">
                    <div>
                        <label for="admin-zv-form-terugkeerpatroon-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terugkeerpatroon</label>
                        <select id="admin-zv-form-terugkeerpatroon-modal" name="TerugkeerPatroonModal" class="modal-form-input dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100">
                            <option value="">Niet herhalen</option>
                            <option value="Dagelijks">Dagelijks</option>
                            <option value="Wekelijks">Wekelijks (zelfde dag v/d week)</option>
                            <option value="Maandelijks">Maandelijks (zelfde dag v/d maand)</option>
                        </select>
                    </div>
                    <div>
                        <label for="admin-zv-form-terugkerend-tot-modal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Herhalen tot en met</label>
                        <input type="date" id="admin-zv-form-terugkerend-tot-modal" name="TerugkerendTotModal" class="modal-form-input dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100">
                    </div>
                </div>
            </fieldset>
            <div id="admin-zv-modal-status-bericht" class="hidden mt-4 p-3 text-sm rounded-lg"></div>
        </form>
    `;

    openModal(
        'Incidenteel Zittingvrij Registreren',
        modalContentHtml,
        'Opslaan',
        handleAdminZittingVrijSubmitModal,
        true, 
        false, 
        null, 
        'max-w-lg' 
    );

    const terugkerendCheckboxModal = document.getElementById('admin-zv-form-terugkerend-modal');
    if (terugkerendCheckboxModal) {
        terugkerendCheckboxModal.addEventListener('change', toggleAdminZvRecurringFieldsModal);
        toggleAdminZvRecurringFieldsModal(); 
    }

    const gebruikersnaamInputModal = document.getElementById('admin-zv-form-gebruikersnaam-modal');
    if (gebruikersnaamInputModal && !isGebruikersnaamReadOnly) {
        gebruikersnaamInputModal.addEventListener('blur', handleAdminZvGebruikersnaamBlurModal);
    }
};

/**
 * Toont/verbergt de terugkerende velden in de Zittingvrij modal.
 */
function toggleAdminZvRecurringFieldsModal() {
    const checkbox = document.getElementById('admin-zv-form-terugkerend-modal');
    const container = document.getElementById('admin-zv-recurring-fields-container-modal');
    const patroonSelect = document.getElementById('admin-zv-form-terugkeerpatroon-modal');
    const totInput = document.getElementById('admin-zv-form-terugkerend-tot-modal');

    if (!checkbox || !container || !patroonSelect || !totInput) return;

    const isTerugkerend = checkbox.checked;
    container.classList.toggle('hidden', !isTerugkerend);
    patroonSelect.required = isTerugkerend;
    totInput.required = isTerugkerend;
    if (!isTerugkerend) {
        patroonSelect.value = "";
        totInput.value = "";
    }
}

/**
 * Handler voor blur event op gebruikersnaam input in de Zittingvrij modal.
 */
async function handleAdminZvGebruikersnaamBlurModal() {
    const gebruikersnaamInputModal = document.getElementById('admin-zv-form-gebruikersnaam-modal');
    const statusElementModal = document.getElementById('admin-zv-gebruikersnaam-status-modal');
    if (!gebruikersnaamInputModal || !statusElementModal) return;

    const ingevoerdeTerm = gebruikersnaamInputModal.value.trim().toLowerCase();
    if (!ingevoerdeTerm) {
        statusElementModal.textContent = ''; // Wis status
        zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam = null;
        zittingVrijModalGeselecteerdeMedewerker.displayName = null;
        return;
    }

    statusElementModal.textContent = 'Zoeken...';
    statusElementModal.className = 'text-xs mt-1 ml-1 text-blue-600 dark:text-blue-400';

    if (alleMedewerkersVoorZtvLookup.length === 0) { 
        try {
            // Gebruik de globale alleMedewerkers array die al geladen is door verlofrooster_logic.js
            // Als die om een of andere reden leeg is, probeer opnieuw te laden.
            if (!window.alleMedewerkers || window.alleMedewerkers.length === 0) {
                 if (typeof window.laadInitiëleData === 'function') {
                    console.log("[VerlofroosterModalLogic] Medewerkerslijst leeg, herladen voor ZTV lookup...");
                    await window.laadInitiëleData(true); // Forceer laden, incl. medewerkers
                 }
            }
            alleMedewerkersVoorZtvLookup = window.alleMedewerkers || []; // Gebruik de globale cache

            if (alleMedewerkersVoorZtvLookup.length === 0) {
                 throw new Error("Medewerkerslijst kon niet worden geladen.");
            }
            console.log("[VerlofroosterModalLogic] Medewerkerslijst voor ZTV lookup (her)gebruikt:", alleMedewerkersVoorZtvLookup.length, "items");
        } catch (error) {
            console.error("[VerlofroosterModalLogic] Fout bij (her)laden medewerkerslijst voor ZTV lookup:", error);
            statusElementModal.textContent = 'Fout bij laden medewerkers.';
            statusElementModal.className = 'text-xs mt-1 ml-1 text-red-600 dark:text-red-400';
            return;
        }
    }
    
    const matches = alleMedewerkersVoorZtvLookup.filter(m => {
        const naamMatch = m.Naam && m.Naam.toLowerCase().includes(ingevoerdeTerm);
        const normalizedListUsername = m.Username ? (typeof window.trimLoginNaamPrefixMachtigingen === 'function' ? window.trimLoginNaamPrefixMachtigingen(m.Username) : m.Username).toLowerCase() : "";
        const usernamePart = ingevoerdeTerm.includes('\\') ? ingevoerdeTerm.split('\\')[1] : ingevoerdeTerm;
        const usernameMatch = normalizedListUsername.includes(usernamePart);
        return m.Actief && !m.Verbergen && (naamMatch || usernameMatch);
    });

    if (matches.length === 1) {
        const gevondenMedewerker = matches[0];
        // Belangrijk: sla de *volledige claims-based* username op indien nodig voor SharePoint,
        // maar de genormaliseerde voor interne logica als dat consistent is.
        // Voor nu gebruiken we de genormaliseerde, zoals in de standalone pagina.
        const normalizedUsername = typeof window.trimLoginNaamPrefixMachtigingen === 'function' 
                                   ? window.trimLoginNaamPrefixMachtigingen(gevondenMedewerker.Username) 
                                   : gevondenMedewerker.Username; 

        zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam = normalizedUsername;
        zittingVrijModalGeselecteerdeMedewerker.displayName = gevondenMedewerker.Naam;
        gebruikersnaamInputModal.value = gevondenMedewerker.Naam;
        statusElementModal.textContent = `Gevonden: ${gevondenMedewerker.Naam} (Username: ${normalizedUsername})`;
        statusElementModal.className = 'text-xs mt-1 ml-1 text-green-600 dark:text-green-400';
    } else if (matches.length > 1) {
        zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam = null;
        zittingVrijModalGeselecteerdeMedewerker.displayName = null;
        const namen = matches.map(m => m.Naam).join(', ');
        statusElementModal.textContent = `Meerdere medewerkers gevonden: ${namen.substring(0,100)}${namen.length > 100 ? '...' : ''}. Wees specifieker.`;
        statusElementModal.className = 'text-xs mt-1 ml-1 text-red-600 dark:text-red-400';
    } else {
        zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam = null;
        zittingVrijModalGeselecteerdeMedewerker.displayName = null;
        statusElementModal.textContent = 'Medewerker niet gevonden.';
        statusElementModal.className = 'text-xs mt-1 ml-1 text-red-600 dark:text-red-400';
    }
}

/**
 * Verwerkt de submit van het Admin Zittingvrij formulier in de modal.
 */
async function handleAdminZittingVrijSubmitModal() {
    console.log("[VerlofroosterModalLogic] Start handleAdminZittingVrijSubmitModal.");
    const form = document.getElementById('admin-zittingvrij-form-modal');
    const statusBerichtModal = document.getElementById('admin-zv-modal-status-bericht');

    function toonModalStatus(bericht, type = 'info') { /* Implementatie zoals in Pages/js/meldingZittingsvrij_logic.js */ 
        if (!statusBerichtModal) return;
        statusBerichtModal.innerHTML = bericht;
        statusBerichtModal.className = 'mt-4 p-3 text-sm rounded-lg border';
        switch (type) {
            case 'success': statusBerichtModal.classList.add('status-success', 'bg-green-100', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); break;
            case 'error': statusBerichtModal.classList.add('status-error', 'bg-red-100', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); break;
            default: statusBerichtModal.classList.add('status-info', 'bg-blue-100', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); break;
        }
        statusBerichtModal.classList.remove('hidden');
         setTimeout(() => { if(statusBerichtModal) statusBerichtModal.classList.add('hidden');}, 7000);
    }
    
    if (!form) { toonModalStatus("Formulier niet gevonden.", "error"); return; }
    
    // Validatie (vereenvoudigd, kan uitgebreider)
    let isValide = true;
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500', 'dark:border-red-400'));

    if (!form.checkValidity()) {
        toonModalStatus("Vul alle verplichte velden (*) correct in.", "error");
        form.querySelectorAll(':invalid').forEach(el => el.classList.add('border-red-500', 'dark:border-red-400'));
        isValide = false;
    }
    if (!zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam) {
        toonModalStatus("Geen geldige medewerker geselecteerd of gevonden.", "error");
        const gebruikersnaamInputModal = document.getElementById('admin-zv-form-gebruikersnaam-modal');
        if (gebruikersnaamInputModal) gebruikersnaamInputModal.classList.add('border-red-500', 'dark:border-red-400');
        isValide = false;
    }
    // Datum/tijd validatie
    const startDatumValue = document.getElementById('admin-zv-form-start-datum-modal').value;
    const startTijdValue = document.getElementById('admin-zv-form-start-tijd-modal').value;
    const eindDatumValue = document.getElementById('admin-zv-form-eind-datum-modal').value;
    const eindTijdValue = document.getElementById('admin-zv-form-eind-tijd-modal').value;
    const startDatum = new Date(`${startDatumValue}T${startTijdValue || '00:00'}`);
    const eindDatum = new Date(`${eindDatumValue}T${eindTijdValue || '23:59'}`);

    if (eindDatum <= startDatum) {
        toonModalStatus("Einddatum en -tijd moeten na startdatum en -tijd liggen.", "error");
        document.getElementById('admin-zv-form-eind-datum-modal').classList.add('border-red-500', 'dark:border-red-400');
        document.getElementById('admin-zv-form-eind-tijd-modal').classList.add('border-red-500', 'dark:border-red-400');
        isValide = false;
    }
    // Validatie voor terugkerende velden
    const terugkerendCheckboxModal = document.getElementById('admin-zv-form-terugkerend-modal');
    if (terugkerendCheckboxModal.checked) {
        if (!document.getElementById('admin-zv-form-terugkeerpatroon-modal').value) {
            toonModalStatus("Selecteer een terugkeerpatroon.", "error");
            document.getElementById('admin-zv-form-terugkeerpatroon-modal').classList.add('border-red-500', 'dark:border-red-400');
            isValide = false;
        }
        const terugkerendTotValue = document.getElementById('admin-zv-form-terugkerend-tot-modal').value;
        if (!terugkerendTotValue) {
            toonModalStatus("Selecteer een einddatum voor het terugkerende evenement.", "error");
            document.getElementById('admin-zv-form-terugkerend-tot-modal').classList.add('border-red-500', 'dark:border-red-400');
            isValide = false;
        } else if (new Date(terugkerendTotValue) < startDatum) {
            toonModalStatus("'Herhalen tot en met' datum mag niet voor de startdatum liggen.", "error");
            document.getElementById('admin-zv-form-terugkerend-tot-modal').classList.add('border-red-500', 'dark:border-red-400');
            isValide = false;
        }
    }

    if (!isValide) {
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = false;
        return;
    }

    toonModalStatus("Bezig met opslaan...", "info");
    if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = true;

    const formData = new FormData(form);
    const displayNameVoorTitel = zittingVrijModalGeselecteerdeMedewerker.displayName || zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam.split(/[\\|]/).pop();
    const vandaag = new Date();
    const datumVoorTitel = `${vandaag.getDate().toString().padStart(2, '0')}-${(vandaag.getMonth() + 1).toString().padStart(2, '0')}-${vandaag.getFullYear()}`;

    const itemData = {
        Title: `ZittingvrijMelding ${displayNameVoorTitel} - ${datumVoorTitel}`,
        Gebruikersnaam: zittingVrijModalGeselecteerdeMedewerker.gebruikersnaam, 
        ZittingsVrijeDagTijd: startDatum.toISOString(),
        ZittingsVrijeDagTijdEind: eindDatum.toISOString(),
        Opmerking: formData.get('OpmerkingModal'),
        Terugkerend: terugkerendCheckboxModal.checked
    };

    if (itemData.Terugkerend) {
        itemData.TerugkeerPatroon = formData.get('TerugkeerPatroonModal');
        itemData.TerugkerendTot = new Date(formData.get('TerugkerendTotModal')).toISOString();
    } else {
        itemData.TerugkeerPatroon = null;
        itemData.TerugkerendTot = null;
    }
    
    console.log("[VerlofroosterModalLogic] Item data voor 'IncidenteelZittingVrij':", itemData);

    try {
        if (typeof window.createSPListItem !== 'function') {
            throw new Error("Fout: Functie voor data opslaan (createSPListItem) is niet beschikbaar.");
        }
        
        await window.createSPListItem("IncidenteelZittingVrij", itemData);
        
        toonModalStatus("Zittingvrij melding succesvol opgeslagen!", "success");
        setTimeout(() => {
            closeModal();
            if (typeof window.laadInitiëleData === 'function') {
                window.laadInitiëleData(false); 
            }
        }, 2000);

    } catch (error) {
        console.error("[VerlofroosterModalLogic] Fout bij opslaan zittingvrij melding:", error);
        toonModalStatus(`Fout bij opslaan: ${error.message}. Probeer het opnieuw.`, "error");
    } finally {
        if (window.domRefsLogic.modalActionButton) window.domRefsLogic.modalActionButton.disabled = false;
    }
}


// --- Event Listeners specifiek voor Modals ---
/**
 * Initialiseert alle event listeners die specifiek zijn voor modals.
 * Wordt aangeroepen vanuit verlofrooster_logic.js.
 */
function initializeVerlofroosterModals() {
    console.log("[VerlofroosterModalLogic] Start initModalEventListeners.");

    if (!window.domRefsLogic || Object.keys(window.domRefsLogic).length === 0 || !window.domRefsLogic.modalPlaceholder) {
        console.error("[VerlofroosterModalLogic] domRefsLogic is niet (volledig) beschikbaar! Kan modal event listeners niet koppelen.");
        return;
    }

    if(window.domRefsLogic.modalCloseButtonX) {
        window.domRefsLogic.modalCloseButtonX.addEventListener('click', closeModal);
    } else { console.warn("[VerlofroosterModalLogic] Modal sluitknop (X) niet gevonden."); }

    if(window.domRefsLogic.modalCloseButton) {
        window.domRefsLogic.modalCloseButton.addEventListener('click', closeModal);
    } else { console.warn("[VerlofroosterModalLogic] Modal sluitknop (onderaan) niet gevonden."); }

    if(window.domRefsLogic.modalActionButton) {
        window.domRefsLogic.modalActionButton.addEventListener('click', () => {
            if (typeof window.currentModalActionCallback === 'function') {
                window.currentModalActionCallback();
            } else { console.warn("[VerlofroosterModalLogic] Actieknop geklikt, maar geen callback (currentModalActionCallback is null)."); }
        });
    } else { console.warn("[VerlofroosterModalLogic] Modal actieknop niet gevonden."); }

    window.domRefsLogic.modalPlaceholder.addEventListener('click', (event) => {
        if (event.target === window.domRefsLogic.modalPlaceholder) { 
            closeModal(); 
        }
    });
    
    // FAB menu item listeners
    if (window.domRefsLogic.fabVerlofAanvragenLink) {
        window.domRefsLogic.fabVerlofAanvragenLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (typeof openVerlofAanvraagModal === 'function') openVerlofAanvraagModal();
            else console.warn("openVerlofAanvraagModal is niet gedefinieerd");
            if (window.domRefsLogic.fabMenu) window.domRefsLogic.fabMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            if (window.domRefsLogic.fabIconPlus) window.domRefsLogic.fabIconPlus.classList.remove('hidden');
            if (window.domRefsLogic.fabIconClose) window.domRefsLogic.fabIconClose.classList.add('hidden');
        });
    }

    if (window.domRefsLogic.fabCompensatieAanvragenLink) {
        window.domRefsLogic.fabCompensatieAanvragenLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (typeof openCompensatieModal === 'function') openCompensatieModal();
            else console.warn("openCompensatieModal is niet gedefinieerd");
            if (window.domRefsLogic.fabMenu) window.domRefsLogic.fabMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            if (window.domRefsLogic.fabIconPlus) window.domRefsLogic.fabIconPlus.classList.remove('hidden');
            if (window.domRefsLogic.fabIconClose) window.domRefsLogic.fabIconClose.classList.add('hidden');
        });
    }
    
    if (window.domRefsLogic.fabZiekMeldenLink) {
        window.domRefsLogic.fabZiekMeldenLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (typeof openZiekBeterModal === 'function') openZiekBeterModal();
            else console.warn("openZiekBeterModal is niet gedefinieerd");
            if (window.domRefsLogic.fabMenu) window.domRefsLogic.fabMenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            if (window.domRefsLogic.fabIconPlus) window.domRefsLogic.fabIconPlus.classList.remove('hidden');
            if (window.domRefsLogic.fabIconClose) window.domRefsLogic.fabIconClose.classList.add('hidden');
        });
    }
    // De listener voor 'fab-zittingvrij-modal-trigger' zit in verlofrooster_logic.js

    console.log("[VerlofroosterModalLogic] Einde initModalEventListeners.");
}

window.initializeVerlofroosterModals = initializeVerlofroosterModals;

console.log("js/verlofroosterModal_logic.js geladen en klaar voor initialisatie via verlofrooster_logic.js.");