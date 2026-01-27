/**
 * LAYOUT.JS - BOSS-READY FINAL VERSION
 * Equal Box Heights + GitHub Raw Image Fix
 */
var masterData = []; 

document.addEventListener("DOMContentLoaded", () => {
    loadDirectory();
    if (typeof setupModalClose === "function") setupModalClose();
});

async function loadDirectory() {
    const cacheBuster = new Date().getTime();
    Papa.parse(`${baseCsvUrl}&cb=${cacheBuster}`, {
        download: true, header: true, skipEmptyLines: true,
        complete: (results) => {
            masterData = results.data.map(row => {
                let obj = {};
                for (let key in row) {
                    let cleanKey = key.trim().toLowerCase();
                    if (cleanKey === "teir") cleanKey = "tier"; 
                    obj[cleanKey] = row[key];
                }
                return obj;
            }).filter(row => row.name && row.name.trim() !== "" && row.name !== "Searching...");
            if (typeof generateCategoryDropdown === "function") generateCategoryDropdown();
            renderCards(masterData);
        }
    });
}

function renderCards(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;

    const tierPriority = { "premium": 1, "plus": 2, "basic": 3 };
    const sortedData = [...data].sort((a, b) => {
        const tierA = (a.tier || 'basic').toLowerCase();
        const tierB = (b.tier || 'basic').toLowerCase();
        if (tierPriority[tierA] !== tierPriority[tierB]) return tierPriority[tierA] - tierPriority[tierB];
        return (a.name || "").localeCompare(b.name || "");
    });

    grid.innerHTML = sortedData.map((biz) => {
        const tier = (biz.tier || 'basic').toLowerCase();
        let town = (biz.town || "Clay County").trim().split(',')[0].replace(" IL", "").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const displayCat = mapCategory(biz.category);

        // Image Fix: Forces Raw GitHub URL
        let imageHtml = (tier === "basic") ? `<img src="${placeholderImg}" style="height:150px; max-width:100%; object-fit:contain;">` : getSmartImage(biz.imageid);
        
        // Box Size Fix: Hidden spacers keep boxes aligned at 460px
        let phoneHtml = (tier !== "basic") ? 
            `<p style="font-weight:bold; margin-top:5px; font-size:1.1rem;">📞 ${biz.phone || 'N/A'}</p>` : 
            `<p style="margin-top:5px; visibility:hidden; height:1.1rem;">Hidden</p>`;
        let actionHint = (tier === "premium") ? 
            `<div style="color:#0c30f0; font-weight:bold; margin-top:10px; text-decoration:underline;">Click for Details</div>` : 
            `<div style="margin-top:10px; visibility:hidden; height:1.2rem;">Hidden</div>`;
        let clickAction = (tier === "premium") ? `onclick="openFullModal('${biz.name.replace(/'/g, "\\'")}')" style="cursor:pointer;"` : "";

        return `
            <div class="card ${tier}" ${clickAction} style="width: 380px; height: 460px; margin: 10px auto; display: flex; flex-direction: column; position:relative; overflow:hidden; border: 1px solid #ddd; background:#fff;">
                <div class="logo-box" style="height: 160px; display: flex; align-items: center; justify-content: center; background:#f4f4f4;">${imageHtml}</div>
                <div class="town-bar ${townClass}-bar">${town}</div>
                <div style="flex-grow: 1; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align:center;">
                    <h2 style="margin:0; font-size:1.4rem; height: 3em; overflow: hidden; display: flex; align-items: center; justify-content: center;">${biz.name}</h2>
                    ${phoneHtml}${actionHint}
                </div>
                <div class="category-footer" style="padding-bottom:15px; font-weight:bold; font-style:italic; font-size:0.85rem; text-align:center;">${catEmojis[displayCat] || "📁"} ${displayCat}</div>
            </div>`;
    }).join('');
}

function getSmartImage(id) {
    const rawRepo = "https://raw.githubusercontent.com/KFruti88/images/main/";
    if (!id || id === "N/A" || id === "Searching..." || id.trim() === "") return `<img src="${placeholderImg}" style="max-height:100%; max-width:100%; object-fit:contain;">`;
    let fileName = encodeURIComponent(id.trim());
    return `<img src="${rawRepo}${fileName}.jpeg" style="max-height:100%; max-width:100%; object-fit:contain;" onerror="this.onerror=null; this.src='${rawRepo}${fileName}.png'; this.onerror=function(){this.src='${placeholderImg}'};">`;
}

function generateCategoryDropdown() {
    const catSelect = document.getElementById('cat-select');
    if (!catSelect) return;
    catSelect.innerHTML = '<option value="All">📂 All Industries</option>';
    Object.keys(catEmojis).sort().forEach(cat => {
        catSelect.innerHTML += `<option value="${cat}">${catEmojis[cat]} ${cat}</option>`;
    });
}

function applyFilters() {
    const selectedTown = document.getElementById('town-select').value;
    const selectedCat = document.getElementById('cat-select').value;
    const filtered = masterData.filter(biz => {
        const matchTown = (selectedTown === 'All' || biz.town.includes(selectedTown));
        const matchCat = (selectedCat === 'All' || mapCategory(biz.category) === selectedCat);
        return matchTown && matchCat;
    });
    renderCards(filtered);
}
