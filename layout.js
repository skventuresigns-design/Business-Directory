/**
 * LAYOUT.JS - The Directory Engine
 */
let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
    getLocalWeather();
});

function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Filter out empty rows
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
            } else {
                if (grid) grid.innerHTML = '<p>No listings found in the directory.</p>';
            }
        }
    });
}

function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const townRaw = (biz.town || "Clay County").trim().split(',')[0];
        const townClean = townRaw.replace(" IL", "").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');
        
        const card = document.createElement('div');
        card.className = `card ${(biz.tier || 'basic').toLowerCase()}`;
        
        card.onclick = () => {
            window.location.href = `profile.html?biz=${encodeURIComponent(biz.name)}`;
        };

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            <p>${biz.phone || ''}</p>
        `;
        grid.appendChild(card);
    });
}

// FIX: This function now ignores CAPS so the dropdowns always work
function applyFilters() {
    const townVal = document.getElementById('town-select').value.toLowerCase();
    const catVal = document.getElementById('cat-select').value;
    
    let filtered = masterData.filter(biz => {
        const bizTown = (biz.town || "").toLowerCase();
        const bizCat = (biz.category || "");
        
        const matchesTown = (townVal === 'all' || bizTown.includes(townVal));
        const matchesCat = (catVal === 'All' || bizCat === catVal);
        
        return matchesTown && matchesCat;
    });

    displayData(filtered);
}

function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `${catEmojis[cat] || '📁'} ${cat}`;
        select.appendChild(opt);
    });
}

function getSmartImage(id) {
    if (!id || id === "N/A" || id.trim() === "") return `<img src="images/placeholder.png" alt="Logo">`;
    if (id.startsWith('http')) return `<img src="${id}" alt="Logo">`;
    return `<img src="https://googleusercontent.com/profile/picture/${id.trim()}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
}

async function getLocalWeather() {
    const weatherBox = document.getElementById('weather-box');
    if (!weatherBox) return;
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await response.json();
        if (data.current_weather) {
            weatherBox.innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`;
        }
    } catch (e) { console.log("Weather failed"); }
}
