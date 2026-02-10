// SUPER ADMIN LOGIC

// Security Check: Immediately redirect if not Super Admin
(function checkAuth() {
    const sessionUser = JSON.parse(localStorage.getItem('sushant_session'));
    if (!sessionUser || sessionUser.role !== 'super') {
        window.location.href = 'admin.html';
    }
})();

// Initialize
(function init() {
    renderAdminList();
})();

function logoutSuper() {
    if (confirm("Logout from Super Admin Panel?")) {
        localStorage.removeItem('sushant_session');
        window.location.href = 'admin.html';
    }
}

// ----------------------
// ADD NEW ADMIN
// ----------------------
// ADD NEW ADMIN
function addNewAdmin() {
    const name = document.getElementById('newAdminName').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const u = document.getElementById('newAdminUser').value.trim();
    const p = document.getElementById('newAdminPass').value.trim();
    const role = document.getElementById('newAdminRole').value;

    if (!name || !email || !u || !p) {
        alert("⚠️ Please fill all fields.");
        return;
    }

    const admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];

    if (admins.some(a => a.u === u)) {
        alert("❌ Username already exists!");
        return;
    }

    admins.push({
        u,
        p,
        role: role,
        status: 'active',
        name,
        email
    });

    localStorage.setItem('sushant_admins', JSON.stringify(admins));
    alert("✅ Admin Added Successfully!");

    // Clear form but keep role default
    document.getElementById('newAdminName').value = "";
    document.getElementById('newAdminEmail').value = "";
    document.getElementById('newAdminUser').value = "";
    document.getElementById('newAdminPass').value = "";

    renderAdminList();
}

// ----------------------
// ADMIN ACTIONS
// ----------------------
function renderAdminList() {
    const list = document.getElementById('adminRequestsList');
    const msg = document.getElementById('noAdminMsg');
    list.innerHTML = "";

    const admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];
    const otherAdmins = admins.filter(a => a.role !== 'super');

    if (otherAdmins.length === 0) {
        msg.style.display = 'block';
    } else {
        msg.style.display = 'none';
        otherAdmins.forEach(user => {
            list.innerHTML += createRow(user);
        });
    }
}

function createRow(user) {
    return `
        <div style="padding: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
            <div style="flex: 1; min-width: 200px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-weight:700; font-size:16px; color:#2d3748;">${user.name || user.u}</span>
                    <span style="font-size:11px; text-transform:uppercase; font-weight:bold; color:white; background:${user.role === 'manager' ? '#805ad5' : '#3182ce'}; padding:2px 8px; border-radius:12px;">${user.role}</span>
                </div>
                <span style="font-size:13px; color:#718096; display:block; margin-top:4px;">${user.email || 'No email'} <span style="color:#cbd5e0;">|</span> Username: <strong>${user.u}</strong></span>
            </div>
            
            <div style="display:flex; gap:10px; align-items: center;">
                <button onclick="resetPassword('${user.u}')" 
                    style="padding: 8px 16px; font-size: 13px; background: white; color: #d69e2e; border: 1px solid #d69e2e; border-radius: 6px; cursor: pointer; font-weight:500;">
                    🔑 Reset Pass
                </button>
                <button onclick="removeAdmin('${user.u}')" 
                    style="padding: 8px 16px; font-size: 13px; background: white; color: #e53e3e; border: 1px solid #e53e3e; border-radius: 6px; cursor: pointer; font-weight:500;">
                    🗑️ Remove
                </button>
            </div>
        </div>
    `;
}

function removeAdmin(username) {
    if (confirm(`Are you sure you want to remove admin '${username}'? This cannot be undone.`)) {
        let admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];
        admins = admins.filter(a => a.u !== username);
        localStorage.setItem('sushant_admins', JSON.stringify(admins));
        renderAdminList();
        alert("✅ Admin removed successfully.");
    }
}

function resetPassword(username) {
    const newPass = prompt(`Enter new password for ${username}:`);
    if (newPass && newPass.trim() !== "") {
        let admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];
        const idx = admins.findIndex(a => a.u === username);
        if (idx !== -1) {
            admins[idx].p = newPass.trim();
            localStorage.setItem('sushant_admins', JSON.stringify(admins));
            alert(`✅ Password updated for ${username}!`);
        }
    }
}
