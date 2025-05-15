<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beheercentrum - Verlofrooster</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/beheerCentrum_styles.css">
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
            color: #3b82f6;
            background-color: #374151; /* gray-700 (donker thema) */
        }
        body.light-theme .tab-button.active { /* Overridden in beheerCentrum_styles.css */ }

        .tab-content { display: none; }
        .tab-content.active { display: block; }

        /* Stijlen voor bewerkbare tabellen */
        .editable-table th, .editable-table td {
            padding: 0.75rem; /* p-3 */
            text-align: left;
            border-bottom-width: 1px;
        }
        /* Input stijlen binnen tabellen */
        .editable-table input[type="text"],
        .editable-table input[type="color"],
        .editable-table select {
            width: 100%;
            padding: 0.5rem; /* p-2 */
            border-radius: 0.375rem; /* rounded-md */
        }
        /* Dark theme table inputs (default) */
        .editable-table input, .editable-table select {
            background-color: #4b5563; /* gray-600 */
            border: 1px solid #6b7280; /* gray-500 */
            color: #f3f4f6; /* gray-100 */
        }
        /* Light theme table inputs (via CSS file) */
    </style>
</head>
<body class="bg-gray-800 text-gray-100"> <div id="app-container" class="container mx-auto p-4 md:p-8">
        <header class="mb-6 md:mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-white">Beheercentrum</h1>
            <p class="text-gray-400 mt-1">Beheer hier de kernlijsten en instellingen van het Verlofrooster.</p>
            <div id="beheer-status-bericht-algemeen" class="hidden mt-4 p-3 text-sm rounded-lg"></div>
        </header>

        <div class="mb-6 border-b border-gray-600">
            <nav class="flex flex-wrap -mb-px space-x-1 md:space-x-2" aria-label="Tabs">
                <button data-tab="dagen-indicators" class="tab-button active py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-400 rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Dagen Indicatoren
                </button>
                <button data-tab="keuzelijst-functies" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-400 rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Functies
                </button>
                <button data-tab="verlofredenen" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-400 rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Verlofredenen
                </button>
                <button data-tab="seniors" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-400 rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Seniors
                </button>
                <button data-tab="teams" class="tab-button py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-400 rounded-t-lg hover:text-blue-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap">
                    Teams
                </button>
                </nav>
        </div>

        <main id="tab-content-container">
            <div id="tab-content-dagen-indicators" class="tab-content active space-y-6">
                <h2 class="text-xl font-semibold text-white">Beheer Dagen Indicatoren</h2>
                <div class="bg-gray-700 p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                        <button id="nieuw-dagenindicator-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Indicator</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Titel (Afkorting)</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Beschrijving</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kleur</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Patroon</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="dagen-indicators-tabel-body" class="divide-y divide-gray-600">
                                </tbody>
                        </table>
                    </div>
                    <div id="dagen-indicators-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-keuzelijst-functies" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold text-white">Beheer Functies (Keuzelijst)</h2>
                <div class="bg-gray-700 p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-functie-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Functie</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Functienaam (Titel)</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="keuzelijst-functies-tabel-body" class="divide-y divide-gray-600">
                                </tbody>
                        </table>
                    </div>
                     <div id="keuzelijst-functies-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-verlofredenen" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold text-white">Beheer Verlofredenen</h2>
                 <div class="bg-gray-700 p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-verlofreden-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Verlofreden</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Titel (voor dropdowns)</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Naam (voor legenda)</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kleur</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Telt als Verlofdag?</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="verlofredenen-tabel-body" class="divide-y divide-gray-600">
                                </tbody>
                        </table>
                    </div>
                    <div id="verlofredenen-status" class="mt-3 text-sm"></div>
                </div>
            </div>

            <div id="tab-content-seniors" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold text-white">Beheer Seniors per Team</h2>
                 <div class="bg-gray-700 p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-senior-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuwe Senior Toewijzen</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Medewerker (Senior)</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="seniors-tabel-body" class="divide-y divide-gray-600">
                                </tbody>
                        </table>
                    </div>
                    <div id="seniors-status" class="mt-3 text-sm"></div>
                </div>
            </div>
            
            <div id="tab-content-teams" class="tab-content space-y-6">
                <h2 class="text-xl font-semibold text-white">Beheer Teams</h2>
                 <div class="bg-gray-700 p-4 md:p-6 rounded-lg shadow-md">
                    <div class="flex justify-end mb-4">
                         <button id="nieuw-team-button" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm">Nieuw Team</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full editable-table">
                            <thead class="bg-gray-600">
                                <tr>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teamnaam (Titel/Naam)</th>tin
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teamleider</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kleur</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actief?</th>
                                    <th class="text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Acties</th>
                                </tr>
                            </thead>
                            <tbody id="teams-tabel-body" class="divide-y divide-gray-600">
                                </tbody>
                        </table>
                    </div>
                    <div id="teams-status" class="mt-3 text-sm"></div>
                </div>
            </div>

        </main>

        <footer class="text-center mt-8 md:mt-12 py-4 border-t border-gray-700">
            <a href="../Verlofrooster.html" class="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                &larr; Terug naar het Verlofrooster
            </a>
            <p class="text-xs text-gray-500 mt-2">&copy; <span id="current-year"></span> Verlofrooster Applicatie</p>
        </footer>
    </div>

    <div id="beheer-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all scale-95 opacity-0">
            <div class="flex justify-between items-center mb-4">
                <h3 id="beheer-modal-title" class="text-lg font-semibold text-white">Item Bewerken/Toevoegen</h3>
                <button id="beheer-modal-close-x" class="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <form id="beheer-modal-form" class="space-y-4">
                <div id="beheer-modal-fields-container"></div>
                <div id="beheer-modal-status" class="mt-3 text-sm"></div>
            </form>
            <div class="mt-6 flex justify-end space-x-3">
                <button id="beheer-modal-cancel-button" class="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all">Annuleren</button>
                <button id="beheer-modal-save-button" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm shadow hover:shadow-md transition-all">Opslaan</button>
            </div>
        </div>
    </div>


    <script src="../js/configLijst.js"></script>
    <script src="JS/beheerCentrum_logic.js"></script> 

</body>
</html>
