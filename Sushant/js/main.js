// Main Shop Logic
(function init() {
    const stored = localStorage.getItem('sushant_products');
    let products = [];

    if (stored) {
        products = JSON.parse(stored);
    } else {
        products = DEFAULTS;
        localStorage.setItem('sushant_products', JSON.stringify(DEFAULTS));
    }

    const grid = document.getElementById('productGrid');
    grid.innerHTML = "";

    products.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'card product-card';
        // Animation Stagger (Max 0.5s delay)
        const delay = Math.min(index * 0.05, 0.5);
        div.style.animation = `fadeInUp 0.5s ease forwards ${delay}s`;
        div.style.opacity = '0'; // Start hidden

        // Store price in data attribute for easy calculation
        div.dataset.price = p.price;
        const unit = p.unit || 'kg';
        // For kg, allow 100g increments (0.1). For others (pcs, packets), use step 1.
        const step = (unit === 'kg') ? 0.1 : 1;

        let kgOptions = "";
        if (unit === 'kg') {
            kgOptions = `
            <select class="qty-select" onchange="setQtyFromSelect(this)" style="width: 100%; padding: 6px; margin-bottom: 8px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 13px; background: #fff;">
                <option value="0" selected>Select Weight</option>
                <option value="0.25">250g</option>
                <option value="0.50">500g</option>
                <option value="0.75">750g</option>
                <option value="1.00">1kg</option>
                <option value="custom">Custom</option>
            </select>`;
        }

        div.innerHTML = `
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/150?text=Veg'">
            <h4 class="item-name">${p.name} <span style="font-size:0.85em; color:#718096; display:block; font-weight:400;">${p.hindi || ''}</span></h4>
            <div class="price-tag">₹${p.price} / ${unit}</div>
            <div class="input-group">
                <label style="text-align:center">Quantity (${unit})</label>
                ${kgOptions}
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty(this, -${step})">−</button>
                    <input type="number" min="0" step="${step}" value="0" class="qty-input" oninput="handleManualInput(this)" />
                    <button class="qty-btn" onclick="updateQty(this, ${step})">+</button>
                </div>
            </div>
        `;
        grid.appendChild(div);
    });

    // Load Customer Data
    const profile = JSON.parse(localStorage.getItem('customerProfile') || '{}');
    if (profile.name) document.getElementById('name').value = profile.name;
    if (profile.phone) document.getElementById('phone').value = profile.phone;
    if (profile.email) document.getElementById('email').value = profile.email;
    if (profile.address) document.getElementById('address').value = profile.address;
})();


let lastOrder = null;

// Update Quantity Function
// Update Quantity Function
function updateQty(btn, change) {
    const input = btn.parentElement.querySelector('.qty-input');
    let val = parseFloat(input.value) || 0;
    val += change;
    if (val < 0) val = 0;

    // Fix floating point precision
    input.value = parseFloat(val.toFixed(2));

    // Sync Select if exists
    syncSelect(input);

    calcTotal();
}

function handleManualInput(input) {
    syncSelect(input);
    calcTotal();
}

function syncSelect(input) {
    const parent = input.parentElement.parentElement;
    const select = parent.querySelector('select');

    if (select) {
        const val = parseFloat(input.value);
        if (val === 0) {
            select.value = "0";
            return;
        }

        const strVal = val.toFixed(2);
        let match = false;

        for (let i = 0; i < select.options.length; i++) {
            const optValToCheck = parseFloat(select.options[i].value);
            if (!isNaN(optValToCheck) && optValToCheck.toFixed(2) === strVal && select.options[i].value !== '0') {
                select.value = select.options[i].value;
                match = true;
                break;
            }
        }

        if (!match) select.value = 'custom';
    }
}

function setQtyFromSelect(select) {
    const input = select.parentElement.querySelector('.qty-input');
    const val = select.value;

    if (val === 'custom') {
        input.focus();
    } else {
        input.value = parseFloat(val);
        calcTotal();
    }
}

function calcTotal() {
    const cards = document.querySelectorAll('.product-card');
    let total = 0;

    cards.forEach(card => {
        const qty = Number(card.querySelector('.qty-input').value || 0);
        const price = Number(card.dataset.price || 10);
        total += qty * price;
    });

    document.getElementById("total").innerText = total.toFixed(0);
}

// PREVIEW FUNCTIONS
function showPreview() {
    const cards = document.querySelectorAll('.product-card');
    let items = "";
    let total = 0;
    let count = 0;

    cards.forEach(card => {
        const qtyInput = card.querySelector('.qty-input');
        const qty = Number(qtyInput.value || 0);
        const price = Number(card.dataset.price || 0);

        if (qty > 0) {
            const nameHTML = card.querySelector('.item-name').cloneNode(true);
            const nameText = nameHTML.childNodes[0].textContent.trim();
            const hindiText = nameHTML.querySelector('span')?.innerText || "";
            const sub = qty * price;
            const priceTag = card.querySelector('.price-tag').innerText;
            const unit = priceTag.split('/')[1].trim();

            items += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #eee;">
                <div style="text-align:left;">
                    <div style="font-weight:600; color:#2d3748;">${nameText} <span style="font-weight:400; color:#718096; font-size:12px;">(${hindiText})</span></div>
                    <div style="font-size:12px; color:#718096;">${qty} ${unit} x ₹${price}</div>
                </div>
                <div style="font-weight:600;">₹${sub}</div>
                </div>`;
            total += sub;
            count++;
        }
    });

    if (count === 0) { alert("Please add items to cart first!"); return; }

    document.getElementById('previewList').innerHTML = items;
    document.getElementById('previewTotal').innerText = total;
    document.getElementById('previewModal').style.display = 'flex';
}

function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

function confirmOrderFromPreview() {
    closePreviewModal();
    submitOrder();
}

async function submitOrder() {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !phone || !address) {
        alert("⚠️ Please fill in all Customer Details (Name, Phone, Address).");
        return;
    }

    const cards = document.querySelectorAll('.product-card');
    let items = "";
    let orderItems = [];
    let totalQty = 0;
    let grandTotal = 0;

    cards.forEach(card => {
        const qtyInput = card.querySelector('.qty-input');
        const qty = Number(qtyInput.value || 0);
        const price = Number(card.dataset.price || 10);

        if (qty > 0) {
            let itemName = "";
            const nameHeader = card.querySelector('.item-name');
            const nameInput = card.querySelector('.custom-name');

            if (nameHeader) itemName = nameHeader.innerText;
            else if (nameInput) itemName = nameInput.value.trim() || "Unknown Item";

            // Cleanup newline/spaces in item name
            itemName = itemName.replace(/\s+/g, ' ').trim();

            const priceTag = card.querySelector('.price-tag').innerText;
            const unit = priceTag.split('/')[1] ? priceTag.split('/')[1].trim() : '';

            const itemTotal = qty * price;
            items += `${++totalQty}. ${itemName}: ${qty} ${unit} x ₹${price} = ₹${itemTotal}\n`;

            orderItems.push({ name: itemName, qty, unit, price, total: itemTotal });

            grandTotal += itemTotal;
        }
    });

    if (totalQty <= 0) {
        alert("⚠️ Please select at least 1 vegetable quantity.");
        return;
    }

    // Telegram details
    const settings = JSON.parse(localStorage.getItem('sushant_settings') || '{}');
    const BOT_TOKEN = settings.botToken || "8515302480:AAGGSOO8T2qKHlDpfWNyaD2m3dmhXPsBMPc";
    const CHAT_ID = settings.chatId || "6769839273";

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    lastOrder = {
        id: Date.now().toString().slice(-6),
        date: dateStr,
        time: timeStr,
        customer: { name, phone, email, address },
        items: orderItems,
        total: grandTotal
    };

    saveOrderToHistory(lastOrder);

    // Save Customer Profile
    localStorage.setItem('customerProfile', JSON.stringify({ name, phone, email, address }));

    // Generate Message using Shared Function
    const msg = generateOrderBillText(lastOrder);

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const btn = document.getElementById("submitBtn");
    const status = document.getElementById("status");

    btn.disabled = true;
    btn.innerHTML = "⏳ Processing...";
    status.innerText = "Connecting to server...";
    status.className = "";

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
        });

        if (res.ok) {
            // Show Full Screen Success
            document.getElementById('successOverlay').style.display = 'flex';
            document.getElementById('successName').innerText = name;

            // Reset inputs
            document.querySelectorAll('input').forEach(inp => inp.value = "");
            calcTotal();

            btn.innerHTML = "✅ Place Order";
            btn.disabled = false;
            status.innerText = "";
        } else {
            throw new Error("Telegram API Error");
        }
    } catch (e) {
        console.error(e);
        alert("❌ Error sending order. Please check internet connection.");
        status.innerText = "Failed to send.";
        btn.disabled = false;
        btn.innerHTML = "✅ Place Order";
    }
}

function closeSuccessOverlay() {
    document.getElementById('successOverlay').style.display = 'none';
}

// Generate Invoice Image (JPG)
function generateInvoice(orderData = null) {
    const o = orderData || lastOrder;
    if (!o) { alert("No order found to generate bill!"); return; }

    // Populate Hidden Bill Template
    document.getElementById('billName').innerText = o.customer.name;
    document.getElementById('billPhone').innerText = "+91 " + o.customer.phone;
    document.getElementById('billAddress').innerText = o.customer.address || "No Address";
    document.getElementById('billId').innerText = "#" + o.id;
    document.getElementById('billDate').innerText = o.date;
    document.getElementById('billTotal').innerText = "₹" + o.total;

    // Populate Items
    const itemsHtml = o.items.map(i =>
        `<tr>
            <td style="padding: 8px 0; color: #4a5568;">${i.name}</td>
            <td style="text-align: center; padding: 8px 0; font-weight: 500; color: #2d3748;">${i.qty} ${i.unit}</td>
            <td style="text-align: center; padding: 8px 0; font-weight: 500; color: #2d3748;">₹${i.price}</td>
            <td style="text-align: right; padding: 8px 0; font-weight: 700; color: #2d3748;">₹${i.total}</td>
        </tr>`
    ).join('');
    document.getElementById('billItems').innerHTML = itemsHtml;
    document.getElementById('billGrandTotal').innerText = "₹" + o.total;

    // Capture and Download
    const element = document.getElementById('userBill');

    // We need to briefly make it visible (but off-screen) or just use it as is?
    // html2canvas works on hidden elements if display is not none. 
    // We already set display: block (default) and positioned it off-screen in css.

    html2canvas(element, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        const imgData = canvas.toDataURL("image/jpeg", 0.9);

        // Show Preview Modal
        const previewModal = document.getElementById('imagePreviewModal');
        const previewImg = document.getElementById('previewImage');
        const downloadLink = document.getElementById('downloadLink');

        previewImg.src = imgData;
        downloadLink.href = imgData;
        downloadLink.download = `Bill_${o.customer.name}_${o.id}.jpg`;

        previewModal.style.display = 'flex';
    });
}

function closeImagePreview() {
    document.getElementById('imagePreviewModal').style.display = 'none';
}

function generatePreviewInvoice() {
    // 1. Gather Data
    const name = document.getElementById("name").value.trim() || "Guest";
    const phone = document.getElementById("phone").value.trim() || "N/A";
    const email = document.getElementById("email").value.trim() || "N/A";
    const address = document.getElementById("address").value.trim() || "N/A";

    const cards = document.querySelectorAll('.product-card');
    let orderItems = [];
    let grandTotal = 0;

    cards.forEach(card => {
        const qtyInput = card.querySelector('.qty-input');
        const qty = Number(qtyInput.value || 0);
        const price = Number(card.dataset.price || 10);

        if (qty > 0) {
            let itemName = "";
            const nameHeader = card.querySelector('.item-name');
            const nameInput = card.querySelector('.custom-name');
            if (nameHeader) itemName = nameHeader.innerText;
            else if (nameInput) itemName = nameInput.value.trim() || "Unknown";
            itemName = itemName.replace(/\s+/g, ' ').trim();
            const total = qty * price;
            orderItems.push({ name: itemName, qty, price, total });
            grandTotal += total;
        }
    });

    if (orderItems.length === 0) { alert("Cart is empty!"); return; }

    const now = new Date();
    const previewOrder = {
        id: "PREVIEW",
        date: now.toLocaleDateString('en-IN'),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        customer: { name, phone, email, address },
        items: orderItems,
        total: grandTotal
    };

    generateInvoice(previewOrder);
}

// Order History Functions
function saveOrderToHistory(order) {
    let history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    history.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(history));
}

function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    if (menu.style.left === '0px') {
        menu.style.left = '-300px';
    } else {
        menu.style.left = '0px';
        // Sync Inputs
        document.getElementById('historyPhoneInput').value = document.getElementById('phone').value;
        renderOrderHistory();
    }
}

function loginHistory() {
    const val = document.getElementById('historyPhoneInput').value.trim();
    if (val) {
        document.getElementById('phone').value = val;
        renderOrderHistory();
    } else {
        alert("Please enter a phone number.");
    }
}

function renderOrderHistory() {
    const list = document.getElementById('orderHistoryList');
    const phoneInput = document.getElementById('phone').value.trim();
    const allHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');

    if (!phoneInput) {
        list.innerHTML = `
            <div style="text-align: center; color: #666; padding: 20px; font-size: 14px;">
                <p>Please enter your <b>Phone Number</b> in the Customer Details section to view your past orders.</p>
            </div>`;
        return;
    }

    // Filter by phone
    const history = allHistory.filter(o => o.customer && o.customer.phone === phoneInput);

    if (history.length === 0) {
        list.innerHTML = `<p style="text-align: center; color: #888; font-size: 14px; margin-top: 20px;">No past orders found for <br><b>${phoneInput}</b></p>`;
        return;
    }

    list.innerHTML = history.map((order) => `
        <div style="background: #f8fafc; padding: 12px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 5px;">
                <span>${order.date}</span>
                <span>${order.time}</span>
            </div>
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">
                Order #${order.id}
            </div>
            <div style="font-size: 14px; color: var(--primary); font-weight: 700; margin-bottom: 8px;">
                ₹${order.total}
            </div>
            <button onclick="generateInvoiceByHistory('${order.id}')" style="width: 100%; background: white; border: 1px solid var(--primary); color: var(--primary); padding: 8px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                📄 Download Bill
            </button>
        </div>
    `).join('');
}

function generateInvoiceByHistory(orderId) {
    const allHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const order = allHistory.find(o => o.id == orderId); // Use loose equality for safety
    if (order) {
        generateInvoice(order);
    }
};


