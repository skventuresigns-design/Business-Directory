/**
 * LAYOUT.JS - The Directory Engine (Support My Local Community Edition)
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    updateMastheadDate();
    if (typeof baseCsvUrl === 'undefined') {
        console.error("CRITICAL: baseCsvUrl is missing from config.js");
    } else {
        initDirectory();
    }
    getLocalWeather();
});

// 2. FETCH DATA
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Filters out empty rows, assumes lowercase 'name' header
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                populateTownFilter(masterData);
                displayData(masterData);
                updateListingCount(masterData.length);
            } else {
                grid.innerHTML = '<p>No listings found in the spreadsheet.</p>';
            }
        }
    });
}

// 3. RENDER LISTINGS
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || 'basic').toLowerCase();
        const townClean = (biz.town || "Clay County").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');

        const card = document.createElement('div');
        card.className = `card ${tier}`;
        card.style.backgroundColor = "#fcf6de"; // Your preferred cream color

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name || 'Unnamed'}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            <p class="phone">${biz.phone || ''}</p>
            <p class="category-tag"><i>${biz.category || ''}</i></p>
            ${tier === 'premium' ? `<button class="read-more-btn" onclick="openPremiumModal('${encodeURIComponent(biz.name)}')">Read More</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// 4. IMAGE HANDLER
function getSmartImage(id) {
    const placeholder = "https://placehold.co/150?text=SMLC";
    const repo = (typeof mediaRepoBase !== 'undefined') ? mediaRepoBase : "";
    if (!id || id === "N/A" || id.trim() === "") return `<img src="${placeholder}" alt="Logo">`;
    if (id.toString().startsWith('http')) return `<img src="${id}" alt="Logo" onerror="this.src='${placeholder}'">`;
    return `<img src="${repo}${id.trim()}" alt="Logo" onerror="this.src='${placeholder}'">`;
}

// 5. THE FILTER ENGINE
function applyFilters() {
    const selectedTown = document.getElementById('town-select').value;
    const selectedCat = document.getElementById('cat-select').value;

    const filteredData = masterData.filter(biz => {
        const townMatch = (selectedTown === "All" || biz.town === selectedTown);
        const catMatch = (selectedCat === "All" || biz.category === selectedCat);
        return townMatch && catMatch;
    });

    displayData(filteredData);
    updateListingCount(filteredData.length);
}

// 6. DROPDOWN GENERATORS
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        const emoji = (typeof catEmojis !== 'undefined' && catEmojis[cat]) ? catEmojis[cat] : '📁';
        opt.textContent = `${emoji} ${cat}`;
        select.appendChild(opt);
    });
}

function populateTownFilter(data) {
    const select = document.getElementById('town-select');
    if (!select) return;
    const towns = [...new Set(data.map(item => item.town))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📍 All Towns</option>';
    towns.forEach(town => {
        const opt = document.createElement('option');
        opt.value = town;
        opt.textContent = town;
        select.appendChild(opt);
    });
}

// 7. PREMIUM MODAL LOGIC
function openPremiumModal(encodedName) {
    const name = decodeURIComponent(encodedName);
    const biz = masterData.find(b => b.name === name);

    if (!biz) {
        alert("Business data not found. Please refresh.");
        return;
    }

    // This creates the content INSIDE the box dynamically
    // This way, it DOES NOT MATTER if your index.html has the wrong IDs
    const modalBody = document.querySelector('#premium-modal .modal-content');
    
    if (modalBody) {
        modalBody.innerHTML = `
            <span class="close-modal" onclick="closePremiumModal()">&times;</span>
            <div style="text-align:center; margin-bottom:20px;">
                ${getSmartImage(biz.imageid)}
            </div>
            <h2 style="font-family:serif; border-bottom:3px solid #222; color:#222; margin-bottom:10px;">${biz.name}</h2>
            <p style="background:#444; color:#fff; display:inline-block; padding:5px 15px; font-weight:bold; text-transform:uppercase;">${biz.town || 'Clay County'}</p>
            
            <div style="margin-top:20px; color:#222; text-align:left;">
                <p><strong>📍 Address:</strong> ${biz.address || 'Contact for Address'}</p>
                <p><strong>📞 Phone:</strong> ${biz.phone || 'N/A'}</p>
                <p><strong>📂 Category:</strong> ${biz.category || 'Local Business'}</p>
            </div>

            <div style="border:2px dashed #cc0000; padding:15px; margin-top:20px; background:#fff; text-align:center;">
                <p style="color:#cc0000; font-weight:bold; margin:0;">COMMUNITY COUPON</p>
                <p style="color:#222; font-size:0.9rem;">Show this screen to the business for a special local offer!</p>
            </div>

            <a href="tel:${(biz.phone || "").replace(/\D/g,'')}" 
               style="display:block; background:#222; color:#d4af37; text-align:center; padding:15px; margin-top:20px; text-decoration:none; font-weight:bold; border:2px solid #d4af37;">
               CALL BUSINESS NOW
            </a>
        `;
        
        document.getElementById('premium-modal').style.display = 'flex';
    }
}
