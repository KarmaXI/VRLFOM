// Pages/JS/gInstellingen_logic.js

/**
 * Logica voor de gInstellingen.html pagina.
 * Beheert het laden en opslaan van gebruikersspecifieke instellingen en
 * het weergeven van persoonlijke gegevens en werkroosterinformatie.
 */

// Globale variabelen voor SharePoint context specifiek voor deze pagina.
let spWebAbsoluteUrlInstellingen = '';
let huidigeGebruikerInstellingen = {
    loginNaam: null,
    Id: null, // SharePoint User ID
    Title: null, // Display naam van SharePoint gebruiker
    Email: null,
    medewerkerData: null, // Uit Medewerkers lijst (Naam, Team, Functie etc.)
    gebruikersInstellingenSP: null, // Item uit gebruikersInstellingen SharePoint lijst (ID, Title, soortWeergave, etc.)
    urenPerWeekActueel: null // Actuele werkrooster item uit UrenPerWeek lijst
};

// DOM Referenties
const domInstellingenRefs = {
    appBody: document.body, // Voor thema switching
    // Tabs
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),
    // Persoonlijke Gegevens Tab
    pgNaamInput: document.getElementById('pg-naam'),
    pgUsernameInput: document.getElementById('pg-username'),
    pgEmailInput: document.getElementById('pg-email'),
    pgTeamInput: document.getElementById('pg-team'),
    pgFunctieInput: document.getElementById('pg-functie'),
    werkdagenContainer: document.getElementById('werkdagen-container'),
    // Rooster Instellingen Tab
    instellingenForm: document.getElementById('rooster-instellingen-form'),
    instThemaSelect: document.getElementById('inst-thema'),
    instEigenTeamCheckbox: document.getElementById('inst-eigen-team'),
    instWeekendenCheckbox: document.getElementById('inst-weekenden'),
    opslaanInstellingenButton: document.getElementById('opslaan-instellingen-button'),
    instellingenStatusBericht: document.getElementById('instellingen-status-bericht'),
    // Footer
    currentYearSpan: document.getElementById('current-year'),
    // Headers voor light theme
    pageTitleHeader: document.querySelector('#app-container > header h1'),
    pageSubtitleHeader: document.querySelector('#app-container > header p'),
    persGegevensTitle: document.querySelector('#tab-content-persoonlijk > h2'),
    roosterInstTitle: document.querySelector('#tab-content-instellingen > h2'),
    werkdagenTitle: document.querySelector('#persoonlijke-gegevens-form > h3')
};

/**
 * Initialiseert de SharePoint context (web URL en gebruikersinformatie).
 * Probeert eerst context van opener/parent, anders zelf ophalen.
 * @returns {Promise<boolean>} True als initialisatie succesvol is, anders false.
 */
async function initializeInstellingenContext() {
    console.log("[gInstellingen] Initialiseren context...");
    if (window.opener && window.opener.spWebAbsoluteUrl && window.opener.huidigeGebruiker) {
        spWebAbsoluteUrlInstellingen = window.opener.spWebAbsoluteUrl;
        huidigeGebruikerInstellingen = JSON.parse(JSON.stringify(window.opener.huidigeGebruiker));
        console.log("[gInstellingen] Context overgenomen van opener window.");
    } else if (window.parent && window.parent !== window && window.parent.spWebAbsoluteUrl && window.parent.huidigeGebruiker) {
        spWebAbsoluteUrlInstellingen = window.parent.spWebAbsoluteUrl;
        huidigeGebruikerInstellingen = JSON.parse(JSON.stringify(window.parent.huidigeGebruiker));
        console.log("[gInstellingen] Context overgenomen van parent window.");
    } else {
        console.log("[gInstellingen] Geen opener/parent context gevonden, context zelf ophalen...");
        try {
            // Gebruik GEDEFINIEERDE_SITE_URL uit configLijst.js indien beschikbaar, anders relatief pad
            const baseUrl = typeof GEDEFINIEERDE_SITE_URL !== 'undefined' ? GEDEFINIEERDE_SITE_URL.replace(/\/$/, "") : "..";

            const webResponse = await fetch(`${baseUrl}/_api/web?$select=Url`, { headers: { 'Accept': 'application/json;odata=verbose' } });
            if (!webResponse.ok) throw new Error('Kan web URL niet ophalen');
            const webData = await webResponse.json();
            spWebAbsoluteUrlInstellingen = webData.d.Url;
            if (!spWebAbsoluteUrlInstellingen.endsWith('/')) spWebAbsoluteUrlInstellingen += '/';


            const userResponse = await fetch(`${spWebAbsoluteUrlInstellingen}_api/web/currentuser?$select=LoginName,Title,Id,Email`, { headers: { 'Accept': 'application/json;odata=verbose' } });
            if (!userResponse.ok) throw new Error('Kan gebruiker info niet ophalen');
            const userData = await userResponse.json();
            huidigeGebruikerInstellingen.loginNaam = userData.d.LoginName;
            huidigeGebruikerInstellingen.Id = userData.d.Id;
            huidigeGebruikerInstellingen.Title = userData.d.Title;
            huidigeGebruikerInstellingen.Email = userData.d.Email;
            console.log("[gInstellingen] Context succesvol zelf opgehaald. User LoginName:", huidigeGebruikerInstellingen.loginNaam);
        } catch (error) {
            console.error("[gInstellingen] Kritische fout bij ophalen context:", error);
            toonInstellingenStatusBericht("Kan geen verbinding maken met de server. Probeer later opnieuw.", "error", false);
            if(domInstellingenRefs.opslaanInstellingenButton) domInstellingenRefs.opslaanInstellingenButton.disabled = true;
            return false;
        }
    }
    return true;
}

/**
 * Haalt items op uit een SharePoint lijst via REST API.
 * @param {string} lijstIdentifier - De GUID of titel van de lijst (uit configLijst.js).
 * @param {string} selectQuery - Optionele $select query.
 * @param {string} filterQuery - Optionele $filter query.
 * @param {string} expandQuery - Optionele $expand query.
 * @param {string} orderbyQuery - Optionele $orderby query.
 * @returns {Promise<Array<object>>}
 */
async function haalInstellingenLijstItems(lijstIdentifier, selectQuery = "", filterQuery = "", expandQuery = "", orderbyQuery = "") {
    if (!spWebAbsoluteUrlInstellingen) {
        console.error("[gInstellingen] spWebAbsoluteUrlInstellingen is niet beschikbaar.");
        return [];
    }
    const lijstConfig = getLijstConfig(lijstIdentifier); // Haal configuratie op basis van de naam/key
    if (!lijstConfig) {
        console.error(`[gInstellingen] Kon lijst configuratie niet vinden voor identifier: ${lijstIdentifier}`);
        return [];
    }
    const lijstIdOfTitel = lijstConfig.lijstId || lijstConfig.lijstTitel; // Gebruik GUID indien beschikbaar, anders titel

    let apiUrlPath;
    if (/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(lijstIdOfTitel)) { // Check of het een GUID is
        apiUrlPath = `/_api/web/lists(guid'${lijstIdOfTitel}')/items`;
    } else {
        apiUrlPath = `/_api/web/lists/getByTitle('${encodeURIComponent(lijstIdOfTitel)}')/items`;
    }

    let queryParams = [];
    if (selectQuery) queryParams.push(selectQuery);
    if (filterQuery) queryParams.push(filterQuery);
    if (expandQuery) queryParams.push(expandQuery);
    if (orderbyQuery) queryParams.push(orderbyQuery);

    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}${apiUrlPath}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    console.log(`[gInstellingen] Ophalen lijst items: ${decodeURIComponent(apiUrl)}`); // Decodeer voor leesbaarheid in console

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json;odata=verbose' }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ "error": { "message": { "value": `Fout bij ophalen ${lijstIdOfTitel}. Status: ${response.status}`}}}));
            console.error(`[gInstellingen] Fout bij ophalen lijst '${lijstIdOfTitel}': ${response.status}`, errorData.error.message.value);
            return [];
        }
        const data = await response.json();
        return data.d.results;
    } catch (error) {
        console.error(`[gInstellingen] Uitzondering bij ophalen lijst '${lijstIdOfTitel}':`, error);
        return [];
    }
}

/**
 * Laadt alle benodigde gegevens voor de huidige gebruiker.
 */
async function laadGebruikersGegevens() {
    if (!huidigeGebruikerInstellingen.loginNaam) {
        console.error("[gInstellingen] Gebruikers loginNaam niet beschikbaar. Kan gegevens niet laden.");
        toonInstellingenStatusBericht("Gebruikersinformatie is onvolledig. Kan gegevens niet laden.", "error", false);
        return;
    }
    toonInstellingenStatusBericht("Bezig met laden van uw gegevens...", "info", false);

    try {
        // 1. Haal Medewerker data op
        // De Medewerkers lijst gebruikt 'Username' (loginNaam) om te filteren.
        const medewerkersConfigKey = "Medewerkers"; // Key zoals in configLijst.js
        const medewerkersLijstConfig = getLijstConfig(medewerkersConfigKey);
        if (medewerkersLijstConfig) {
            const filter = `$filter=Username eq '${encodeURIComponent(huidigeGebruikerInstellingen.loginNaam)}'`;
            const select = "$select=ID,Title,Naam,Username,E_x002d_mail,Team,Functie"; // Interne namen uit configLijst.js
            const medArray = await haalInstellingenLijstItems(medewerkersConfigKey, select, filter);
            if (medArray.length > 0) {
                huidigeGebruikerInstellingen.medewerkerData = medArray[0];
            } else {
                 console.warn("[gInstellingen] Geen medewerkerdata gevonden voor gebruiker:", huidigeGebruikerInstellingen.loginNaam);
                 huidigeGebruikerInstellingen.medewerkerData = { // Fallback data
                    Naam: huidigeGebruikerInstellingen.Title,
                    Username: huidigeGebruikerInstellingen.loginNaam,
                    E_x002d_mail: huidigeGebruikerInstellingen.Email,
                    Team: "N.v.t.", Functie: "N.v.t."
                 };
            }
        } else {
            console.error("[gInstellingen] Configuratie voor Medewerkers lijst niet gevonden.");
        }

        // 2. Haal gebruikersInstellingen op (specifiek voor deze gebruiker)
        // De gebruikersInstellingen lijst gebruikt 'Title' (wat de loginNaam is) om te filteren.
        const gebruikersInstConfigKey = "gebruikersInstellingen";
        const gebruikersInstConfig = getLijstConfig(gebruikersInstConfigKey);
        if (gebruikersInstConfig) {
            const filter = `$filter=Title eq '${encodeURIComponent(huidigeGebruikerInstellingen.loginNaam)}'`;
            const select = "$select=ID,Title,EigenTeamWeergeven,soortWeergave,WeekendenWeergeven"; // Interne namen uit configLijst.js
            const instArray = await haalInstellingenLijstItems(gebruikersInstConfigKey, select, filter);
            if (instArray.length > 0) {
                huidigeGebruikerInstellingen.gebruikersInstellingenSP = instArray[0];
            } else {
                console.log("[gInstellingen] Geen specifieke gebruikersinstellingen gevonden, gebruik standaardwaarden.");
                huidigeGebruikerInstellingen.gebruikersInstellingenSP = { // Default/fallback waarden
                    EigenTeamWeergeven: false,
                    soortWeergave: 'dark', // Default thema
                    WeekendenWeergeven: true // Default weekenden tonen
                };
            }
        } else {
             console.error("[gInstellingen] Configuratie voor gebruikersInstellingen lijst niet gevonden.");
        }

        // 3. Haal actueel werkrooster (UrenPerWeek) op
        // De UrenPerWeek lijst gebruikt 'MedewerkerID' (loginNaam) om te filteren.
        const urenPerWeekConfigKey = "UrenPerWeek";
        const urenPerWeekConfig = getLijstConfig(urenPerWeekConfigKey);
        if (urenPerWeekConfig) {
            const filter = `$filter=MedewerkerID eq '${encodeURIComponent(huidigeGebruikerInstellingen.loginNaam)}' and VeranderingsDatum eq null`;
            const orderby = "$orderby=Ingangsdatum desc";
            const selectFields = urenPerWeekConfig.velden.map(v => v.interneNaam).filter(n => n !== 'ID' && n !== 'Title' && n !== 'MedewerkerID' && n !== 'VeranderingsDatum').join(','); // Selecteer relevante dagen etc.
            const select = `$select=Ingangsdatum,${selectFields}`;
            const urenArray = await haalInstellingenLijstItems(urenPerWeekConfigKey, select, filter, "", orderby);
            if (urenArray.length > 0) {
                huidigeGebruikerInstellingen.urenPerWeekActueel = urenArray[0];
            }
        } else {
            console.error("[gInstellingen] Configuratie voor UrenPerWeek lijst niet gevonden.");
        }
        
        vulPersoonlijkeGegevensTab();
        vulRoosterInstellingenTab(); // Dit past ook het thema toe
        toonInstellingenStatusBericht("Gegevens succesvol geladen.", "success");

    } catch (error) {
        console.error("[gInstellingen] Fout bij laden gebruikersgegevens:", error);
        toonInstellingenStatusBericht("Fout bij het laden van uw gegevens. Probeer het later opnieuw.", "error", false);
    }
}

/**
 * Vult de 'Persoonlijke Gegevens' tab met data.
 */
function vulPersoonlijkeGegevensTab() {
    if (huidigeGebruikerInstellingen.medewerkerData) {
        domInstellingenRefs.pgNaamInput.value = huidigeGebruikerInstellingen.medewerkerData.Naam || huidigeGebruikerInstellingen.Title || '';
        domInstellingenRefs.pgUsernameInput.value = huidigeGebruikerInstellingen.medewerkerData.Username || huidigeGebruikerInstellingen.loginNaam || '';
        domInstellingenRefs.pgEmailInput.value = huidigeGebruikerInstellingen.medewerkerData.E_x002d_mail || huidigeGebruikerInstellingen.Email || '';
        domInstellingenRefs.pgTeamInput.value = huidigeGebruikerInstellingen.medewerkerData.Team || 'N.v.t.';
        domInstellingenRefs.pgFunctieInput.value = huidigeGebruikerInstellingen.medewerkerData.Functie || 'N.v.t.';
    } else { // Fallback als medewerkerData niet geladen kon worden
        domInstellingenRefs.pgNaamInput.value = huidigeGebruikerInstellingen.Title || '';
        domInstellingenRefs.pgUsernameInput.value = huidigeGebruikerInstellingen.loginNaam || '';
        domInstellingenRefs.pgEmailInput.value = huidigeGebruikerInstellingen.Email || '';
        domInstellingenRefs.pgTeamInput.value = 'N.v.t.';
        domInstellingenRefs.pgFunctieInput.value = 'N.v.t.';
    }

    domInstellingenRefs.werkdagenContainer.innerHTML = ''; // Leegmaken
    if (huidigeGebruikerInstellingen.urenPerWeekActueel) {
        const rooster = huidigeGebruikerInstellingen.urenPerWeekActueel;
        const dagen = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];
        const ul = document.createElement('ul');
        ul.className = 'list-disc list-inside space-y-1 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700'; // Thema afhankelijke tekstkleur

        dagen.forEach(dag => {
            const start = rooster[`${dag}Start`];
            const eind = rooster[`${dag}Eind`];
            const soort = rooster[`${dag}Soort`];
            const li = document.createElement('li');
            if (start && eind) {
                li.textContent = `${dag}: ${start} - ${eind} (${soort || 'Werken'})`;
            } else if (soort && soort.toLowerCase() !== 'werken') { // Alleen 'soort' tonen als het afwijkend is (niet 'werken')
                li.textContent = `${dag}: ${soort}`;
            } else {
                 li.textContent = `${dag}: Niet ingeroosterd`;
                 li.classList.add('text-gray-500', 'dark:text-gray-500', 'light:text-gray-500');
            }
            ul.appendChild(li);
        });
        domInstellingenRefs.werkdagenContainer.appendChild(ul);
        if (rooster.Ingangsdatum) {
            const pDatum = document.createElement('p');
            pDatum.className = 'text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mt-2';
            pDatum.textContent = `Huidig rooster geldig vanaf: ${new Date(rooster.Ingangsdatum).toLocaleDateString('nl-NL')}`;
            domInstellingenRefs.werkdagenContainer.appendChild(pDatum);
        }
    } else {
        domInstellingenRefs.werkdagenContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-500 light:text-gray-600">Geen standaard werkrooster gevonden.</p>';
    }
}

/**
 * Vult de 'Rooster Instellingen' tab met data en past thema toe.
 */
function vulRoosterInstellingenTab() {
    const inst = huidigeGebruikerInstellingen.gebruikersInstellingenSP;
    if (inst) {
        domInstellingenRefs.instThemaSelect.value = inst.soortWeergave || 'dark';
        domInstellingenRefs.instEigenTeamCheckbox.checked = inst.EigenTeamWeergeven || false;
        // WeekendenWeergeven: default naar true als het null of undefined is (omdat checkbox default checked is in HTML)
        domInstellingenRefs.instWeekendenCheckbox.checked = (inst.WeekendenWeergeven === null || inst.WeekendenWeergeven === undefined) ? true : inst.WeekendenWeergeven;
        
        pasThemaToe(domInstellingenRefs.instThemaSelect.value); // Pas huidig thema toe
    } else {
        // Fallback als geen instellingen gevonden zijn, zet defaults en pas thema toe
        domInstellingenRefs.instThemaSelect.value = 'dark';
        domInstellingenRefs.instEigenTeamCheckbox.checked = false;
        domInstellingenRefs.instWeekendenCheckbox.checked = true;
        pasThemaToe('dark');
    }
}

/**
 * Past het geselecteerde thema (licht/donker) toe op de body en relevante elementen.
 * @param {'light'|'dark'} thema
 */
function pasThemaToe(thema) {
    const isLichtThema = thema === 'light';
    domInstellingenRefs.appBody.classList.toggle('light-theme', isLichtThema);
    domInstellingenRefs.appBody.classList.toggle('dark-theme', !isLichtThema); // Hoewel dark default is via HTML class

    // Update tekstkleuren voor headers die in HTML wit zijn (voor donker thema)
    const textClassLicht = 'text-gray-800'; // Voor licht thema
    const textClassDonker = 'text-white';   // Voor donker thema

    [domInstellingenRefs.pageTitleHeader, domInstellingenRefs.persGegevensTitle, domInstellingenRefs.roosterInstTitle, domInstellingenRefs.werkdagenTitle].forEach(el => {
        if (el) {
            el.classList.toggle(textClassLicht, isLichtThema);
            el.classList.toggle(textClassDonker, !isLichtThema);
        }
    });
    if (domInstellingenRefs.pageSubtitleHeader) { // Subtitel heeft andere grijstinten
         domInstellingenRefs.pageSubtitleHeader.classList.toggle('text-gray-600', isLichtThema); // lichte variant voor licht thema
         domInstellingenRefs.pageSubtitleHeader.classList.toggle('text-gray-400', !isLichtThema); // donkere variant voor donker thema
    }
    
    // Sla thema op in localStorage voor persistentie over sessies/pagina's
    localStorage.setItem('verlofroosterThema', thema);
    console.log("[gInstellingen] Thema toegepast en opgeslagen in localStorage:", thema);
}


/**
 * Handelt het opslaan van de rooster instellingen af.
 * @param {Event} event
 */
async function handleInstellingenOpslaan(event) {
    event.preventDefault();
    toonInstellingenStatusBericht("Bezig met opslaan van instellingen...", "info", false);
    domInstellingenRefs.opslaanInstellingenButton.disabled = true;

    const nieuweInstellingen = {
        soortWeergave: domInstellingenRefs.instThemaSelect.value,
        EigenTeamWeergeven: domInstellingenRefs.instEigenTeamCheckbox.checked,
        WeekendenWeergeven: domInstellingenRefs.instWeekendenCheckbox.checked
    };

    try {
        const gebruikersInstConfigKey = "gebruikersInstellingen";
        const gebruikersInstConfig = getLijstConfig(gebruikersInstConfigKey);
        if (!gebruikersInstConfig) {
            throw new Error(`Configuratie voor lijst '${gebruikersInstConfigKey}' niet gevonden in configLijst.js.`);
        }
        if (!huidigeGebruikerInstellingen.loginNaam) {
            throw new Error("Gebruikers loginNaam is niet beschikbaar. Kan instellingen niet opslaan.");
        }

        // Het 'Title' veld in 'gebruikersInstellingen' lijst MOET de loginNaam van de gebruiker zijn.
        const itemData = {
            __metadata: { "type": `SP.Data.${gebruikersInstConfig.lijstTitel.replace(/\s+/g, '_')}ListItem` },
            Title: huidigeGebruikerInstellingen.loginNaam, // Cruciaal voor koppeling!
            soortWeergave: nieuweInstellingen.soortWeergave,
            EigenTeamWeergeven: nieuweInstellingen.EigenTeamWeergeven,
            WeekendenWeergeven: nieuweInstellingen.WeekendenWeergeven
        };

        let apiUrl;
        let method;
        const itemBestaat = huidigeGebruikerInstellingen.gebruikersInstellingenSP && huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID;

        if (itemBestaat) {
            apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/web/lists(guid'${gebruikersInstConfig.lijstId}')/items(${huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID})`;
            method = 'POST'; // MERGE voor update
            console.log(`[gInstellingen] Bijwerken bestaand instellingen item ID: ${huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID} voor gebruiker ${itemData.Title}`);
        } else {
            apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/web/lists(guid'${gebruikersInstConfig.lijstId}')/items`;
            method = 'POST'; // Create
            console.log(`[gInstellingen] Aanmaken nieuw instellingen item voor gebruiker ${itemData.Title}`);
        }
        
        const requestDigest = await getInstellingenRequestDigest();
        const headers = {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-RequestDigest': requestDigest
        };
        if (itemBestaat) {
            headers['IF-MATCH'] = '*';
            headers['X-HTTP-Method'] = 'MERGE';
        }

        const response = await fetch(apiUrl, {
            method: method,
            headers: headers,
            body: JSON.stringify(itemData)
        });

        if (!response.ok && !(method === 'POST' && response.status === 201 && !itemBestaat) && !(method === 'POST' && response.status === 204 && itemBestaat) ) {
            const errorText = await response.text();
            console.error("[gInstellingen] Fout bij opslaan instellingen:", response.status, errorText);
            let errorDetail = "Onbekende serverfout.";
            try {
                const errorJson = JSON.parse(errorText);
                errorDetail = errorJson.error?.message?.value || errorText;
            } catch (e) { /* ignore parsing error, use text */ }
            throw new Error(`Serverfout (${response.status}): ${errorDetail}. Controleer SharePoint permissies en lijstconfiguratie.`);
        }
        
        if (!itemBestaat && response.status === 201) { // Nieuw item succesvol aangemaakt
            const nieuwItem = await response.json();
            huidigeGebruikerInstellingen.gebruikersInstellingenSP = nieuwItem.d; 
             console.log("[gInstellingen] Nieuw instellingen item succesvol aangemaakt:", nieuwItem.d);
        } else { // Item succesvol bijgewerkt (of was al aangemaakt en dit is een herhaalde POST)
             huidigeGebruikerInstellingen.gebruikersInstellingenSP = { ...huidigeGebruikerInstellingen.gebruikersInstellingenSP, ...itemData, ID: itemBestaat ? huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID : undefined };
             if(!itemBestaat && !huidigeGebruikerInstellingen.gebruikersInstellingenSP.ID) {
                // Probeer het item opnieuw op te halen om het ID te krijgen als het een create was maar geen JSON teruggaf
                await laadGebruikersGegevens(); // Herlaad om het ID te krijgen
             }
             console.log("[gInstellingen] Instellingen item succesvol bijgewerkt/aangemaakt.");
        }

        toonInstellingenStatusBericht("Instellingen succesvol opgeslagen!", "success");
        pasThemaToe(nieuweInstellingen.soortWeergave);

        if (window.opener && typeof window.opener.updateGebruikersInstellingen === 'function') {
            window.opener.updateGebruikersInstellingen(huidigeGebruikerInstellingen.gebruikersInstellingenSP);
        } else if (window.parent && window.parent !== window && typeof window.parent.updateGebruikersInstellingen === 'function') {
            window.parent.updateGebruikersInstellingen(huidigeGebruikerInstellingen.gebruikersInstellingenSP);
        }

    } catch (error) {
        console.error("[gInstellingen] Fout tijdens opslaan instellingen:", error);
        toonInstellingenStatusBericht(`Fout: ${error.message || "Kon instellingen niet opslaan."}`, "error", false);
        // BELANGRIJK: Controleer de SharePoint logs (ULS) of Fiddler trace voor meer details als de foutmelding van de server onduidelijk is.
        // Mogelijke oorzaken:
        // 1. Geen Contribute/Edit permissies op de 'gebruikersInstellingen' lijst.
        // 2. Het veld 'Title' in de 'gebruikersInstellingen' lijst is niet ingesteld om de loginNaam te accepteren of is uniek en er bestaat al een item.
        // 3. Interne namen ('soortWeergave', 'EigenTeamWeergeven', 'WeekendenWeergeven') in SharePoint komen niet overeen met configLijst.js.
        // 4. Velden zijn van een ander type in SharePoint dan verwacht (bv. Boolean vs Text).
    } finally {
        domInstellingenRefs.opslaanInstellingenButton.disabled = false;
    }
}

/**
 * Haalt een X-RequestDigest op.
 */
async function getInstellingenRequestDigest() {
    if (!spWebAbsoluteUrlInstellingen) throw new Error("Web absolute URL niet beschikbaar voor Request Digest.");
    const apiUrl = `${spWebAbsoluteUrlInstellingen.replace(/\/$/, "")}/_api/contextinfo`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json;odata=verbose' }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("[gInstellingen] Kon Request Digest niet ophalen:", response.status, errorText);
        throw new Error(`Kon Request Digest niet ophalen (${response.status}).`);
    }
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
}

/**
 * Toont een statusbericht met thema-adaptieve styling.
 * @param {string} bericht
 * @param {'info'|'success'|'error'} type
 * @param {boolean} autoHide - Of het bericht automatisch verborgen moet worden.
 */
function toonInstellingenStatusBericht(bericht, type = 'info', autoHide = true) {
    if (domInstellingenRefs.instellingenStatusBericht) {
        domInstellingenRefs.instellingenStatusBericht.innerHTML = bericht; // Gebruik innerHTML om eventuele links klikbaar te maken
        domInstellingenRefs.instellingenStatusBericht.className = 'mt-4 p-3 text-sm rounded-lg border'; // Reset classes, voeg border toe

        switch (type) {
            case 'success': 
                domInstellingenRefs.instellingenStatusBericht.classList.add('bg-green-100', 'border-green-400', 'text-green-700', 'dark:bg-green-700', 'dark:text-green-100', 'dark:border-green-600'); 
                break;
            case 'error': 
                domInstellingenRefs.instellingenStatusBericht.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'dark:bg-red-700', 'dark:text-red-100', 'dark:border-red-600'); 
                break;
            case 'info': 
            default: 
                domInstellingenRefs.instellingenStatusBericht.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700', 'dark:bg-blue-700', 'dark:text-blue-100', 'dark:border-blue-600'); 
                break;
        }
        domInstellingenRefs.instellingenStatusBericht.classList.remove('hidden');

        if (autoHide) {
            setTimeout(() => {
                if (domInstellingenRefs.instellingenStatusBericht) { // Check of element nog bestaat
                    domInstellingenRefs.instellingenStatusBericht.classList.add('hidden');
                }
            }, 7000); // Langere tijd voor statusberichten
        }
    }
}

/**
 * Initialiseert de tab functionaliteit.
 */
function initializeTabs() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTab = urlParams.get('tab') || 'persoonlijk'; 

    domInstellingenRefs.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            activateTab(tabId);
            // Update URL zonder pagina te herladen voor deeplinking/bookmarking
            const newUrl = `${window.location.pathname}?tab=${tabId}`;
            window.history.replaceState({path:newUrl},'',newUrl);
        });
    });
    activateTab(requestedTab); 
}

function activateTab(tabId) {
    domInstellingenRefs.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    domInstellingenRefs.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `tab-content-${tabId}`);
    });
    console.log(`[gInstellingen] Tab geactiveerd: ${tabId}`);
}

/**
 * Hoofd initialisatiefunctie voor de pagina.
 */
async function initializeInstellingenPagina() {
    console.log("[gInstellingen] Initialiseren pagina...");
    if (domInstellingenRefs.currentYearSpan) {
        domInstellingenRefs.currentYearSpan.textContent = new Date().getFullYear();
    }
    
    initializeTabs(); // Moet voor context en data laden, zodat juiste tab direct getoond wordt

    const contextOK = await initializeInstellingenContext();
    if (!contextOK) {
        toonInstellingenStatusBericht("Kan gebruikersinformatie niet laden. Controleer de console voor details en probeer de pagina te vernieuwen.", "error", false);
        return;
    }

    await laadGebruikersGegevens(); // Laadt en vult alle data, past ook initieel thema toe

    if (domInstellingenRefs.instellingenForm) {
        domInstellingenRefs.instellingenForm.addEventListener('submit', handleInstellingenOpslaan);
    }
    
    // Event listener voor thema select om direct thema aan te passen bij wijziging
    if (domInstellingenRefs.instThemaSelect) {
        domInstellingenRefs.instThemaSelect.addEventListener('change', (event) => {
            pasThemaToe(event.target.value);
        });
    }

    console.log("[gInstellingen] Pagina initialisatie voltooid.");
}

// Start de initialisatie wanneer de DOM en configLijst.js geladen zijn.
// Controleer of configLijst.js en de functie getLijstConfig bestaan.
if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeInstellingenPagina);
} else {
    console.warn("[gInstellingen] configLijst.js of getLijstConfig is nog niet beschikbaar. Wachten...");
    const configIntervalInst = setInterval(() => {
        if (typeof getLijstConfig === 'function' && typeof sharepointLijstConfiguraties !== 'undefined') {
            clearInterval(configIntervalInst);
            console.log("[gInstellingen] configLijst.js nu beschikbaar. DOMContentLoaded listener toevoegen.");
            // Als DOM al geladen is, direct uitvoeren, anders wachten op DOMContentLoaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeInstellingenPagina);
            } else {
                initializeInstellingenPagina();
            }
        }
    }, 100);
    setTimeout(() => { // Fallback timeout
        if (typeof getLijstConfig !== 'function') {
            clearInterval(configIntervalInst);
            console.error("[gInstellingen] Kritische fout: configLijst.js niet geladen na 5 seconden. Pagina kan niet correct initialiseren.");
            if(domInstellingenRefs.instellingenStatusBericht) toonInstellingenStatusBericht("Kritische fout: Applicatieconfiguratie kon niet geladen worden. Neem contact op met de beheerder.", "error", false);
        }
    }, 5000);
}

console.log("Pages/JS/gInstellingen_logic.js geladen.");
