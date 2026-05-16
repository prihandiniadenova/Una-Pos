let currentPOSCategory = 'Semua';

function renderPOS() {
    const grid = document.getElementById('pos-grid'); if (!grid) return;
    const search = document.getElementById('pos-search')?.value.toLowerCase() || '';
    
    const filtered = state.products.filter(p => (currentPOSCategory === 'Semua' || p.category === currentPOSCategory) && (!search || p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search)));
    
    grid.innerHTML = filtered.map(p => `
        <div onclick="addToCart(${p.id})" class="bg-white p-4 rounded-3xl cursor-pointer hover:border-orange-500 border-2 border-transparent transition-all shadow-sm">
            <div class="aspect-square bg-gray-50 rounded-2xl mb-3 flex items-center justify-center text-orange-200"><i data-lucide="package" class="w-10 h-10"></i></div>
            <h4 class="font-black text-xs truncate">${p.name}</h4>
            <div class="flex justify-between items-center mt-2">
                <span class="font-black text-sm text-orange-500">${formatIDR(p.price)}</span>
                <span class="text-[9px] font-bold text-gray-400">${p.stock} pcs</span>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function addToCart(id) {
    const p = state.products.find(x => x.id === id); if (!p || p.stock <= 0) return;
    const item = state.cart.find(x => x.id === id);
    if (item) { if (item.quantity < p.stock) item.quantity++; } else { state.cart.push({ ...p, quantity: 1 }); }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items'); if (!container) return;
    let total = 0;
    container.innerHTML = state.cart.map((item, idx) => {
        total += item.price * item.quantity;
        return `
            <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-xs text-orange-500">${item.quantity}x</div>
                <div class="flex-1 min-w-0"><h5 class="text-xs font-black truncate">${item.name}</h5></div>
                <div class="text-right"><p class="text-xs font-black">${formatIDR(item.price * item.quantity)}</p></div>
            </div>
        `;
    }).join('') || '<p class="text-center py-10 opacity-20">Keranjang Kosong</p>';
    
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.innerText = formatIDR(total);
    if (totalEl) totalEl.innerText = formatIDR(total);
    if (window.lucide) lucide.createIcons();
}

function renderPOSCategories() {
    const chipContainer = document.getElementById('pos-cat-chips');
    const selectEl = document.getElementById('pos-cat-select');
    if (!chipContainer || !selectEl) return;
    const cats = state.categories.map(c => typeof c === 'string' ? c : c.name);
    const top5 = cats.slice(0, 5);
    chipContainer.innerHTML = `<button onclick="setPOSCategory('Semua')" class="px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentPOSCategory === 'Semua' ? 'bg-orange-500 text-white shadow-md' : 'bg-white hover:bg-orange-50 text-orange-900'}">Semua</button>` + 
        top5.map(c => `<button onclick="setPOSCategory('${c}')" class="px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentPOSCategory === c ? 'bg-orange-500 text-white shadow-md' : 'bg-white hover:bg-orange-50 text-orange-900'}">${c}</button>`).join('');
    selectEl.innerHTML = '<option value="Semua">Lainnya...</option>' + 
        cats.map(c => `<option value="${c}" ${currentPOSCategory === c ? 'selected' : ''}>${c}</option>`).join('');
}

function setPOSCategory(c) {
    currentPOSCategory = c;
    renderPOSCategories(); renderPOS();
}

let selectedMember = null;
function selectMember() {
    const input = document.getElementById('member-search-input');
    const badge = document.getElementById('selected-member-badge');
    const inputWrapper = input?.parentElement;
    if (!input || !badge) return;
    const val = input.value;
    const match = val.match(/\(([^)]+)\)/);
    const phone = match ? match[1] : '';
    const m = state.members.find(x => x.phone === phone);
    if (m) {
        selectedMember = m;
        badge.innerHTML = `<i data-lucide="check-circle-2" class="w-3 h-3 inline mr-1"></i> ${m.name} (${m.points} pts)`;
        badge.classList.remove('hidden');
        if (inputWrapper) inputWrapper.style.boxShadow = '0 0 0 2px #FF9A00';
        input.style.border = 'none';
        showNotification(`Member ${m.name} Terpilih!`, 'success');
        if (window.lucide) lucide.createIcons();
    } else {
        selectedMember = null;
        badge.classList.add('hidden');
        if (inputWrapper) inputWrapper.style.boxShadow = 'none';
    }
}

function checkout() {
    if (state.cart.length === 0) return;
    const total = state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    const display = document.getElementById('pay-total-display');
    
    if (modal && content && display) {
        display.innerText = `Total Tagihan: ${formatIDR(total)}`;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    }
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    const content = document.getElementById('payment-modal-content');
    if (modal && content) {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function processPayment(method) {
    const total = state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const customerName = selectedMember ? selectedMember.name : 'Umum';
    
    if (selectedMember) {
        selectedMember.points += Math.floor(total / 10000);
    }

    state.transactions.unshift({ 
        id: 'UNA-'+Date.now(), 
        date: new Date().toLocaleString('id-ID'), 
        total, 
        items: [...state.cart], 
        customer: customerName,
        paymentMethod: method
    });
    
    state.revenue += total;
    state.cart.forEach(item => { 
        const p = state.products.find(x => x.id === item.id); 
        if (p) {
            p.stock -= item.quantity; 
            // Record Mutation
            state.stockHistory.unshift({
                prodName: p.name,
                prodSku: p.sku,
                type: 'sub',
                qty: -item.quantity,
                cashier: 'POS System',
                date: new Date().toLocaleString('id-ID'),
                note: 'Penjualan POS'
            });
        }
    });
    
    state.cart = [];
    selectedMember = null;
    if (document.getElementById('selected-member-badge')) document.getElementById('selected-member-badge').classList.add('hidden');
    if (document.getElementById('member-search-input')) document.getElementById('member-search-input').value = '';
    
    addActivityLog('Transaksi POS', 'POS System', `Total: ${formatIDR(total)} (${method})`);
    saveState(); closePaymentModal(); updateCartUI(); renderPOS();
    showNotification(`Transaksi ${method} Berhasil!`);
}
