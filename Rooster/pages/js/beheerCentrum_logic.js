// Pages/JS/beheerCentrum_logic.js

/**
 * Logica voor de beheerCentrum.aspx pagina.
 * Beheert het laden, weergeven en CRUD-operaties voor diverse SharePoint lijsten.
 */

// Globale variabelen
let spWebAbsoluteUrlBeheer = '';
let huidigeGebruikerBeheer = { loginNaam: null, Id: null, Title: null };
let actieveTabId = 'dagen-indicators'; // Default actieve tab
let huidigeBewerkingsItemId = null; // Voor de modal
let huidigeBewerkingsTabId = null; // Voor de modal

// DOM Referenties
const domBeheerRefs = {
    appBody: document.body,
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContentContainer: document.getElementById('tab-content-container'),
    algemeenStatusBericht: document.getElementById('beheer-status-bericht-algemeen'),
    currentYearSpan: document.getElementById('current-year'),

    // Dagen Indicatoren
    dagenIndicatorsTabelBody: document.getElementById('dagen-indicators-tabel-body'),
    nieuwDagenIndicatorButton: document.getElementById('nieuw-dagenindicator-button'),
    dagenIndicatorsStatus: document.getElementById('dagen-indicators-status'),

    // Keuzelijst Functies
    functiesTabelBody: document.getElementById('keuzelijst-functies-tabel-body'),
    nieuwFunctieButton: document.getElementById('nieuw-functie-button'),
    functiesStatus: document.getElementById('keuzelijst-functies-status'),

    // Verlofredenen
    verlofredenenTabelBody: document.getElementById('verlofredenen-tabel-body'),
    nieuwVerlofredenButton: document.getElementById('nieuw-verlofreden-button'),
    verlofredenenStatus: document.getElementById('verlofredenen-status'),

    // Seniors
    seniorsTabelBody: document.getElementById('seniors-tabel-body'),
    nieuwSeniorButton: document.getElementById('nieuw-senior-button'),
    seniorsStatus: document.getElementById('seniors-status'),

    // Teams
    teamsTabelBody: document.getElementById('teams-tabel-body'),
    nieuwTeamButton: document.getElementById('nieuw-team-button'),
    teamsStatus: document.getElementById('teams-status'),
    
    // Modal
    beheerModal: document.getElementById('beheer-modal'),
    beheerModalTitle: document.getElementById('beheer-modal-title'),
    beheerModalForm: document.getElementById('beheer-modal-form'),
    beheerModalFieldsContainer: document.getElementById('beheer-modal-fields-container'),
    beheerModalStatus: document.getElementById('beheer-modal-status'),
    beheerModalCloseX: document.getElementById('beheer-modal-close-x'),
    beheerModalCancelButton: document.getElementById('beheer-modal-cancel-button'),
    beheerModalSaveButton: document.getElementById('beheer-modal-save-button'),
};

// Mapping van tab ID naar lijstnaam en configuratie
const tabConfigMap = {
    'dagen-indicators': { 
        lijstNaamSP: 'DagenIndicators', 
        laadFunctie: laadDagenIndicators, 
        statusElement: () => domBeheerRefs.dagenIndicatorsStatus,
        tabelBodyElement: () => domBeheerRefs.dagenIndicatorsTabelBody,
        velden: [
            { label: 'Titel (Afkorting)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true },
            { label: 'Beschrijving', interneNaam: 'Beschrijving', type: 'text', verplicht: false, tabelWeergave: true },
            { label: 'Kleur', interneNaam: 'Kleur', type: 'color', verplicht: true, tabelWeergave: true },
            { label: 'Patroon', interneNaam: 'Patroon', type: 'select', opties: ["Effen", "Diagonale lijn (rechts)", "Diagonale lijn (links)", "Kruis", "Plus", "Louis Vuitton"], verplicht: false, tabelWeergave: true }
        ], 
        pk: 'ID' 
    },
    'keuzelijst-functies': { 
        lijstNaamSP: 'keuzelijstFuncties', 
        laadFunctie: laadKeuzelijstFuncties, 
        statusElement: () => domBeheerRefs.functiesStatus,
        tabelBodyElement: () => domBeheerRefs.functiesTabelBody,
        velden: [
            { label: 'Functienaam (Titel)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true }
        ], 
        pk: 'ID' 
    },
    'verlofredenen': { 
        lijstNaamSP: 'Verlofredenen', 
        laadFunctie: laadVerlofredenen, 
        statusElement: () => domBeheerRefs.verlofredenenStatus,
        tabelBodyElement: () => domBeheerRefs.verlofredenenTabelBody,
        velden: [
            { label: 'Titel (voor dropdowns)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true },
            { label: 'Naam (voor legenda)', interneNaam: 'Naam', type: 'text', verplicht: true, tabelWeergave: true },
            { label: 'Kleur', interneNaam: 'Kleur', type: 'color', verplicht: true, tabelWeergave: true },
            { label: 'Telt als Verlofdag?', interneNaam: 'VerlofDag', type: 'checkbox', verplicht: false, tabelWeergave: true }
        ], 
        pk: 'ID' 
    },
    'seniors': { 
        lijstNaamSP: 'Seniors', 
        laadFunctie: laadSeniors, 
        statusElement: () => domBeheerRefs.seniorsStatus,
        tabelBodyElement: () => domBeheerRefs.seniorsTabelBody,
        velden: [ 
            { label: 'Medewerker (Naam)', interneNaam: 'Medewerker', type: 'text', verplicht: true, tabelWeergave: true, placeholder: 'Volledige naam medewerker' }, 
            { label: 'Team (Naam)', interneNaam: 'Team', type: 'text', verplicht: true, tabelWeergave: true, placeholder: 'Teamnaam' },
            { label: 'MedewerkerID (Username)', interneNaam: 'MedewerkerID', type: 'text', verplicht: true, readonly: false, tabelWeergave: true, placeholder: 'i:0#.w|domein\\username' }
        ], 
        pk: 'ID' 
    },
    'teams': { 
        lijstNaamSP: 'Teams', 
        laadFunctie: laadTeams, 
        statusElement: () => domBeheerRefs.teamsStatus,
        tabelBodyElement: () => domBeheerRefs.teamsTabelBody,
        velden: [
            { label: 'Teamnaam (Titel)', interneNaam: 'Title', type: 'text', verplicht: true, tabelWeergave: true },
            { label: 'Teamleider (Naam)', interneNaam: 'Teamleider', type: 'text', verplicht: false, tabelWeergave: true, placeholder: 'Naam teamleider' }, 
            { label: 'Kleur', interneNaam: 'Kleur', type: 'color', verplicht: false, tabelWeergave: true },
            { label: 'Actief?', interneNaam: 'Actief', type: 'checkbox', verplicht: false, default: true, tabelWeergave: true },
            { label: 'TeamleiderID (Username)', interneNaam: 'TeamleiderId', type: 'text', verplicht: false, readonly: false, tabelWeergave: false, placeholder: 'i:0#.w|domein\\username' } // Niet standaard in tabel, wel in modal
        ], 
        pk: 'ID' 
    }
};

// --- Initialisatie & Context ---
async function initializeBeheerContext() {
    console.log("[BeheerCentrum] Initialiseren context...");
    if (window.opener && window.opener.spWebAbsoluteUrl && window.opener.huidigeGebruiker) {
        spWebAbsoluteUrlBeheer = window.opener.spWebAbsoluteUrl;
        huidigeGebruikerBeheer = JSON.parse(JSON.stringify(window.opener.huidigeGebruiker));
    } else if (window.parent && window.parent !== window && window.parent.spWebAbsoluteUrl && window.parent.huidigeGebruiker) {
        spWebAbsoluteUrlBeheer = window.parent.spWebAbsoluteUrl;
        huidigeGebruikerBeheer = JSON.parse(JSON.stringify(window.parent.huidigeGebruiker));
    } else {
        try {
            const webResponse = await fetch(`/_api/web?$select=Url`, { headers: { 'Accept': 'application/json;odata=verbose' } });
            if (!webResponse.ok) throw new Error('Kan web URL niet ophalen');
            const webData = await webResponse.json();
            spWebAbsoluteUrlBeheer = webData.d.Url;
            const userResponse = await fetch(`${spWebAbsoluteUrlBeheer}/_api/web/currentuser?$select=LoginName,Title,Id`, { headers: { 'Accept': 'application/json;odata=verbose' } });
            if (!userResponse.ok) throw new Error('Kan gebruiker info niet ophalen');
            const userData = await userResponse.json();
            huidigeGebruikerBeheer = { loginNaam: userData.d.LoginName, Id: userData.d.Id, Title: userData.d.Title };
        } catch (error) {
            console.error("[BeheerCentrum] Kritische fout bij ophalen context:", error);
            toonAlgemeenStatusBericht("Kan geen verbinding maken met de server. Probeer later opnieuw.", "error", false);
            return false;
        }
    }
    console.log("[BeheerCentrum] Context geïnitialiseerd:", spWebAbsoluteUrlBeheer, huidigeGebruikerBeheer.loginNaam);
    return true;
}

// --- Generieke SharePoint Functies (CRUD) ---
async function getBeheerLijstItems(lijstIdentifier, selectQuery = "", filterQuery = "", expandQuery = "", orderbyQuery = "") {
    if (!spWebAbsoluteUrlBeheer) { console.error("[BeheerCentrum] spWebAbsoluteUrlBeheer is niet beschikbaar."); return []; }
    let apiUrlPath;
    const lijstConfigSP = getLijstConfig(lijstIdentifier); // Gebruik de naam uit configLijst.js
    const lijstGuid = lijstConfigSP ? lijstConfigSP.lijstId : lijstIdentifier; // Fallback naar identifier als naam niet in config

    if (/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(lijstGuid)) {
        apiUrlPath = `/_api/web/lists(guid'${lijstGuid}')/items`;
    } else { // Als het geen GUID is, neem aan dat het de titel is
        apiUrlPath = `/_api/web/lists/getByTitle('${encodeURIComponent(lijstGuid)}')/items`;
    }
    let queryParams = [];
    if (selectQuery) queryParams.push(selectQuery);
    if (filterQuery) queryParams.push(filterQuery);
    if (expandQuery) queryParams.push(expandQuery);
    if (orderbyQuery) queryParams.push(orderbyQuery);
    const apiUrl = `${spWebAbsoluteUrlBeheer}${apiUrlPath}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    try {
        toonTabStatus(actieveTabId, "Laden...", "info", false);
        const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json;odata=verbose' } });
        if (!response.ok) {
            const err = await response.json().catch(()=>({})); 
            console.error(`Fout bij ophalen ${lijstIdentifier}: ${response.status}`, err); 
            toonTabStatus(actieveTabId, `Fout bij laden: ${err.error?.message?.value || response.statusText}`, "error", false);
            return [];
        }
        const data = await response.json(); 
        const itemCount = data.d.results ? data.d.results.length : 0;
        toonTabStatus(actieveTabId, `${itemCount} items geladen.`, "success", true);
        return data.d.results || [];
    } catch (error) { 
        console.error(`Uitzondering bij ophalen ${lijstIdentifier}:`, error); 
        toonTabStatus(actieveTabId, `Netwerkfout: ${error.message}`, "error", false);
        return []; 
    }
}

async function getBeheerRequestDigest() { 
    if (!spWebAbsoluteUrlBeheer) throw new Error("Web absolute URL niet beschikbaar voor Request Digest.");
    const apiUrl = `${spWebAbsoluteUrlBeheer}/_api/contextinfo`;
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Accept': 'application/json;odata=verbose' } });
    if (!response.ok) throw new Error("Kon Request Digest niet ophalen.");
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
}

async function createBeheerLijstItem(lijstNaamSP, itemData) { 
    const requestDigest = await getBeheerRequestDigest();
    const lijstConfigSP = getLijstConfig(lijstNaamSP);
    if (!lijstConfigSP) throw new Error(`Lijstconfiguratie niet gevonden voor ${lijstNaamSP}`);
    
    itemData.__metadata = { "type": `SP.Data.${lijstConfigSP.lijstTitel.replace(/\s+/g, '_')}ListItem` };

    const response = await fetch(`${spWebAbsoluteUrlBeheer}/_api/web/lists(guid'${lijstConfigSP.lijstId}')/items`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest
        },
        body: JSON.stringify(itemData)
    });
    if (!response.ok && response.status !== 201) { 
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Fout bij aanmaken item (${response.status}): ${errorData.error?.message?.value || 'Onbekende serverfout'}`);
    }
    return response.status === 201 ? await response.json() : null;
}

async function updateBeheerLijstItem(lijstNaamSP, itemId, itemData) { 
    const requestDigest = await getBeheerRequestDigest();
    const lijstConfigSP = getLijstConfig(lijstNaamSP);
     if (!lijstConfigSP) throw new Error(`Lijstconfiguratie niet gevonden voor ${lijstNaamSP}`);

    itemData.__metadata = { "type": `SP.Data.${lijstConfigSP.lijstTitel.replace(/\s+/g, '_')}ListItem` };
    
    const response = await fetch(`${spWebAbsoluteUrlBeheer}/_api/web/lists(guid'${lijstConfigSP.lijstId}')/items(${itemId})`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest,
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE'
        },
        body: JSON.stringify(itemData)
    });
    if (response.status !== 204) { 
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Fout bij bijwerken item (${response.status}): ${errorData.error?.message?.value || 'Onbekende serverfout'}`);
    }
    return true;
}

async function deleteBeheerLijstItem(lijstNaamSP, itemId) { 
    const requestDigest = await getBeheerRequestDigest();
    const lijstConfigSP = getLijstConfig(lijstNaamSP);
    if (!lijstConfigSP) throw new Error(`Lijstconfiguratie niet gevonden voor ${lijstNaamSP}`);

    const response = await fetch(`${spWebAbsoluteUrlBeheer}/_api/web/lists(guid'${lijstConfigSP.lijstId}')/items(${itemId})`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest,
            'IF-MATCH': '*',
            'X-HTTP-Method': 'DELETE'
        }
    });
    if (response.status !== 204) { 
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Fout bij verwijderen item (${response.status}): ${errorData.error?.message?.value || 'Onbekende serverfout'}`);
    }
    return true;
}

// --- Specifieke Laadfuncties per Tab ---
async function laadDagenIndicators() { await generiekeLaadFunctie('dagen-indicators'); }
async function laadKeuzelijstFuncties() { await generiekeLaadFunctie('keuzelijst-functies'); }
async function laadVerlofredenen() { await generiekeLaadFunctie('verlofredenen'); }
async function laadSeniors() { await generiekeLaadFunctie('seniors'); }
async function laadTeams() { await generiekeLaadFunctie('teams'); }

async function generiekeLaadFunctie(tabId) {
    const config = tabConfigMap[tabId];
    const tabelBody = config.tabelBodyElement();
    tabelBody.innerHTML = `<tr><td colspan="${config.velden.filter(v => v.tabelWeergave !== false).length + 1}" class="text-center p-4 text-gray-400">Laden ${config.lijstNaamSP}...</td></tr>`;
    
    const selectFields = config.velden.map(v => v.interneNaam);
    if (!selectFields.includes(config.pk)) selectFields.unshift(config.pk);
    const selectQuery = "$select=" + selectFields.filter(Boolean).join(','); // Filter lege veldnamen uit
    const orderby = config.velden[0]?.interneNaam ? `${config.velden[0].interneNaam} asc` : "";

    const items = await getBeheerLijstItems(config.lijstNaamSP, selectQuery, "", "", orderby);
    
    tabelBody.innerHTML = '';
    if (items.length === 0) {
        tabelBody.innerHTML = `<tr><td colspan="${config.velden.filter(v => v.tabelWeergave !== false).length + 1}" class="text-center p-4 text-gray-400">Geen items gevonden.</td></tr>`;
        return;
    }
    items.forEach(item => createDisplayRow(tabId, item, tabelBody)); // Gebruik createDisplayRow
}

// --- Generieke UI Functies (Modal, Tabelrijen) ---

function createDisplayRow(tabId, item, tabelBody) { // Aangepast van createEditableRow
    const config = tabConfigMap[tabId];
    if (!config) return;

    const tr = document.createElement('tr');
    tr.dataset.id = item[config.pk];

    config.velden.forEach(veldDef => {
        if (veldDef.tabelWeergave === false) return; // Sla velden over die niet in tabel getoond moeten worden

        const td = document.createElement('td');
        td.className = 'align-top py-2 px-3 text-sm';
        let displayValue = item[veldDef.interneNaam];

        switch (veldDef.type) {
            case 'color':
                const colorContainer = document.createElement('div');
                colorContainer.className = 'flex items-center space-x-2';
                const colorSwatch = document.createElement('div');
                colorSwatch.style.backgroundColor = displayValue || '#ffffff';
                colorSwatch.className = 'h-6 w-6 border border-gray-400 rounded';
                const hexText = document.createElement('span');
                hexText.textContent = (displayValue || '').toUpperCase();
                hexText.className = 'text-xs';
                colorContainer.appendChild(colorSwatch);
                colorContainer.appendChild(hexText);
                td.appendChild(colorContainer);
                break;
            case 'checkbox':
                const iconClass = displayValue ? "text-green-400" : "text-red-400";
                const icon = displayValue ? 
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><polyline points="20 6 9 17 4 12"></polyline></svg>` : // Vinkje
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${iconClass}"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`; // Kruisje
                td.innerHTML = icon;
                break;
            default: // text, select (toon geselecteerde waarde), textarea
                td.textContent = displayValue === null || displayValue === undefined ? '' : displayValue;
        }
        tr.appendChild(td);
    });

    const actiesTd = document.createElement('td');
    actiesTd.className = 'space-x-1 whitespace-nowrap py-2 px-3';
    const editButton = document.createElement('button');
    editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    editButton.title = "Bewerken";
    editButton.className = 'edit-button bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded text-xs shadow';
    editButton.addEventListener('click', () => openModalForItem(tabId, item));
    
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
    deleteButton.title = "Verwijderen";
    deleteButton.className = 'delete-button bg-red-500 hover:bg-red-600 text-white p-1.5 rounded text-xs shadow';
    deleteButton.addEventListener('click', () => handleDeleteItem(tabId, item[config.pk], tr));
    
    actiesTd.appendChild(editButton);
    actiesTd.appendChild(deleteButton);
    tr.appendChild(actiesTd);

    tabelBody.appendChild(tr);
}

function openModalForItem(tabId, item) { 
    huidigeBewerkingsTabId = tabId;
    huidigeBewerkingsItemId = item ? item[tabConfigMap[tabId].pk] : null;

    const config = tabConfigMap[tabId];
    domBeheerRefs.beheerModalTitle.textContent = item ? `${config.lijstNaamSP} Item Bewerken (ID: ${huidigeBewerkingsItemId})` : `Nieuw ${config.lijstNaamSP} Item Toevoegen`;
    domBeheerRefs.beheerModalFieldsContainer.innerHTML = ''; 

    config.velden.forEach(veldDef => {
        const div = document.createElement('div');
        div.className = 'mb-3';
        const label = document.createElement('label');
        label.htmlFor = `modal-${veldDef.interneNaam}`;
        label.textContent = veldDef.label + (veldDef.verplicht ? ' *' : '');
        label.className = 'block text-sm font-medium text-gray-300 mb-1';
        
        let inputElement;
        switch (veldDef.type) {
            case 'color':
                // ... (implementatie voor color picker in modal, zoals eerder)
                inputElement = document.createElement('div');
                inputElement.className = 'flex items-center space-x-2';
                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.id = `modal-${veldDef.interneNaam}_picker`;
                colorPicker.name = `${veldDef.interneNaam}_picker`; // Voorkom conflict
                colorPicker.value = item ? (item[veldDef.interneNaam] || '#ffffff') : (veldDef.default !== undefined ? veldDef.default : '#ffffff');
                colorPicker.className = 'h-10 w-12 p-1 border border-gray-500 rounded';
                
                const hexInput = document.createElement('input');
                hexInput.type = 'text';
                hexInput.id = `modal-${veldDef.interneNaam}`;
                hexInput.name = veldDef.interneNaam;
                hexInput.value = item ? (item[veldDef.interneNaam] || '#ffffff') : (veldDef.default !== undefined ? veldDef.default : '#ffffff');
                hexInput.className = 'input-class w-full';
                hexInput.placeholder = veldDef.placeholder || '#RRGGBB';
                
                colorPicker.addEventListener('input', () => hexInput.value = colorPicker.value.toUpperCase());
                hexInput.addEventListener('change', () => {
                     if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
                        colorPicker.value = hexInput.value;
                    } else {
                        hexInput.value = colorPicker.value.toUpperCase();
                    }
                });
                inputElement.appendChild(colorPicker);
                inputElement.appendChild(hexInput);
                break;
            case 'select':
                inputElement = document.createElement('select');
                inputElement.id = `modal-${veldDef.interneNaam}`;
                inputElement.name = veldDef.interneNaam;
                inputElement.className = 'input-class w-full';
                if (veldDef.opties) {
                    // Voeg een lege optie toe als niet verplicht en geen default
                    if(!veldDef.verplicht && !item && veldDef.default === undefined) {
                        const emptyOpt = document.createElement('option');
                        emptyOpt.value = ""; emptyOpt.textContent = "Selecteer...";
                        inputElement.appendChild(emptyOpt);
                    }
                    veldDef.opties.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt; option.textContent = opt;
                        if (item && item[veldDef.interneNaam] === opt) option.selected = true;
                        else if (!item && veldDef.default === opt) option.selected = true;
                        inputElement.appendChild(option);
                    });
                }
                break;
            case 'checkbox':
                // Checkbox met label ernaast
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'flex items-center mt-1';
                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.id = `modal-${veldDef.interneNaam}`;
                inputElement.name = veldDef.interneNaam;
                inputElement.checked = item ? (item[veldDef.interneNaam] || false) : (veldDef.default !== undefined ? veldDef.default : false);
                inputElement.className = 'h-5 w-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500';
                
                checkboxContainer.appendChild(inputElement);
                // Label voor checkbox wordt al hierboven gemaakt, maar we voegen het niet opnieuw toe aan de div.
                // Het label staat al boven de checkboxContainer.
                div.appendChild(label); // Label eerst
                div.appendChild(checkboxContainer); // Dan de container met de checkbox
                domBeheerRefs.beheerModalFieldsContainer.appendChild(div);
                continue; 
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.id = `modal-${veldDef.interneNaam}`;
                inputElement.name = veldDef.interneNaam;
                inputElement.value = item ? (item[veldDef.interneNaam] || '') : (veldDef.default !== undefined ? veldDef.default : '');
                inputElement.className = 'input-class w-full min-h-[80px]';
                inputElement.rows = 3;
                inputElement.placeholder = veldDef.placeholder || '';
                break;
            default: // text
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.id = `modal-${veldDef.interneNaam}`;
                inputElement.name = veldDef.interneNaam;
                inputElement.value = item ? (item[veldDef.interneNaam] || '') : (veldDef.default !== undefined ? veldDef.default : '');
                inputElement.className = 'input-class w-full';
                inputElement.placeholder = veldDef.placeholder || '';
        }
        if (veldDef.verplicht) inputElement.required = true;
        if (veldDef.readonly && item) { // Alleen readonly bij bewerken indien gespecificeerd en item bestaat
             if(inputElement.tagName === 'DIV'){ // Voor color picker container
                Array.from(inputElement.children).forEach(child => child.disabled = true);
             } else {
                inputElement.readOnly = true;
                inputElement.classList.add('bg-gray-500', 'cursor-not-allowed');
             }
        }
        
        div.appendChild(label);
        div.appendChild(inputElement);
        domBeheerRefs.beheerModalFieldsContainer.appendChild(div);
    });

    domBeheerRefs.beheerModalStatus.textContent = '';
    domBeheerRefs.beheerModalStatus.classList.add('hidden');
    domBeheerRefs.beheerModal.classList.remove('hidden');
    void domBeheerRefs.beheerModal.offsetWidth;
    domBeheerRefs.beheerModal.querySelector('div > div').classList.remove('opacity-0', 'scale-95');
    domBeheerRefs.beheerModal.querySelector('div > div').classList.add('opacity-100', 'scale-100');
}

async function saveModalDataBeheer() { /* ... (blijft grotendeels hetzelfde) ... */ 
    const form = domBeheerRefs.beheerModalForm;
    if (!form.checkValidity()) {
        toonModalStatus("Vul a.u.b. alle verplichte velden correct in.", "error");
        form.querySelectorAll(':invalid').forEach(el => {
            el.classList.add('border-red-500');
            el.addEventListener('input', () => el.classList.remove('border-red-500'), { once: true });
        });
        // Focus op het eerste ongeldige veld
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
    }
    form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));

    const formData = new FormData(form); // FormData werkt niet goed met disabled velden of custom elementen zoals color picker.
    const itemData = {};
    const config = tabConfigMap[huidigeBewerkingsTabId];

    config.velden.forEach(veldDef => {
        const inputField = form.elements[veldDef.interneNaam];
        if (inputField) { // Check of het element bestaat in het formulier
            if (veldDef.type === 'checkbox') {
                itemData[veldDef.interneNaam] = inputField.checked;
            } else {
                itemData[veldDef.interneNaam] = inputField.value;
            }
        } else if (veldDef.type === 'color') { // Speciale behandeling voor color picker (hex input)
             itemData[veldDef.interneNaam] = form.elements[veldDef.interneNaam]?.value; // Neem de hex input
        }
    });
    
    // Verwijder eventuele picker-specifieke velden die niet naar SP moeten
    Object.keys(itemData).forEach(key => {
        if (key.endsWith('_picker')) {
            delete itemData[key];
        }
    });


    toonModalStatus("Opslaan...", "info", false);
    domBeheerRefs.beheerModalSaveButton.disabled = true;

    try {
        if (huidigeBewerkingsItemId) { 
            await updateBeheerLijstItem(config.lijstNaamSP, huidigeBewerkingsItemId, itemData);
            toonModalStatus("Item succesvol bijgewerkt!", "success");
        } else { 
            const nieuwItem = await createBeheerLijstItem(config.lijstNaamSP, itemData);
            toonModalStatus(`Nieuw item succesvol aangemaakt (ID: ${nieuwItem?.d?.ID || 'onbekend'})!`, "success");
        }
        closeModalBeheer();
        config.laadFunctie(); 
    } catch (error) {
        console.error("Fout bij opslaan item:", error);
        toonModalStatus(`Fout: ${error.message}`, "error", false);
    } finally {
        domBeheerRefs.beheerModalSaveButton.disabled = false;
    }
}

async function handleDeleteItem(tabId, itemId, trElement) { /* ... (blijft hetzelfde) ... */ 
    if (!confirm(`Weet u zeker dat u item ID ${itemId} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
        return;
    }
    const config = tabConfigMap[tabId];
    const statusElement = config.statusElement();
    toonTabStatus(tabId, `Verwijderen item ID ${itemId}...`, "info", false, statusElement);

    try {
        await deleteBeheerLijstItem(config.lijstNaamSP, itemId);
        toonTabStatus(tabId, `Item ID ${itemId} succesvol verwijderd.`, "success", true, statusElement);
        if (trElement && trElement.parentNode) { // Controleer of trElement nog bestaat en een parent heeft
            trElement.remove(); 
        } else { // Als trElement niet (meer) bestaat, herlaad de tabel
            config.laadFunctie();
        }
    } catch (error) {
        console.error(`Fout bij verwijderen item ID ${itemId}:`, error);
        toonTabStatus(tabId, `Fout bij verwijderen: ${error.message}`, "error", false, statusElement);
    }
}

// --- Tab Navigatie ---
function activateTabBeheer(tabId) { 
    actieveTabId = tabId;
    domBeheerRefs.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    if (domBeheerRefs.tabContentContainer) {
        Array.from(domBeheerRefs.tabContentContainer.children).forEach(content => {
            content.classList.toggle('active', content.id === `tab-content-${tabId}`);
        });
    }
    if (tabConfigMap[tabId] && typeof tabConfigMap[tabId].laadFunctie === 'function') {
        tabConfigMap[tabId].laadFunctie();
    } else {
        console.warn(`Geen laadfunctie gevonden voor tab: ${tabId}`);
        const tabelBody = tabConfigMap[tabId]?.tabelBodyElement();
        if(tabelBody) tabelBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-400">Kon data niet laden voor deze tab.</td></tr>`;
    }
}

// --- Status Berichten ---
function toonAlgemeenStatusBericht(bericht, type = 'info', autoHide = true) { /* ... (blijft hetzelfde) ... */ 
    if (domBeheerRefs.algemeenStatusBericht) {
        domBeheerRefs.algemeenStatusBericht.textContent = bericht;
        domBeheerRefs.algemeenStatusBericht.className = 'mt-4 p-3 text-sm rounded-lg'; // Reset
        switch (type) {
            case 'success': domBeheerRefs.algemeenStatusBericht.classList.add('bg-green-600', 'text-green-100'); break;
            case 'error': domBeheerRefs.algemeenStatusBericht.classList.add('bg-red-600', 'text-red-100'); break;
            default: domBeheerRefs.algemeenStatusBericht.classList.add('bg-blue-600', 'text-blue-100'); break;
        }
        domBeheerRefs.algemeenStatusBericht.classList.remove('hidden');
        if (autoHide) setTimeout(() => domBeheerRefs.algemeenStatusBericht.classList.add('hidden'), 5000);
    }
}

function toonTabStatus(tabId, bericht, type = 'info', autoHide = true, statusElement = null) { /* ... (blijft hetzelfde) ... */ 
    const el = statusElement || tabConfigMap[tabId]?.statusElement();
    if (el) {
        el.textContent = bericht;
        el.className = 'mt-3 text-sm p-2 rounded-md'; // Reset
         switch (type) {
            case 'success': el.classList.add('bg-green-700', 'text-green-100'); break;
            case 'error': el.classList.add('bg-red-700', 'text-red-100'); break;
            default: el.classList.add('bg-blue-700', 'text-blue-100'); break;
        }
        el.classList.remove('hidden');
        if (autoHide) setTimeout(() => el.classList.add('hidden'), 3000);
    } else { 
        toonAlgemeenStatusBericht(`[${tabConfigMap[tabId]?.lijstNaamSP || tabId}] ${bericht}`, type, autoHide);
    }
}
function toonModalStatus(bericht, type = 'info', autoHide = true) { /* ... (blijft hetzelfde) ... */ 
    if (domBeheerRefs.beheerModalStatus) {
        domBeheerRefs.beheerModalStatus.textContent = bericht;
        domBeheerRefs.beheerModalStatus.className = 'mt-3 text-sm p-2 rounded-md'; // Reset
         switch (type) {
            case 'success': domBeheerRefs.beheerModalStatus.classList.add('bg-green-700', 'text-green-100'); break;
            case 'error': domBeheerRefs.beheerModalStatus.classList.add('bg-red-700', 'text-red-100'); break;
            default: domBeheerRefs.beheerModalStatus.classList.add('bg-blue-700', 'text-blue-100'); break;
        }
        domBeheerRefs.beheerModalStatus.classList.remove('hidden');
        if (autoHide) setTimeout(() => domBeheerRefs.beheerModalStatus.classList.add('hidden'), 4000);
    }
}

// --- Event Listeners ---
function initBeheerEventListeners() { /* ... (blijft hetzelfde) ... */ 
    domBeheerRefs.tabButtons.forEach(button => {
        button.addEventListener('click', () => activateTabBeheer(button.dataset.tab));
    });
    if(domBeheerRefs.nieuwDagenIndicatorButton) domBeheerRefs.nieuwDagenIndicatorButton.addEventListener('click', () => openModalForItem('dagen-indicators', null));
    if(domBeheerRefs.nieuwFunctieButton) domBeheerRefs.nieuwFunctieButton.addEventListener('click', () => openModalForItem('keuzelijst-functies', null));
    if(domBeheerRefs.nieuwVerlofredenButton) domBeheerRefs.nieuwVerlofredenButton.addEventListener('click', () => openModalForItem('verlofredenen', null));
    if(domBeheerRefs.nieuwSeniorButton) domBeheerRefs.nieuwSeniorButton.addEventListener('click', () => openModalForItem('seniors', null));
    if(domBeheerRefs.nieuwTeamButton) domBeheerRefs.nieuwTeamButton.addEventListener('click', () => openModalForItem('teams', null));
    if(domBeheerRefs.beheerModalCloseX) domBeheerRefs.beheerModalCloseX.addEventListener('click', closeModalBeheer);
    if(domBeheerRefs.beheerModalCancelButton) domBeheerRefs.beheerModalCancelButton.addEventListener('click', closeModalBeheer);
    if(domBeheerRefs.beheerModalSaveButton) domBeheerRefs.beheerModalSaveButton.addEventListener('click', saveModalDataBeheer);
    if (domBeheerRefs.beheerModal) {
        domBeheerRefs.beheerModal.addEventListener('click', (event) => {
            if (event.target === domBeheerRefs.beheerModal) { 
                closeModalBeheer();
            }
        });
    }
}

function closeModalBeheer() { /* ... (blijft hetzelfde) ... */ 
    if(domBeheerRefs.beheerModal) {
        const modalContent = domBeheerRefs.beheerModal.querySelector('div > div');
        modalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            domBeheerRefs.beheerModal.classList.add('hidden');
        }, 200); 
    }
}

// --- Hoofd Initialisatie ---
async function initializeBeheerCentrum() { 
    console.log("[BeheerCentrum] Initialiseren pagina...");
    if (domBeheerRefs.currentYearSpan) {
        domBeheerRefs.currentYearSpan.textContent = new Date().getFullYear();
    }
    const opgeslagenThema = localStorage.getItem('verlofroosterThema'); // Thema van hoofdpagina overnemen indien mogelijk
    if (opgeslagenThema === 'light') {
        domBeheerRefs.appBody.classList.add('light-theme');
    } else {
        domBeheerRefs.appBody.classList.remove('light-theme'); // Zorg dat donker de default is
    }
    const contextOK = await initializeBeheerContext();
    if (!contextOK) return;
    initBeheerEventListeners();
    activateTabBeheer(actieveTabId); // Laad de default actieve tab (en zijn data)
    console.log("[BeheerCentrum] Pagina initialisatie voltooid.");
}

// Start de initialisatie
if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeBeheerCentrum);
} else {
    const configIntervalBeheer = setInterval(() => {
        if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
            clearInterval(configIntervalBeheer);
            document.addEventListener('DOMContentLoaded', initializeBeheerCentrum);
        }
    }, 100);
    setTimeout(() => {
        if (typeof getLijstConfig !== 'function') {
            clearInterval(configIntervalBeheer);
            console.error("[BeheerCentrum] configLijst.js niet geladen. Pagina kan niet correct initialiseren.");
            if(domBeheerRefs.algemeenStatusBericht) toonAlgemeenStatusBericht("Kritische fout: Configuratie ontbreekt.", "error", false);
        }
    }, 5000);
}

console.log("Pages/JS/beheerCentrum_logic.js geladen.");
