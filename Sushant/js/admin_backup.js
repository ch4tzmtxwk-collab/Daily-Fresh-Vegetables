// ADMIN LOGIC

// Security Check: If Super Admin tries to access this page, redirect them
(function checkRole() {
    const sessionUser = JSON.parse(localStorage.getItem('sushant_session'));
    // If we have a session and they are super, kick them to super_admin.html
    // Unless they are just looking at the login page (no currentUser set yet in code, but session exists)
    // Actually, 'admin.html' serves both login and dashboard. 
    // If session exists and role is super, we redirect.
    if (sessionUser && sessionUser.role === 'super') {
        alert("⛔ Access Denied: Super Admins cannot access Shop Admin panels.");
        window.location.href = 'super_admin.html';
    }
})();

// Load Data
let products = JSON.parse(localStorage.getItem('sushant_products')) || DEFAULTS;

// Initial Setup: Ensure default admin exists
(function initAuth() {
    let admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];

    // Migration for old data or empty data
    // If empty, create Super Admin
    if (admins.length === 0) {
        admins.push({ u: "Sushant", p: "779895", role: 'super', status: 'active' });
        localStorage.setItem('sushant_admins', JSON.stringify(admins));
    } else {
        // Ensure existing users have properties and enforce Single Super Admin
        let changed = false;
        admins = admins.map(a => {
            // Force Super Admin for Sushant, Admin for everyone else
            const correctRole = (a.u === "Sushant") ? 'super' : 'admin';

            if (a.role !== correctRole) {
                a.role = correctRole;
                changed = true;
            }
            if (!a.status) { a.status = 'active'; changed = true; }
            return a;
        });
        if (changed) localStorage.setItem('sushant_admins', JSON.stringify(admins));
    }

    // Check global settings
    checkRegistrationStatus();
})();

// Initialize Auto-Translate
(function initTranslate() {
    const nameInput = document.getElementById('pName');
    const hindiInput = document.getElementById('pHindi');

    if (!nameInput) return; // Guard for login page if script runs early

    // Simple static dictionary for common vegetables
    const dictionary = {
        "tomato": "टमाटर",
        "onion": "प्याज",
        "potato": "आलू",
        "spinach": "पालक",
        "cabbage": "पत्ता गोभी",
        "cauliflower": "फूल गोभी",
        "carrot": "गाजर",
        "cucumber": "खीरा",
        "brinjal": "बैंगन",
        "ladyfinger": "भिंडी",
        "okra": "भिंडी",
        "ginger": "अदरक",
        "garlic": "लहसुन",
        "chilli": "मिर्च",
        "coriander": "धनिया",
        "mint": "पुदीना",
        "pea": "मटर",
        "capsicum": "शिमला मिर्च",
        "pumpkin": "कद्दू",
        "bottle gourd": "लौकी",
        "bitter gourd": "करेला",
        "radish": "मूली",
        "beetroot": "चुकंदर",
        "lemon": "नींबू",
        "apple": "सेब",
        "banana": "केला",
        "mango": "आम",
        "papaya": "पपीता",
        "watermelon": "तरबूज",
        "grapes": "अंगूर"
    };

    nameInput.addEventListener('input', function () {
        const val = this.value.toLowerCase().trim();

        // Check exact match or partial match in dictionary keys
        for (const key in dictionary) {
            if (val.includes(key)) {
                hindiInput.value = dictionary[key];
                break; // Stop after first match found
            }
        }
    });
})();

let currentUser = null;

function toggleAuth(mode) {
    document.getElementById('userInput').value = "";
    document.getElementById('passInput').value = "";
    document.getElementById('regUser').value = "";
    document.getElementById('regPass').value = "";

    if (mode === 'register') {
        document.getElementById('loginCard').style.display = 'none';
        document.getElementById('registerCard').style.display = 'block';
        document.getElementById('superAdminCard').style.display = 'none';
    } else if (mode === 'super') {
        document.getElementById('loginCard').style.display = 'none';
        document.getElementById('registerCard').style.display = 'none';
        document.getElementById('superAdminCard').style.display = 'block';
    } else {
        document.getElementById('loginCard').style.display = 'block';
        document.getElementById('registerCard').style.display = 'none';
        document.getElementById('superAdminCard').style.display = 'none';
    }
}

function checkLogin(type = 'normal') {
    let u, p;
    if (type === 'super') {
        u = document.getElementById('superUser').value.trim();
        p = document.getElementById('superPass').value.trim();
    } else {
        u = document.getElementById('userInput').value.trim();
        p = document.getElementById('passInput').value.trim();
    }

    const admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];
    const user = admins.find(admin => admin.u === u && admin.p === p);

    if (user) {
        if (user.status === 'pending') {
            alert("⏳ Account pending approval by Super Admin.");
            return;
        }

        currentUser = user;
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('welcomeMsg').innerText = `User: ${user.u}`;

        if (user.role === 'super') {
            // Set session and redirect to 3rd page
            localStorage.setItem('sushant_session', JSON.stringify(user));
            window.location.href = 'super_admin.html';
            return;
        }

        renderList();
    } else {
        alert("❌ Wrong Username or Password");
    }
}
function registerAdmin() {
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value.trim();

    if (!u || !p) {
        alert("Please enter both Username and Password");
        return;
    }

    const regEnabled = localStorage.getItem('sushant_reg_enabled') !== 'false';
    if (!regEnabled) {
        alert("🚫 Registration is currently disabled by Super Admin.");
        toggleAuth('login');
        return;
    }

    const admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];

    // Check if user already exists
    if (admins.some(admin => admin.u === u)) {
        alert("⚠️ Username already exists!");
        return;
    }

    // New admins are 'pending' by default
    admins.push({ u, p, role: 'admin', status: 'pending' });
    localStorage.setItem('sushant_admins', JSON.stringify(admins));

    alert("✅ Request Sent! Wait for Super Admin approval.");
    toggleAuth('login');
    alert("✅ Request Sent! Wait for Super Admin approval.");
    toggleAuth('login');
}

function toggleProductForm() {
    const form = document.getElementById('productFormContainer');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        clearForm();
    } else {
        form.style.display = 'none';
        clearForm();
    }
}

function toggleSuperAdminPanel() {
    const panel = document.getElementById('superAdminPanel');
    if (panel.style.display === 'none') {
        renderAdminRequests();
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('userInput').value = '';
        document.getElementById('passInput').value = '';
        currentUser = null;
    }
}
function renderAdminRequests() {
    const panel = document.getElementById('superAdminPanel');
    const list = document.getElementById('adminRequestsList');
    const msg = document.getElementById('noRequestsMsg');

    panel.style.display = 'block'; // Ensure it's visible when rendered


    const admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];

    // Filter out the Super Admin (Sushant) so he doesn't ban himself
    const otherAdmins = admins.filter(a => a.role !== 'super');

    list.innerHTML = "";

    if (otherAdmins.length === 0) {
        msg.style.display = 'block';
        msg.innerText = "No other admins found.";
    } else {
        msg.style.display = 'none';
        // Separate Pending and Active for better UI
        const pending = otherAdmins.filter(a => a.status === 'pending');
        const active = otherAdmins.filter(a => a.status === 'active');

        // HEADERS
        if (pending.length > 0) {
            list.innerHTML += `<div style="grid-column:1/-1; font-size:12px; font-weight:bold; color:var(--text-light); margin-top:10px;">PENDING REQUESTS</div>`;
            pending.forEach(user => {
                list.innerHTML += createAdminRow(user, true);
            });
        }

        if (active.length > 0) {
            list.innerHTML += `<div style="grid-column:1/-1; font-size:12px; font-weight:bold; color:var(--text-light); margin-top:10px;">ACTIVE ADMINS</div>`;
            active.forEach(user => {
                list.innerHTML += createAdminRow(user, false);
            });
        }
    }
}

function createAdminRow(user, isPending) {
    let buttons = '';
    if (isPending) {
        buttons = `
            <button onclick="handleRequest('${user.u}', 'approve')" style="padding: 6px 12px; font-size: 12px; background: var(--primary);">✅ Approve</button>
            <button onclick="handleRequest('${user.u}', 'reject')" style="padding: 6px 12px; font-size: 12px; background: #e53e3e;">❌ Reject</button>
        `;
    } else {
        buttons = `
            <button onclick="handleRequest('${user.u}', 'reject')" style="padding: 6px 12px; font-size: 12px; background: #e53e3e;">🚫 Revoke Access</button>
        `;
    }

    return `
        <div style="padding: 10px; background: #f7fafc; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="font-weight:600; display:block;">${user.u}</span>
                <span style="font-size:11px; color:${isPending ? '#e53e3e' : '#38a169'}">${isPending ? 'Pending' : 'Active'}</span>
            </div>
            <div style="display:flex; gap:8px;">
                ${buttons}
            </div>
        </div>
    `;
}

function handleRequest(username, action) {
    let admins = JSON.parse(localStorage.getItem('sushant_admins')) || [];

    if (action === 'approve') {
        admins = admins.map(a => {
            if (a.u === username) a.status = 'active';
            return a;
        });
        alert(`✅ ${username} Approved!`);
    } else {
        // Reject or Revoke
        const msg = action === 'reject' ? `Reject ${username}?` : `Revoke access for ${username}? This will delete the account.`;
        if (confirm(msg)) {
            admins = admins.filter(a => a.u !== username);
        } else {
            return;
        }
    }

    localStorage.setItem('sushant_admins', JSON.stringify(admins));
    renderAdminRequests();
    localStorage.setItem('sushant_admins', JSON.stringify(admins));
    renderAdminRequests();
}

// Global Settings Logic
function toggleRegistration(enabled) {
    localStorage.setItem('sushant_reg_enabled', enabled);
    updateRegUI(enabled);
}

function updateRegUI(enabled) {
    const btn = document.getElementById('regLinkBtn');
    const toggle = document.getElementById('regToggle');
    const statusText = document.getElementById('regStatusText');

    // Update Toggle UI if we are in admin panel
    if (toggle) {
        toggle.checked = enabled;
        statusText.innerText = enabled ? "On" : "Off";
        statusText.style.color = enabled ? "var(--primary)" : "#e53e3e";
    }

    // Update Login UI
    if (btn) {
        btn.style.display = enabled ? 'block' : 'none';
    }
}

function checkRegistrationStatus() {
    const enabled = localStorage.getItem('sushant_reg_enabled') !== 'false'; // Default true
    updateRegUI(enabled);
}

function renderList(items = products) {
    const list = document.getElementById('productList');
    list.innerHTML = "";

    if (items.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:20px; color:#aaa;">No products found</div>`;
        return;
    }

    items.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-item card';
        div.innerHTML = `
<img src="${p.img}" onerror="this.src='https://via.placeholder.com/60?text=Veg'">
<div class="product-info">
  <h4>${p.name} <span style="font-size:13px; color:#4a5568; font-weight:400; margin-left:5px;">(${p.hindi || ''})</span></h4>
  <div style="margin-top:4px;">
  <span style="font-size:12px; color:#666;">Rate: ₹</span>
  <input type="number" value="${p.price}" 
         style="width:60px; padding:4px; border:1px solid #ddd; border-radius:4px;"
         onchange="quickUpdatePrice(${p.id}, this.value)">
  <span style="font-size:12px; color:#666;">/${p.unit || 'kg'}</span>
</div>
</div>
<div class="product-actions">
  <button onclick="editProduct(${p.id})" style="padding: 8px 16px; font-size: 12px;">✏️</button>
  <button onclick="deleteProduct(${p.id})" class="btn-danger" style="padding: 8px 16px; font-size: 12px;">🗑️</button>
</div>
`;
        list.appendChild(div);
    });

    // Sync to LS whenever we render (implies data changed)
    // Sync to LS whenever we render (implies data changed)
    localStorage.setItem('sushant_products', JSON.stringify(products));

    // Update Stats
    const countEl = document.getElementById('totalProductsCount');
    if (countEl) countEl.innerText = products.length;
}

// Search Logic
function filterProducts() {
    const term = document.getElementById('adminSearch').value.toLowerCase().trim();
    if (!term) {
        renderList(products);
        return;
    }
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.hindi && p.hindi.includes(term))
    );
    renderList(filtered);
}

// Handle File Upload & Resize
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        // Resize image to save space
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Max dims
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Get Base64
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPG

            document.getElementById('pImg').value = dataUrl;
            document.getElementById('previewImg').src = dataUrl;
            document.getElementById('previewImg').style.display = 'block';
        };
    };
    reader.readAsDataURL(file);
}

// Delete Product
// Quick Update Rate
function quickUpdatePrice(id, val) {
    const p = products.find(prod => prod.id === id);
    if (p) {
        p.price = Number(val);
        localStorage.setItem('sushant_products', JSON.stringify(products));
    }
}

function deleteProduct(id) {
    if (confirm("Delete this product?")) {
        products = products.filter(p => p.id !== id);
        renderList();
    }
}

// Edit Product
function editProduct(id) {
    const p = products.find(prod => prod.id === id);
    if (p) {
        document.getElementById('editId').value = p.id;
        document.getElementById('pName').value = p.name;
        document.getElementById('pHindi').value = p.hindi || "";
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pUnit').value = p.unit || "kg";
        document.getElementById('pImg').value = p.img;

        // Show preview for any image (URL or Base64)
        if (p.img) {
            document.getElementById('previewImg').src = p.img;
            document.getElementById('previewImg').style.display = 'block';
        }

        document.getElementById('productFormContainer').style.display = 'block'; // Show Form
        window.scrollTo(0, 0); // Scroll to form
    }
}

// Clear Form
function clearForm() {
    document.getElementById('editId').value = "";
    document.getElementById('pName').value = "";
    document.getElementById('pHindi').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pUnit').value = "kg";
    document.getElementById('pImg').value = "";
    document.getElementById('fileInput').value = "";
    document.getElementById('previewImg').style.display = 'none';
}

// Save Product
function saveProduct() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('pName').value;
    const hindi = document.getElementById('pHindi').value;
    const price = Number(document.getElementById('pPrice').value);
    const unit = document.getElementById('pUnit').value;
    const img = document.getElementById('pImg').value || "https://via.placeholder.com/150?text=Fresh";

    if (!name || !price) { alert("Please fill Name and Rate"); return; }

    if (id) {
        // Edit
        const idx = products.findIndex(p => p.id == id);
        if (idx > -1) {
            products[idx] = { id: Number(id), name, hindi, price, unit, img };
        }
    } else {
        // Add
        const newId = Date.now();
        products.push({ id: newId, name, hindi, price, unit, img });
    }

    clearForm();
    renderList();
}
