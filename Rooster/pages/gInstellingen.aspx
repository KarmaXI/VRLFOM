<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gebruikersinstellingen - Verlofrooster</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar (consistent met hoofdpagina) */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #2d3748; border-radius: 4px; } /* gray-700 */
        ::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; } /* gray-600 */
        ::-webkit-scrollbar-thumb:hover { background: #718096; } /* gray-500 */

        /* Stijlen voor actieve tab */
        .tab-button.active {
            border-color: #3b82f6; /* blue-500 */
            color: #3b82f6; /* blue-500 */
            background-color: #374151; /* gray-700 (donker thema) */
        }
        body.light-theme .tab-button.active {
            border-color: #2563eb; /* blue-600 */
            color: #2563eb; /* blue-600 */
            background-color: #f3f4f6; /* gray-100 (licht thema) */
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }

        /* Light theme scrollbar overrides */
        body.light-theme ::-webkit-scrollbar-track { background: #e5e7eb !important; } /* gray-200 */
        body.light-theme ::-webkit-scrollbar-thumb { background: #9ca3af !important; } /* gray-400 */
        body.light-theme ::-webkit-scrollbar-thumb:hover { background: #6b7280 !important; } /* gray-500 */
    </style>
</head>
<body class="bg-gray-800 text-gray-100"> <div id="app-container" class="container mx-auto p-4 md:p-8 max-w-4xl">
        <header class="mb-6 md:mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-white">Gebruikersinstellingen</h1>
            <p class="text-gray-400 mt-1">Beheer hier uw persoonlijke gegevens en rooster voorkeuren.</p>
        </header>

        <div class="mb-6 border-b border-gray-600">
            <nav class="flex space-x-1 md:space-x-2" aria-label="Tabs">
                <button data-tab="persoonlijk" class="tab-button active hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-400 rounded-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Persoonlijke Gegevens & Werkdagen
                </button>
                <button data-tab="instellingen" class="tab-button hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-400 rounded-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Rooster Instellingen
                </button>
            </nav>
        </div>

        <div>
            <div id="tab-content-persoonlijk" class="tab-content active">
                <h2 class="text-xl font-semibold mb-4 text-white">Persoonlijke Gegevens</h2>
                <form id="persoonlijke-gegevens-form" class="space-y-6 bg-gray-700 p-6 rounded-lg shadow-md">
                    <fieldset disabled class="space-y-4 opacity-75">
                        <div>
                            <label for="pg-naam" class="block text-sm font-medium text-gray-300">Volledige Naam</label>
                            <input type="text" id="pg-naam" name="naam" class="mt-1 bg-gray-600 border border-gray-500 text-gray-200 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" readonly>
                        </div>
                        <div>
                            <label for="pg-username" class="block text-sm font-medium text-gray-300">Gebruikersnaam (Login)</label>
                            <input type="text" id="pg-username" name="username" class="mt-1 bg-gray-600 border border-gray-500 text-gray-200 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" readonly>
                        </div>
                        <div>
                            <label for="pg-email" class="block text-sm font-medium text-gray-300">E-mailadres</label>
                            <input type="email" id="pg-email" name="email" class="mt-1 bg-gray-600 border border-gray-500 text-gray-200 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" readonly>
                        </div>
                        <div>
                            <label for="pg-team" class="block text-sm font-medium text-gray-300">Team</label>
                            <input type="text" id="pg-team" name="team" class="mt-1 bg-gray-600 border border-gray-500 text-gray-200 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" readonly>
                        </div>
                        <div>
                            <label for="pg-functie" class="block text-sm font-medium text-gray-300">Functie</label>
                            <input type="text" id="pg-functie" name="functie" class="mt-1 bg-gray-600 border border-gray-500 text-gray-200 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" readonly>
                        </div>
                    </fieldset>
                    <p class="text-xs text-gray-400">Deze gegevens worden beheerd door de administrator. Neem contact op met de beheerder voor wijzigingen.</p>
                    
                    <h3 class="text-lg font-semibold pt-6 border-t border-gray-600 text-white">Standaard Werkdagen en Tijden</h3>
                    <p class="text-sm text-gray-400 mb-4">Hieronder ziet u uw huidige standaard werkrooster zoals bekend in het systeem. Wijzigingen hieraan kunnen via uw teamleider of beheerder worden aangevraagd.</p>
                    <div id="werkdagen-container" class="space-y-3">
                        <p class="text-gray-500">Werkrooster informatie wordt geladen...</p>
                    </div>
                </form>
            </div>

            <div id="tab-content-instellingen" class="tab-content">
                <h2 class="text-xl font-semibold mb-4 text-white">Rooster Weergave Instellingen</h2>
                <form id="rooster-instellingen-form" class="space-y-6 bg-gray-700 p-6 rounded-lg shadow-md">
                    <div>
                        <label for="inst-thema" class="block text-sm font-medium text-gray-300 mb-1">Thema Voorkeur</label>
                        <select id="inst-thema" name="soortWeergave" class="bg-gray-600 border border-gray-500 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                            <option value="dark">Donker Thema</option>
                            <option value="light">Licht Thema</option>
                        </select>
                    </div>

                    <div class="flex items-center">
                        <input id="inst-eigen-team" name="eigenTeamWeergeven" type="checkbox" class="h-4 w-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500">
                        <label for="inst-eigen-team" class="ml-2 block text-sm text-gray-300">Standaard alleen eigen team tonen in rooster</label>
                    </div>

                    <div class="flex items-center">
                        <input id="inst-weekenden" name="weekendenWeergeven" type="checkbox" class="h-4 w-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500">
                        <label for="inst-weekenden" class="ml-2 block text-sm text-gray-300">Weekenden (zaterdag/zondag) weergeven in het rooster</label>
                    </div>
                    
                    <div class="pt-4 border-t border-gray-600">
                        <button type="submit" id="opslaan-instellingen-button" class="w-full md:w-auto text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Instellingen Opslaan
                        </button>
                    </div>
                </form>
                 <div id="instellingen-status-bericht" class="hidden mt-4 p-3 text-sm rounded-lg"></div> </div>
        </div>

        <footer class="text-center mt-8 md:mt-12 py-4 border-t border-gray-700">
            <a href="../Verlofrooster.aspx" class="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                &larr; Terug naar het Verlofrooster
            </a>
            <p class="text-xs text-gray-500 mt-2">&copy; <span id="current-year"></span> Verlofrooster Applicatie</p>
        </footer>
    </div>

    <link rel="stylesheet" href="css/gInstellingen_styles.css"> 
    <script src="../js/configLijst.js"></script>
    <script src="JS/gInstellingen_logic.js"></script>
</body>
</html>
