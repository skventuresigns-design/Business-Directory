let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    updateMastheadDate();
    getLocalWeather();
    if (typeof baseCsvUrl !== 'undefined') initDirectory();
    
    const modal = document.getElementById('premium-modal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closePremiumModal(); });
});

function initDirectory() {
    Papa.parse(baseCsvUrl, {
        download: true, header: true, skipEmptyLines: 'greedy',
        complete: function(results) {
            masterData = results.data.filter(row => (row.name || row.Name));
            displayData(masterData);
            updateListingCount(masterData.length);
        }
    });
}

function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || biz.Tier || 'basic').toLowerCase().trim();
        const bizName = (biz.name || biz.Name || "").trim();
        const town = (biz.town || biz.Town || "Clay County").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const cleanID = bizName.replace(/[^a-zA-Z0-9]/g, '');

        const card = document.createElement('div');
        card.className = `card ${tier}`;
        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid || biz.ImageID)}</div>
            <h3>${bizName}</h3>
            <div class="town-bar ${townClass}-bar">${town}</div>
            ${tier !== 'basic' ? `<p><b>${biz.phone || biz.Phone || ""}</b></p>` : ''}
            <p><i>${biz.category || biz.Category || ""}</i></p>
            ${tier === 'premium' ? `<button class="read-more-btn" onclick="openPremiumModal('${cleanID}')">Read More</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// SMART CATEGORY FILTER
function quickFilterByCategory(catName) {
    document.querySelectorAll('.main-menu-links a').forEach(a => a.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    const filtered = masterData.filter(biz => {
        const bCat = (biz.category || biz.Category || "").toLowerCase();
        const target = catName.toLowerCase();

        if (target === "dining") return bCat.includes("dining") || bCat.includes("restaurant");
        if (target === "retail" || target === "shopping") return bCat.includes("retail") || bCat.includes("shopping");
        return bCat.includes(target);
    });
    displayData(filtered);
    updateListingCount(filtered.length);
}

// SEARCH & TIER HELPERS
function toggleSearchBar() {
    const el = document.getElementById('search-input-wrapper');
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}

function searchBusinesses() {
    const term = document.getElementById('directory-search').value.toLowerCase();
    const filtered = masterData.filter(biz => {
        const bName = (biz.name || biz.Name || "").toLowerCase();
        const bCat = (biz.category || biz.Category || "").toLowerCase();
        return bName.includes(term) || bCat.includes(term);
    });
    displayData(filtered);
    updateListingCount(filtered.length);
}

function filterByTier(tier) {
    document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));
    if (tier === 'all') {
        displayData(masterData);
        updateListingCount(masterData.length);
    } else {
        const filtered = masterData.filter(biz => (biz.tier || biz.Tier || "").toLowerCase().trim() === tier);
        displayData(filtered);
        updateListingCount(filtered.length);
    }
}

// MODAL & GLOBAL HELPERS
function openPremiumModal(cleanID) {
    const biz = masterData.find(b => (b.name || b.Name || "").replace(/[^a-zA-Z0-9]/g, '') === cleanID);
    if (!biz) return;
    const modal = document.getElementById('premium-modal');
    const content = document.querySelector('.modal-content');
    
    // Simple Modal Structure
    content.innerHTML = `
        <span onclick="closePremiumModal()" style="position:absolute; top:5px; right:15px; font-size:40px; cursor:pointer;">&times;</span>
        <h2>${biz.name || biz.Name}</h2>
        <hr>
        <p><b>Address:</b> ${biz.address || biz.Address || "N/A"}</p>
        <p><b>Hours:</b> ${biz.hours || biz.Hours || "Call for hours"}</p>
        <p><b>Category:</b> ${biz.category || biz.Category || ""}</p>
        <div style="border: 2px dashed red; padding: 10px; text-align:center; margin-top:20px;">
            <b>COMMUNITY COUPON</b><br>Mention SMLC for local deals!
        </div>
    `;
    modal.style.display = 'flex';
}

function closePremiumModal() { document.getElementById('premium-modal').style.display = 'none'; }

function getSmartImage(id) {
    const placeholder = "https://placehold.co/150?text=SMLC";
    if (!id || id === "N/A" || id === "") return `<img src="${placeholder}">`;
    if (id.startsWith('http')) return `<img src="${id}">`;
    return `<img src="https://raw.githubusercontent.com/skventuresigns-design/media/main/${id}">`;
}

function applyFilters() {
    const twn = document.getElementById('town-select').value;
    const cat = document.getElementById('cat-select').value;
    const filtered = masterData.filter(biz => (twn === "All" || (biz.town || biz.Town) === twn) && (cat === "All" || (biz.category || biz.Category) === cat));
    displayData(filtered);
    updateListingCount(filtered.length);
}

function updateListingCount(count) { document.getElementById('listing-count').innerText = `${count} Listings Found`; }
function updateMastheadDate() { document.getElementById('masthead-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
async function getLocalWeather() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await res.json();
        document.getElementById('weather-box').innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`;
    } catch (e) {}
}
