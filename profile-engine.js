/**
 * PROFILE-ENGINE.JS - Injects your Sheet data into the newspaper layout
 */
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bizName = decodeURIComponent(urlParams.get('biz') || "");

    if (!bizName) {
        window.location.href = 'index.html';
        return;
    }

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            const biz = results.data.find(b => b.name === bizName);
            if (biz) {
                renderProfile(biz);
            } else {
                document.getElementById('profile-wrap').innerHTML = "<h2>Business Profile Not Found.</h2>";
            }
        }
    });
});

function renderProfile(biz) {
    const wrap = document.getElementById('profile-wrap');
    
    // Map Address for Google Maps
    const fullAddress = `${biz.address || ''}, ${biz.town || ''}, IL`.trim();
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    wrap.innerHTML = `
        <div class="profile-container">
            <div class="tier-indicator">${biz.tier || 'Basic Member'}</div>
            <a href="index.html" class="back-link">← Return to Directory</a>
            
            <div class="profile-header">
                <div class="profile-logo-box">
                    ${getSmartImage(biz.imageid)}
                </div>
                <div>
                    <h1 class="biz-title">${biz.name}</h1>
                    <p class="biz-meta">${biz.category} | ${biz.town}</p>
                </div>
            </div>

            <div class="details-grid">
                <div class="info-section">
                    <h3>Contact Information</h3>
                    <div class="info-item"><strong>📞 Phone:</strong> ${biz.phone || 'N/A'}</div>
                    <div class="info-item"><strong>📍 Address:</strong> ${biz.address || 'N/A'}</div>
                    <div class="info-item"><strong>⏰ Hours:</strong> ${biz.hours || 'N/A'}</div>
                    
                    <div style="margin-top:20px;">
                        ${biz.website && biz.website !== "N/A" ? `<a href="${biz.website}" target="_blank" class="action-btn">Visit Website</a>` : ''}
                        ${biz.facebook && biz.facebook !== "N/A" ? `<a href="${biz.facebook}" target="_blank" class="action-btn" style="background:#3b5998;">Facebook</a>` : ''}
                    </div>
                </div>

                <div class="info-section">
                    <h3>Our Story</h3>
                    <div class="bio-box">
                        ${biz.bio || "No description provided yet."}
                    </div>
                </div>
            </div>

            <div class="map-box">
                <iframe width="100%" height="100%" frameborder="0" src="${mapUrl}"></iframe>
            </div>
        </div>
    `;
}

// Ensure images look for your /images folder
function getSmartImage(id) {
    if (!id || id === "N/A" || id === "") return `<img src="images/placeholder.png" alt="Logo">`;
    if (id.startsWith('http')) return `<img src="${id}" alt="Logo">`;
    return `<img src="https://lh3.googleusercontent.com/d/${id}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
}
