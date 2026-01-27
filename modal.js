/** * MODAL.JS - THE POP-OUT ENGINE */
function openFullModal(bizName) {
    const biz = masterData.find(b => b.name === bizName);
    if (!biz) return;

    const modal = document.getElementById('premium-modal');
    const content = document.getElementById('modal-body');
    if (!modal || !content) return;

    const town = (biz.town || "Clay County").trim().split(',')[0].replace(" IL", "").trim();
    const townClass = town.toLowerCase().replace(/\s+/g, '-');
    const mapAddress = encodeURIComponent(`${biz.address}, ${biz.town}, IL`);
    
    content.innerHTML = `
        <div style="text-align:center;">
            <div style="height:120px; margin-bottom:10px;">${getSmartImage(biz.imageid)}</div>
            <h1 style="font-family:'Times New Roman', serif; margin:0;">${biz.name}</h1>
            <p style="color:#666;">${biz.category} | ${town}</p>
        </div>
        <div class="town-bar ${townClass}-bar" style="margin: 15px -30px; border-radius: 0;">${town}</div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:25px;">
            <div>
                <h3>Business Details</h3>
                <p><strong>📞 Phone:</strong> ${biz.phone}</p>
                <p><strong>📍 Address:</strong> ${biz.address}</p>
                <p><strong>⏰ Hours:</strong> ${biz.hours || 'N/A'}</p>
                <div style="margin-top:20px;">
                    ${biz.website && biz.website !== "N/A" ? `<a href="${biz.website}" target="_blank" style="background:#0c30f0; color:white; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:bold; display:inline-block; margin-right:10px;">Website</a>` : ""}
                    ${biz.facebook && biz.facebook !== "N/A" ? `<a href="${biz.facebook}" target="_blank" style="background:#3b5998; color:white; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:bold; display:inline-block;">Facebook</a>` : ""}
                </div>
            </div>
            <div>
                <h3>Map Location</h3>
                <iframe width="100%" height="250" frameborder="0" style="border:1px solid #ddd; border-radius:8px;" src="https://maps.google.com/maps?q=${mapAddress}&output=embed"></iframe>
            </div>
        </div>
        ${biz.bio && biz.bio !== "N/A" ? `<div style="margin-top:20px; padding-top:20px; border-top:1px solid #eee;"><h3>Our Story</h3><p style="line-height:1.6;">${biz.bio}</p></div>` : ""}
    `;
    modal.style.display = "flex";
}

function setupModalClose() {
    const modal = document.getElementById('premium-modal');
    const closeBtn = document.querySelector('.close-modal');
    if(closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };
}
