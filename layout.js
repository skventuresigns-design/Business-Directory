let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
});

function initDirectory() {
    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            // Filter out empty rows
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            populateCategoryFilter(masterData);
            displayData(masterData);
            setupModalClose();
        }
    });
}

function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const town = (biz.town || "Clay County").trim().split(',')[0].replace(" IL", "").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const card = document.createElement('div');
        
        // Tier Logic
        const tier = biz.tier ? biz.tier.toLowerCase() : 'basic';
        card.className = `card ${tier}`;
        
        if(tier === 'premium') {
            card.onclick = () => openFullModal(biz.name);
        }

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${town}</div>
            <p>${biz.phone || ''}</p>
        `;
        grid.appendChild(card);
    });
}

function getSmartImage(id) {
    if (!id || id === "N/A" || id.trim() === "") return `<img src="${placeholderImg}" alt="Logo">`;
    return `<img src="https://lh3.googleusercontent.com/d/${id}" alt="Logo">`;
}

function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
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
