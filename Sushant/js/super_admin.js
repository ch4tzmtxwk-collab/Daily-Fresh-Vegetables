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
        <div style="padding: 15px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div>
                <span style="font-weight:600; display:block; font-size:16px;">${user.name || user.u}</span>
                <span style="font-size:12px; color:#718096; display:block; margin-top:2px;">${user.email || 'No email'} (${user.u})</span>
            </div>
            
            <div style="display:flex; gap:10px; align-items: center;">
                <button onclick="handleRequest('${user.u}', 'reject')" style="padding: 8px 16px; font-size: 13px; background: #e53e3e; color:white; border:none; border-radius:6px; cursor:pointer;">❌ Remove</button>
            </div>
        </div>
    `;
}

function handleRequest(username, action) {
    if (confirm(`Remove admin '${username}'?`)) {
        let admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];
        admins = admins.filter(a => a.u !== username);
        localStorage.setItem('sushant_admins', JSON.stringify(admins));
        renderAdminList();
    }
}
