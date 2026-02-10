// ADMIN LOGIC

// Security Check Removed: Super Admin can access this page


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
        document.getElementById('welcomeMsg') && (document.getElementById('welcomeMsg').innerText = `User: ${user.u}`);

        if (user.role === 'super') {
            // Set session but DO NOT redirect. Stay on dashboard.
            localStorage.setItem('sushant_session', JSON.stringify(user));
            // Render requests panel if applicable
            if (typeof renderAdminRequests === 'function') renderAdminRequests();
        } else {
            // Ensure panel is hidden for normal admins
            const panel = document.getElementById('superAdminPanel');
            if (panel) panel.style.display = 'none';
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

    // Load Settings
    loadStoreSettings();


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

// Admin Requests Management
function toggleAdminRequests() {
    const content = document.getElementById('adminRequestsContent');
    const btn = document.getElementById('toggleRequestsBtn');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        btn.innerText = 'Close Requests';
        renderAdminRequests(); // Refresh list
    } else {
        content.style.display = 'none';
        btn.innerText = 'Open Requests';
    }
}

// Store Settings Management
function toggleStoreSettings() {
    const content = document.getElementById('storeSettingsContent');
    const btn = document.getElementById('toggleSettingsBtn');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        btn.innerText = 'Close Settings';
        loadStoreSettings(); // Ensure data is loaded when opening
    } else {
        content.style.display = 'none';
        btn.innerText = 'Open Settings';
    }
}

function loadStoreSettings() {
    const settings = JSON.parse(localStorage.getItem('sushant_settings') || '{}');
    if (document.getElementById('botTokenInput')) {
        document.getElementById('botTokenInput').value = settings.botToken || "";
        document.getElementById('chatIdInput').value = settings.chatId || "";
    }
}

function saveStoreSettings() {
    const botToken = document.getElementById('botTokenInput').value.trim();
    const chatId = document.getElementById('chatIdInput').value.trim();

    if (!botToken || !chatId) {
        alert("⚠️ Please enter both Bot Token and Chat ID.");
        return;
    }

    const settings = { botToken, chatId };
    localStorage.setItem('sushant_settings', JSON.stringify(settings));
    alert("✅ Settings Saved Successfully! The shop will now use these details.");
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

function cancelTodayChanges() {
    if (confirm("Are you sure you want to discard all changes and revert to default products? This cannot be undone.")) {
        localStorage.setItem('sushant_products', JSON.stringify(DEFAULTS));
        products = JSON.parse(JSON.stringify(DEFAULTS)); // Update local variable
        renderList();
        alert("✅ All changes have been reverted to defaults.");
    }
}

// TAB SWITCHING & ORDER MANAGEMENT
function switchTab(tab) {
    const prodSec = document.getElementById('productManagementSection');
    const ordSec = document.getElementById('orderManagementSection');
    const tabProd = document.getElementById('tabProducts');
    const tabOrd = document.getElementById('tabOrders');
    const addBtn = document.getElementById('addProductBtn');

    if (tab === 'products') {
        prodSec.style.display = 'block';
        ordSec.style.display = 'none';
        tabProd.style.color = 'var(--primary)';
        tabProd.style.borderBottom = '2px solid var(--primary)';
        tabOrd.style.color = '#a0aec0';
        tabOrd.style.borderBottom = 'none';
        addBtn.style.display = 'flex';
    } else {
        prodSec.style.display = 'none';
        ordSec.style.display = 'block';
        tabOrd.style.color = 'var(--primary)';
        tabOrd.style.borderBottom = '2px solid var(--primary)';
        tabProd.style.color = '#a0aec0';
        tabProd.style.borderBottom = 'none';
        addBtn.style.display = 'none';
        renderAdminOrders();
    }
}

function renderAdminOrders() {
    const list = document.getElementById('adminOrderList');
    const msg = document.getElementById('noOrdersMsg');
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');

    list.innerHTML = "";

    if (history.length === 0) {
        msg.style.display = 'block';
        return;
    }
    msg.style.display = 'none';

    history.forEach(order => {
        list.innerHTML += `
            <div style="background: white; border: 1px solid #edf2f7; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #f7fafc; padding-bottom:10px;">
                    <div>
                        <div style="font-weight:700; color:#2d3748;">${order.customer.name}</div>
                        <div style="font-size:12px; color:#718096; margin-bottom: 4px;">${order.date} | ${order.time}</div>
                        <div style="font-size:12px; color:#4a5568;">
                           ${(order.customer.address && (order.customer.address.startsWith('http') || order.customer.address.startsWith('https')))
                ? `<a href="${order.customer.address}" target="_blank" style="color:var(--primary); text-decoration:underline;">📍 Open Map Link</a>`
                : (order.customer.address && order.customer.address.startsWith('www'))
                    ? `<a href="https://${order.customer.address}" target="_blank" style="color:var(--primary); text-decoration:underline;">📍 Open Map Link</a>`
                    : `📍 ${order.customer.address || 'No Address'}`}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:700; color:var(--primary);">₹${order.total}</div>
                        <div style="font-size:12px; color:#718096;">#${order.id}</div>
                    </div>
                </div>
                
                <div style="font-size:13px; color:#4a5568; margin-bottom:15px; line-height:1.6;">
                    ${order.items.map(i => `<div>${i.qty} ${i.unit} ${i.name}</div>`).join('')}
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px; flex-wrap: wrap;">
                     <button onclick="openBillModal('${order.id}')" 
                        style="background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        🧾 Review & Send
                    </button>
                </div>
            </div>
        `;
    });
}

// --- Bill Review Modal Logic ---
let currentReviewOrder = null;

function openBillModal(orderId) {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const order = history.find(o => o.id == orderId);
    if (!order) return;

    currentReviewOrder = order;

    // Populate Modal
    document.getElementById('modalCustName').innerText = order.customer.name;
    document.getElementById('modalPhone').innerText = "+91 " + order.customer.phone;
    document.getElementById('modalAddress').innerText = order.customer.address || "No Address";
    document.getElementById('modalBillId').innerText = order.id;
    document.getElementById('modalDate').innerText = order.date;
    document.getElementById('modalTotal').innerText = "₹" + order.total;

    const itemsParams = order.items.map(i =>
        `<tr>
            <td style="padding: 8px 0; color: #4a5568;">${i.name}</td>
            <td style="text-align: center; padding: 8px 0; font-weight: 500; color: #2d3748;">${i.qty} ${i.unit}</td>
            <td style="text-align: center; padding: 8px 0; font-weight: 500; color: #2d3748;">₹${i.price}</td>
            <td style="text-align: right; padding: 8px 0; font-weight: 700; color: #2d3748;">₹${i.total}</td>
        </tr>`
    ).join('');
    document.getElementById('modalItemsList').innerHTML = itemsParams;

    document.getElementById('billPreviewModal').style.display = 'flex';
}

function closeBillModal() {
    document.getElementById('billPreviewModal').style.display = 'none';
    currentReviewOrder = null;
}

function downloadBillImage() {
    if (!currentReviewOrder) return;
    const element = document.getElementById('finalBill');

    html2canvas(element, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Bill_${currentReviewOrder.customer.name}_${currentReviewOrder.id}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
    });
}

function copyBillImage() {
    if (!currentReviewOrder) return;
    const element = document.getElementById('finalBill');
    const btn = document.getElementById('copyImgBtn');
    const originalText = btn.innerHTML;

    btn.innerHTML = "⏳ Copying...";

    html2canvas(element, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        canvas.toBlob(blob => {
            try {
                // Clipboard API usually requires PNG
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(() => {
                    btn.innerHTML = "✅ Copied!";
                    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                }).catch(err => {
                    console.error("Copy failed", err);
                    alert("❌ Copy failed. Your browser might not support copying images.");
                    btn.innerHTML = originalText;
                });
            } catch (err) {
                console.error("ClipboardItem failed", err);
                alert("❌ Copying images not supported in this browser.");
                btn.innerHTML = originalText;
            }
        }, 'image/png');
    });
}

function processAndShareWhatsApp() {
    if (!currentReviewOrder) return;

    const sendBtn = document.getElementById('sendWaBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '⚙️ Processing...';
    sendBtn.disabled = true;

    const element = document.getElementById('finalBill');

    html2canvas(element, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        canvas.toBlob(async blob => {
            const fileName = `Bill_${currentReviewOrder.customer.name.replace(/\s+/g, '_')}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const text = generateOrderBillText(currentReviewOrder);

            // Try Native Share (Mobile - Direct Image Share)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Bill Receipt',
                        text: text
                    });
                    // Success
                    sendBtn.innerHTML = originalText;
                    sendBtn.disabled = false;
                    return;
                } catch (err) {
                    console.log("Share skipped/failed:", err);
                    // Continue to fallback if user cancelled or failed
                }
            }

            // Fallback for Desktop (Download + WA Link)
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL("image/jpeg", 0.9);
            link.click();

            setTimeout(() => {
                const url = `https://wa.me/91${currentReviewOrder.customer.phone}?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');

                alert("💻 Desktop Mode Detected:\n\n1. Image has been downloaded.\n2. WhatsApp is opening now.\n3. Please drag/attach the image manually.");

                sendBtn.innerHTML = originalText;
                sendBtn.disabled = false;
            }, 1000);

        }, 'image/jpeg', 0.9);
    });
}

function copyBillText(orderId) {
    const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const order = history.find(o => o.id == orderId);
    if (!order) return;

    const text = generateOrderBillText(order);
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Order Bill Copied to Clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function clearOrderHistory() {
    if (confirm("Are you sure you want to clear ALL order history?")) {
        localStorage.removeItem('orderHistory');
        renderAdminOrders();
    }
}
