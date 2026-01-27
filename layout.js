/**
 * LAYOUT.JS - The Directory Engine
 * Handles data fetching, filtering, and navigation to profiles.
 */
let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
});

/**
 * 1. INITIALIZATION
 * Fetches data from your Google Sheet and prepares the UI.
 */
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center;">Loading Local Data...</p>';

    // Uses the baseCsvUrl defined in your config.js
    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Filter out empty rows to prevent blank cards
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
                // Initializes modal closing logic if modal.js is present
                if (typeof setupModalClose === 'function') setupModalClose();
            } else {
                if (grid) grid.innerHTML = '<p>No listings found in the directory.</p>';
            }
        },
        error: function(err) {
            console.error("CSV Load Error:", err);
            if (grid) grid.innerHTML = '<p>Error connecting to the community database.</p>';
        }
    });
}

/**
 * 2. UI RENDERING
 * Generates the business cards and handles the click-to-profile logic.
 */
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        // Formats the town name (e.g., "Flora, IL" becomes "flora")
        const town = (biz.town || "Clay County").trim().split(',')[0].replace(" IL", "").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        
        const card = document.createElement('div');
        const tier = (biz.tier || 'basic').toLowerCase();
        card.className = `card ${tier}`;
        
        // CLICK LOGIC: Sends the user to profile.html with the business name in the URL
        card.onclick = () => {
            const safeName = encodeURIComponent(biz.name);
            window.location.href = `profile.html?biz=${safeName}`;
        };

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${town}</div>
            <p>${biz.phone || ''}</p>
        `;
        grid.appendChild(card);
    });
}

/**
 * 3. IMAGE HANDLING
 * Checks for a custom ID or uses the local placeholder.
 */
function getSmartImage(id) {
    if (!id || id === "N/A" || id.trim() === "") {
        return `<img src="images/placeholder.png" alt="Logo">`;
    }
    
    // Support for direct website links
    if (id.startsWith('http')) {
        return `<img src="${id}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
    }

    // Support for Google Profile Picture IDs
    return `<img src="http://googleusercontent.com/profile/picture/${id.trim()}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
}

/**
 * 4. FILTERING
 * Dynamically builds the category dropdown and filters the list.
 */
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    
    // Get unique categories and sort them alphabetically
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        // Uses the emojis defined in config.js
        opt.textContent = `${catEmojis[cat] || '📁'} ${cat}`;
        select.appendChild(opt);
    });
}

function applyFilters() {
    const townVal = document.getElementById('town-select').value;
    const catVal = document.getElementById('cat-select').value;
    
    let filtered = masterData;
    
    if (townVal !== 'All') {
        filtered = filtered.filter(b => b.town && b.town.includes(townVal));
    }
    if (catVal !== 'All') {
        filtered = filtered.filter(b => b.category === catVal);
    }
    
    displayData(filtered);
}
