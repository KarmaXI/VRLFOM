<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verlof aanvragen</title>
    <link rel="stylesheet" href="../css/verlofrooster_styles.css">
    <link rel="stylesheet" href="../css/profielKaart.css">
    <style>
        body { 
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
        }
        .form-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .verlof-form {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 600px;
            padding: 24px;
            border: 1px solid #e5e7eb;
        }
        .form-header {
            margin-bottom: 24px;
        }
        .form-title {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 8px 0;
        }
        .back-link {
            color: #3b82f6;
            text-decoration: none;
            font-size: 14px;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
            color: #374151;
        }
        .required:after {
            content: " *";
            color: #ef4444;
        }
        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .form-input[readonly] {
            background-color: #f3f4f6;
        }
        .form-textarea {
            resize: vertical;
            min-height: 80px;
        }
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 24px;
        }
        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
        }
        .btn-primary {
            background-color: #3b82f6;
            color: white;
        }
        .btn-primary:hover {
            background-color: #2563eb;
        }
        .btn-secondary {
            background-color: #e5e7eb;
            color: #4b5563;
        }
        .btn-secondary:hover {
            background-color: #d1d5db;
        }
        .dark-mode {
            background-color: #1f2937;
            color: #f9fafb;
        }
        .dark-mode .verlof-form {
            background-color: #111827;
            border-color: #374151;
        }
        .dark-mode .form-label {
            color: #e5e7eb;
        }
        .dark-mode .form-input,
        .dark-mode .form-select,
        .dark-mode .form-textarea {
            background-color: #1f2937;
            border-color: #4b5563;
            color: #f9fafb;
        }
        .dark-mode .form-input[readonly] {
            background-color: #111827;
        }
        .dark-mode .btn-secondary {
            background-color: #374151;
            color: #e5e7eb;
        }
        .dark-mode .btn-secondary:hover {
            background-color: #4b5563;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <form id="verlof-form" class="verlof-form">
            <!-- Hidden field for Title -->
            <input type="hidden" id="Title" name="Title">
            
            <div class="form-header">
                <h1 class="form-title">Verlof aanvragen</h1>
                <a href="../verlofRooster.aspx" class="back-link">← Terug naar rooster</a>
            </div>
            
            <div class="form-group">
                <label for="Medewerker" class="form-label">Medewerker</label>
                <input type="text" id="Medewerker" name="Medewerker" class="form-input" readonly>
            </div>
            
            <div class="form-group form-row">
                <div>
                    <label for="StartDatePicker" class="form-label required">Startdatum</label>
                    <input type="date" id="StartDatePicker" name="StartDatePicker" class="form-input" required>
                </div>
                <div>
                    <label for="StartTimePicker" class="form-label required">Starttijd</label>
                    <input type="time" id="StartTimePicker" name="StartTimePicker" class="form-input" required>
                </div>
            </div>
            <input type="hidden" id="StartDatum" name="StartDatum">
            
            <div class="form-group form-row">
                <div>
                    <label for="EndDatePicker" class="form-label required">Einddatum</label>
                    <input type="date" id="EndDatePicker" name="EndDatePicker" class="form-input" required>
                </div>
                <div>
                    <label for="EndTimePicker" class="form-label required">Eindtijd</label>
                    <input type="time" id="EndTimePicker" name="EndTimePicker" class="form-input" required>
                </div>
            </div>
            <input type="hidden" id="EindDatum" name="EindDatum">
            
            <div class="form-group">
                <label for="Omschrijving" class="form-label">Omschrijving</label>
                <textarea id="Omschrijving" name="Omschrijving" class="form-textarea" placeholder="Eventuele toelichting"></textarea>
            </div>
            
            <div class="form-group">
                <label for="Reden" class="form-label">Verlofreden</label>
                <select id="Reden" name="Reden" class="form-select">
                    <option value="">-- Kies reden --</option>
                </select>
            </div>
            
            <input type="hidden" id="Status" name="Status" value="Nieuw">
            
            <div class="form-actions">
                <a href="../verlofRooster.aspx" class="btn btn-secondary">Annuleren</a>
                <button type="submit" class="btn btn-primary">Verstuur</button>
            </div>
        </form>
    </div>

    <script src="../js/configLijst.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Get current user info
            fetch('/_api/web/currentUser?$select=LoginName,Title', {
                headers: { 'Accept': 'application/json;odata=verbose' }
            })
            .then(res => res.json())
            .then(userData => {
                const loginName = userData.d.LoginName;
                const displayName = userData.d.Title;
                
                // Apply theme from gebruikersInstellingen
                const cfg = getLijstConfig('gebruikersInstellingen');
                if (cfg) {
                    fetch(`/_api/web/lists(guid'${cfg.lijstId}')/items?$filter=Title eq '${loginName}'&$select=soortWeergave`, {
                        headers: { 'Accept': 'application/json;odata=verbose' }
                    })
                    .then(r => r.json())
                    .then(data => {
                        const items = data.d.results;
                        if (items.length && items[0].soortWeergave === 'dark') {
                            document.body.classList.add('dark-mode');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching user settings:', error);
                    });
                }
                
                // Set Medewerker and Title
                document.getElementById('Medewerker').value = displayName;
                const today = new Date();
                const dateStr = today.toLocaleDateString('nl-NL');
                document.getElementById('Title').value = `Verlofaanvraag ${displayName} - ${dateStr}`;
                
                // Load Verlofredenen for dropdown
                const redenCfg = getLijstConfig('Verlofredenen');
                if (redenCfg) {
                    fetch(`/_api/web/lists(guid'${redenCfg.lijstId}')/items?$select=Title,Naam`, {
                        headers: { 'Accept': 'application/json;odata=verbose' }
                    })
                    .then(r => r.json())
                    .then(d => {
                        const sel = document.getElementById('Reden');
                        d.d.results.forEach(i => {
                            const opt = document.createElement('option');
                            opt.value = i.Title;
                            opt.textContent = i.Naam;
                            sel.appendChild(opt);
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching reasons:', error);
                        
                        // Fallback options if API fails
                        const fallbackReasons = [
                            { value: 'vakantie', text: 'Vakantie' },
                            { value: 'ziekte', text: 'Ziekte' },
                            { value: 'persoonlijk', text: 'Persoonlijke omstandigheden' },
                            { value: 'studie', text: 'Studie' }
                        ];
                        
                        const sel = document.getElementById('Reden');
                        fallbackReasons.forEach(reason => {
                            const opt = document.createElement('option');
                            opt.value = reason.value;
                            opt.textContent = reason.text;
                            sel.appendChild(opt);
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                
                // Set default values if API fails
                document.getElementById('Medewerker').value = 'Gebruiker';
                const today = new Date();
                const dateStr = today.toLocaleDateString('nl-NL');
                document.getElementById('Title').value = `Verlofaanvraag Gebruiker - ${dateStr}`;
            });
            
            // Form submission
            document.getElementById('verlof-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Combine Start date and time
                const sd = document.getElementById('StartDatePicker').value;
                const st = document.getElementById('StartTimePicker').value;
                if (!sd || !st) {
                    alert('Vul alle verplichte velden in');
                    return;
                }
                const startDateTime = new Date(`${sd}T${st}`);
                document.getElementById('StartDatum').value = startDateTime.toISOString();
                
                // Combine End date and time
                const ed = document.getElementById('EndDatePicker').value;
                const et = document.getElementById('EndTimePicker').value;
                if (!ed || !et) {
                    alert('Vul alle verplichte velden in');
                    return;
                }
                const endDateTime = new Date(`${ed}T${et}`);
                document.getElementById('EindDatum').value = endDateTime.toISOString();
                
                // Create payload for SharePoint REST API
                const formData = {
                    __metadata: { type: 'SP.Data.VerlofListItem' },
                    Title: document.getElementById('Title').value,
                    Medewerker: document.getElementById('Medewerker').value,
                    StartDatum: document.getElementById('StartDatum').value,
                    EindDatum: document.getElementById('EindDatum').value,
                    Omschrijving: document.getElementById('Omschrijving').value,
                    Reden: document.getElementById('Reden').value,
                    Status: document.getElementById('Status').value
                };
                
                // In a real app, you would send this to SharePoint
                console.log('Form data:', formData);
                alert('Verlof aanvraag verzonden!');
                
                // Optional: Redirect back to calendar
                // window.location.href = '../verlofRooster.aspx';
            });
        });
    </script>
</body>
</html>