// State Management
const CATEGORIES = ['Pakaian', 'Gamis', 'Dress', 'Atasan', 'Mukenah', 'Tas', 'Sandal', 'Sepatu', 'Make Up', 'Bedak', 'Foundation', 'Sunscreen', 'Lipstick', 'Moisturizer'].map(c => ({
    name: c,
    dateAdded: '15 Mei 2024'
}));
const BRANDS = ['Aura Glow', 'Zivana Luxury', 'Modesty Silk', 'Luxe Couture', 'Serenity', 'BeautyLab', 'Wardah Premium', 'Scarlett', 'Somethinc Elite'];

let state = {
    categories: [...CATEGORIES],
    products: [], cart: [],
    members: [
        { id: 'MEM001', name: 'Siti Aminah', phone: '08123456789', points: 150, joinDate: '15 Okt 2023' },
        { id: 'MEM002', name: 'Dewi Lestari', phone: '08778899001', points: 45, joinDate: '01 Des 2023' },
        { id: 'MEM003', name: 'Rani Wijaya', phone: '08134455667', points: 320, joinDate: '12 Jan 2024' }
    ],
    transactions: [], stockHistory: [],
    cashiers: [{ id: 'admin', name: 'Super Admin', pass: 'admin', joinDate: '15 Mei 2024' }],
    revenue: 0,
    logs: [],
    inventoryPage: 1, inventoryItemsPerPage: 10,
    categoryPage: 1, categoryItemsPerPage: 10,
    memberPage: 1, memberItemsPerPage: 10,
    stockHistoryPage: 1, stockHistoryItemsPerPage: 10,
    transactionPage: 1, transactionItemsPerPage: 5
};

const DEFAULT_STATE = JSON.parse(JSON.stringify(state));

function loadState() {
    let saved = localStorage.getItem('una_pos_state') || localStorage.getItem('lumiere_pos_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state = Object.assign({}, DEFAULT_STATE, parsed);
            // Normalize categories
            state.categories = state.categories.map(c => {
                if (typeof c === 'string') return { name: c, dateAdded: '15 Mei 2024' };
                if (c && !c.dateAdded) c.dateAdded = '15 Mei 2024';
                return c;
            });

            // Normalize stock history
            state.stockHistory = (state.stockHistory || []).map(h => ({
                prodName: h.prodName || h.name || 'Produk Terhapus',
                prodSku: h.prodSku || h.sku || '-',
                type: h.type || 'add',
                qty: h.qty || h.quantity || 0,
                cashier: h.cashier || 'Admin',
                date: h.date || '-',
                note: h.note || '-'
            }));
            // Normalize users/cashiers
            state.cashiers = (state.cashiers || []).map(c => ({
                id: c.id || 'usr-'+Date.now(),
                name: c.name || 'User',
                pass: c.pass || '1234',
                role: c.role || (c.id === 'admin' ? 'Admin' : 'Kasir'),
                email: c.email || (c.id + '@unapos.com'),
                joinDate: c.joinDate || '15 Mei 2024'
            }));
            if (state.cashiers.length === 0) {
                state.cashiers.push({ id: 'admin', name: 'Super Admin', pass: 'admin', role: 'Admin', email: 'admin@unapos.com', joinDate: '15 Mei 2024' });
            }
            state.logs = state.logs || [];
            
            return true;
        } catch (e) { return false; }
    }
    return false;
}

function addActivityLog(action, user, detail) {
    state.logs.unshift({
        id: 'LOG-' + Date.now(),
        date: new Date().toLocaleString('id-ID'),
        user: user || 'System',
        action,
        detail
    });
    if (state.logs.length > 500) state.logs.pop(); // Keep last 500 logs
}
function saveState() { localStorage.setItem('una_pos_state', JSON.stringify(state)); }

function initProducts() {
    let idCounter = 1;
    state.categories.forEach(cat => {
        const name = typeof cat === 'string' ? cat : cat.name;
        for (let i = 1; i <= (name.includes('Gamis') ? 80 : 70); i++) {
            const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
            state.products.push({
                id: idCounter++, name: `${name} ${brand} #${i}`, category: name,
                price: Math.floor(Math.random() * (500000 - 35000) + 35000),
                stock: Math.floor(Math.random() * 40) + 10,
                sku: `UNA-${name.substring(0, 2).toUpperCase()}-${1000 + i}`
            });
        }
    });
}

function formatIDR(num) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num); }

function showNotification(message, type = 'success') {
    let notif = document.getElementById('notification');
    if (!notif) {
        const div = document.createElement('div');
        div.id = 'notification';
        div.className = "fixed top-6 right-6 z-[100] transition-all duration-500 transform translate-x-full opacity-0";
        div.innerHTML = `<div class="notif-inner flex items-center gap-4 px-6 py-4 rounded-[1.5rem] shadow-2xl border min-w-[320px] bg-[#1C1A16] border-orange-500/20 text-white"><div id="notif-icon" class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10 shadow-inner"></div><div class="flex-1 text-sm font-black" id="notif-message"></div></div>`;
        document.body.appendChild(div); notif = div;
    }
    document.getElementById('notif-message').innerText = message;
    const iconEl = document.getElementById('notif-icon');
    iconEl.innerText = type === 'success' ? '✓' : '!'; iconEl.className = type === 'success' ? 'text-green-500 font-bold' : 'text-red-500 font-bold';
    notif.classList.remove('translate-x-full', 'opacity-0'); notif.classList.add('translate-x-0', 'opacity-100');
    setTimeout(() => { notif.classList.remove('translate-x-0', 'opacity-100'); notif.classList.add('translate-x-full', 'opacity-0'); }, 3000);
}

function injectSidebar(activeId) {
    const aside = document.getElementById('main-sidebar'); if (!aside) return;
    aside.innerHTML = `
        <div class="px-5 py-6 flex items-center justify-between">
            <div class="flex items-center gap-3 overflow-hidden text-yellow-400">
                <div class="p-2.5 rounded-xl bg-orange-500 text-gray-900"><i data-lucide="shopping-bag" class="w-5 h-5"></i></div>
                <span class="font-black text-lg tracking-tight sidebar-text whitespace-nowrap">UNA <span class="text-orange-500">POS</span></span>
            </div>
        </div>
        <nav class="flex-1 px-3 py-2 space-y-1 text-gray-400">
            <a href="index.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='dashboard'?'active-nav':''}"><i data-lucide="layout-dashboard" class="w-4 h-4"></i><span class="text-sm sidebar-text">Dashboard</span></a>
            <a href="pos.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='pos'?'active-nav':''}"><i data-lucide="shopping-cart" class="w-4 h-4"></i><span class="text-sm sidebar-text">Buka Kasir</span></a>
            <div class="pt-4 pb-2 px-3 sidebar-text"><p class="text-[10px] font-black uppercase opacity-20">Master Data</p></div>
            <a href="categories.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='categories'?'active-nav':''}"><i data-lucide="layers" class="w-4 h-4"></i><span class="text-sm sidebar-text">Kategori</span></a>
            <a href="inventory.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='inventory'?'active-nav':''}"><i data-lucide="box" class="w-4 h-4"></i><span class="text-sm sidebar-text">Produk</span></a>
            <a href="members.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='members'?'active-nav':''}"><i data-lucide="users" class="w-4 h-4"></i><span class="text-sm sidebar-text">Member</span></a>
            <div class="pt-4 pb-2 px-3 sidebar-text"><p class="text-[10px] font-black uppercase opacity-20">Laporan</p></div>
            <a href="mutations.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='mutations'?'active-nav':''}"><i data-lucide="refresh-cw" class="w-4 h-4"></i><span class="text-sm sidebar-text">Mutasi Stok</span></a>
            <a href="history.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='history'?'active-nav':''}"><i data-lucide="history" class="w-4 h-4"></i><span class="text-sm sidebar-text">History TRX</span></a>
            <div class="pt-4 pb-2 px-3 sidebar-text"><p class="text-[10px] font-black uppercase opacity-20">Keamanan</p></div>
            <a href="users.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='users'?'active-nav':''}"><i data-lucide="shield-check" class="w-4 h-4"></i><span class="text-sm sidebar-text">Manajemen User</span></a>
            <a href="logs.html" class="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeId==='logs'?'active-nav':''}"><i data-lucide="scroll" class="w-4 h-4"></i><span class="text-sm sidebar-text">Log Aktivitas</span></a>
        </nav>`;
    if (window.lucide) lucide.createIcons();
}

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId); if (!container || totalPages <= 1) { if(container) container.innerHTML = ''; return; }
    container.innerHTML = '';
    const range = []; const delta = 1;
    for (let i = 1; i <= totalPages; i++) { if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) range.push(i); }
    let last = null;
    for (let i of range) {
        if (last !== null) {
            if (i - last === 2) renderPageButton(container, last + 1, false, onPageChange);
            else if (i - last > 2) { const dot = document.createElement('span'); dot.innerText = '...'; dot.className = "text-gray-400 px-2 font-bold"; container.appendChild(dot); }
        }
        renderPageButton(container, i, i === currentPage, onPageChange); last = i;
    }
}
function renderPageButton(container, page, isActive, onPageChange) {
    const btn = document.createElement('button');
    btn.className = `w-8 h-8 rounded-lg font-black text-[10px] transition-all ${isActive ? 'bg-orange-500 text-white shadow-lg' : 'bg-white border border-orange-100 text-[#A05C00] hover:bg-orange-50'}`;
    btn.innerText = page; btn.onclick = () => onPageChange(page); container.appendChild(btn);
}

// Logic Modules
function renderDashboard() {
    if (document.getElementById('dash-revenue')) document.getElementById('dash-revenue').innerText = formatIDR(state.revenue);
    if (document.getElementById('dash-trx-count')) document.getElementById('dash-trx-count').innerText = state.transactions.length;
    if (document.getElementById('dash-low-stock')) document.getElementById('dash-low-stock').innerText = state.products.filter(p => p.stock < 10).length;
    if (document.getElementById('dash-members')) document.getElementById('dash-members').innerText = state.members ? state.members.length : 0;
}

function renderInventory() {
    const tbody = document.getElementById('inventory-table-body'); if (!tbody) return;
    const search = document.getElementById('inventory-search')?.value.toLowerCase() || '';
    const cat = document.getElementById('inventory-category')?.value || 'Semua';
    const filtered = state.products.filter(p => (!search || p.name.toLowerCase().includes(search)) && (cat === 'Semua' || p.category === cat));
    const totalPages = Math.ceil(filtered.length / state.inventoryItemsPerPage);
    const paginated = filtered.slice((state.inventoryPage - 1) * state.inventoryItemsPerPage, state.inventoryPage * state.inventoryItemsPerPage);
    if (document.getElementById('inv-total')) document.getElementById('inv-total').innerText = filtered.length;
    tbody.innerHTML = paginated.map(p => `
        <tr class="hover:bg-gray-50/50">
            <td class="p-5"><b>${p.name}</b><br><span class="text-[10px] text-gray-400 uppercase font-bold">${p.sku}</span></td>
            <td class="p-5 font-bold">${p.category}</td>
            <td class="p-5 text-right font-black">${formatIDR(p.price)}</td>
            <td class="p-5 text-center font-black">${p.stock}</td>
            <td class="p-5 text-center"><span class="px-2 py-1 rounded-full text-[10px] font-black ${p.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}">${p.stock < 10 ? 'Menipis' : 'Tersedia'}</span></td>
            <td class="p-5 text-center"><div class="flex items-center justify-center gap-1">
                <button onclick="openStockModal(${p.id})" class="p-1 text-blue-500"><i data-lucide="package-plus" class="w-4 h-4"></i></button>
                <button onclick="openEditProductModal(${p.id})" class="p-1 text-orange-500"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                <button onclick="deleteProduct(${p.id})" class="p-1 text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div></td>
        </tr>`).join('');
    renderPagination('inv-page-controls', state.inventoryPage, totalPages, p => { state.inventoryPage = p; renderInventory(); });
    if (window.lucide) lucide.createIcons();
}

function openAddProductModal() {
    const modal = document.getElementById('add-product-modal'); if (!modal) return;
    document.getElementById('new-prod-name').value = '';
    document.getElementById('new-prod-price').value = '';
    document.getElementById('new-prod-stock').value = '';
    renderCategoryOptions();
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('add-product-modal-content').classList.remove('scale-95'); }, 10);
}
function closeAddProductModal() {
    const modal = document.getElementById('add-product-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); if (document.getElementById('add-product-modal-content')) document.getElementById('add-product-modal-content').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}
function saveNewProduct() {
    const name = document.getElementById('new-prod-name').value;
    const cat = document.getElementById('new-prod-category').value;
    const price = parseInt(document.getElementById('new-prod-price').value.replace(/\D/g, ''));
    const stock = parseInt(document.getElementById('new-prod-stock').value) || 0;
    if (!name || isNaN(price)) return showNotification('Nama dan Harga wajib diisi!', 'error');
    const id = Date.now();
    const p = { id, name, category: cat, price, stock, sku: 'UNA-NEW-' + id.toString().slice(-4) };
    state.products.unshift(p);
    addActivityLog('Tambah Produk', 'Admin', name);
    saveState(); closeAddProductModal(); renderInventory(); showNotification('Produk ditambahkan');
}

function openEditProductModal(id) {
    const p = state.products.find(x => x.id === id); if (!p) return;
    const modal = document.getElementById('edit-product-modal'); if (!modal) return;
    document.getElementById('edit-prod-id').value = id;
    document.getElementById('edit-prod-name').value = p.name;
    document.getElementById('edit-prod-category').value = p.category;
    document.getElementById('edit-prod-price').value = new Intl.NumberFormat('id-ID').format(p.price);
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('edit-product-modal-content').classList.remove('scale-95'); }, 10);
}
function closeEditProductModal() {
    const modal = document.getElementById('edit-product-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); if (document.getElementById('edit-product-modal-content')) document.getElementById('edit-product-modal-content').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}
function saveEditProduct() {
    const id = parseInt(document.getElementById('edit-prod-id').value);
    const p = state.products.find(x => x.id === id);
    if (p) {
        p.name = document.getElementById('edit-prod-name').value;
        p.category = document.getElementById('edit-prod-category').value;
        p.price = parseInt(document.getElementById('edit-prod-price').value.replace(/\D/g, ''));
        addActivityLog('Edit Produk', 'Admin', p.name);
        saveState(); closeEditProductModal(); renderInventory(); showNotification('Produk diupdate');
    }
}
function deleteProduct(id) {
    if (confirm('Hapus produk ini secara permanen?')) {
        const p = state.products.find(x => x.id === id);
        if (p) addActivityLog('Hapus Produk', 'Admin', p.name);
        state.products = state.products.filter(x => x.id !== id);
        saveState(); renderInventory(); showNotification('Produk dihapus');
    }
}

function renderCategoryMasterTab() {
    const tbody = document.getElementById('category-master-table-body'); if (!tbody) return;
    const paginated = state.categories.slice((state.categoryPage - 1) * state.categoryItemsPerPage, state.categoryPage * state.categoryItemsPerPage);
    if (document.getElementById('cat-total')) document.getElementById('cat-total').innerText = state.categories.length;
    tbody.innerHTML = paginated.map(c => `
        <tr class="hover:bg-gray-50/50">
            <td class="px-8 py-5"><b>${c.name}</b></td>
            <td class="px-8 py-5 text-center text-xs font-bold text-gray-400">${c.dateAdded || '-'}</td>
            <td class="px-8 py-5 text-center font-black text-orange-900">${state.products.filter(p => p.category === c.name).length} Produk</td>
            <td class="px-8 py-5 text-center">
                <div class="flex items-center justify-center gap-1">
                    <button onclick="openEditCategoryModal('${c.name}')" class="text-orange-500 p-2 hover:bg-orange-50 rounded-lg transition-all"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteCategory('${c.name}')" class="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        </tr>`).join('');
    renderPagination('cat-page-controls', state.categoryPage, Math.ceil(state.categories.length / state.categoryItemsPerPage), p => { state.categoryPage = p; renderCategoryMasterTab(); });
    if (window.lucide) lucide.createIcons();
}

function addCategoryFromTab() {
    const input = document.getElementById('new-category-tab-input'); const name = input.value.trim(); if (!name) return;
    state.categories.unshift({ name, dateAdded: new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) });
    input.value = ''; saveState(); renderCategoryMasterTab(); showNotification('Kategori ditambahkan');
}
function deleteCategory(name) { 
    if (confirm(`Hapus kategori "${name}"? Produk di kategori ini akan kehilangan kategorinya.`)) {
        state.categories = state.categories.filter(c => c.name !== name); 
        addActivityLog('Hapus Kategori', 'Admin', name);
        saveState(); renderCategoryMasterTab(); showNotification('Kategori dihapus'); 
    }
}

function openEditCategoryModal(name) {
    const modal = document.getElementById('edit-category-modal'); if (!modal) return;
    document.getElementById('edit-cat-old-name').value = name;
    document.getElementById('edit-cat-name').value = name;
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('edit-category-modal-content').classList.remove('scale-95'); }, 10);
}
function closeEditCategoryModal() {
    const modal = document.getElementById('edit-category-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); document.getElementById('edit-category-modal-content').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}
function saveEditCategory() {
    const oldName = document.getElementById('edit-cat-old-name').value;
    const newName = document.getElementById('edit-cat-name').value.trim();
    if (!newName) return showNotification('Nama kategori tidak boleh kosong!', 'error');
    
    const cat = state.categories.find(c => c.name === oldName);
    if (cat) {
        cat.name = newName;
        // Update all products in this category
        state.products.forEach(p => { if (p.category === oldName) p.category = newName; });
        addActivityLog('Edit Kategori', 'Admin', `${oldName} -> ${newName}`);
        saveState(); renderCategoryMasterTab(); closeEditCategoryModal(); 
        showNotification('Kategori diperbarui');
    }
}

function renderMembers() {
    const tbody = document.getElementById('member-table-body'); if (!tbody) return;
    const search = document.getElementById('member-search')?.value.toLowerCase() || '';
    const filtered = state.members.filter(m => m.name.toLowerCase().includes(search) || m.phone.includes(search));
    const totalPages = Math.ceil(filtered.length / state.memberItemsPerPage);
    const paginated = filtered.slice((state.memberPage - 1) * state.memberItemsPerPage, state.memberPage * state.memberItemsPerPage);
    if (document.getElementById('mem-total')) document.getElementById('mem-total').innerText = filtered.length;
    tbody.innerHTML = paginated.map(m => `
        <tr class="hover:bg-gray-50/50">
            <td class="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">${m.id}</td>
            <td class="px-8 py-5 font-bold">${m.name}</td>
            <td class="px-8 py-5 text-center font-bold text-green-600">${m.phone}</td>
            <td class="px-8 py-5 text-center font-black text-orange-500">${m.points} pts</td>
            <td class="px-8 py-5 text-center text-xs text-gray-400 font-bold">${m.joinDate}</td>
            <td class="px-8 py-5 text-center">
                <div class="flex items-center justify-center gap-1">
                    <button onclick="showMemberPointInfo('${m.id}')" class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Rincian Poin"><i data-lucide="info" class="w-4 h-4"></i></button>
                    <button onclick="openEditMemberModal('${m.id}')" class="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteMember('${m.id}')" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    renderPagination('mem-page-controls', state.memberPage, totalPages, p => { state.memberPage = p; renderMembers(); });
    if (window.lucide) lucide.createIcons();
}

function showMemberPointInfo(id) {
    const m = state.members.find(x => x.id === id); if (!m) return;
    const modal = document.getElementById('point-info-modal');
    const content = document.getElementById('point-info-modal-content');
    const list = document.getElementById('point-info-list');
    const nameEl = document.getElementById('point-info-mem-name');
    const idEl = document.getElementById('point-info-mem-id');
    const totalEl = document.getElementById('point-info-total-points');
    
    if (!modal || !list || !nameEl) return;
    
    nameEl.innerText = m.name;
    idEl.innerText = `ID: ${m.id}`;
    totalEl.innerText = m.points;
    
    const memberTrx = state.transactions.filter(t => t.customer === m.name);
    
    list.innerHTML = memberTrx.map(t => `
        <div class="flex justify-between items-center p-5 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-orange-50/30 transition-all group">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                    <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                </div>
                <div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">${t.id}</p>
                    <p class="text-xs font-bold text-gray-900">${t.date}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-black text-green-600">+${Math.floor(t.total / 10000)} <span class="text-[9px] uppercase">pts</span></p>
                <p class="text-[10px] font-bold text-gray-400 italic">${formatIDR(t.total)}</p>
            </div>
        </div>
    `).join('') || '<div class="text-center py-10 opacity-30 italic"><p class="font-bold">Belum ada riwayat</p><p class="text-[10px]">Transaksi member ini belum tercatat</p></div>';
    
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (content) content.classList.remove('scale-95');
    }, 10);
}

function closePointInfoModal() {
    const modal = document.getElementById('point-info-modal');
    const content = document.getElementById('point-info-modal-content');
    if (!modal) return;
    modal.classList.add('opacity-0');
    if (content) content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 500);
}

function openAddMemberModal() {
    const modal = document.getElementById('add-member-modal'); if (!modal) return;
    modal.classList.remove('hidden');
}
function closeAddMemberModal() {
    const modal = document.getElementById('add-member-modal'); if (!modal) return;
    modal.classList.add('hidden');
}
function saveNewMember() {
    const name = document.getElementById('new-mem-name').value;
    const phone = document.getElementById('new-mem-phone').value;
    if (!name || !phone) return showNotification('Nama dan WA wajib diisi!', 'error');
    state.members.unshift({ id: 'MEM-'+Date.now(), name, phone, points: 0, joinDate: new Date().toLocaleDateString('id-ID') });
    addActivityLog('Tambah Member', 'Admin', name);
    saveState(); closeAddMemberModal(); renderMembers(); showNotification('Member ditambahkan');
}

function openEditMemberModal(id) {
    const m = state.members.find(x => x.id === id); if (!m) return;
    const modal = document.getElementById('edit-member-modal'); if (!modal) return;
    document.getElementById('edit-mem-id').value = m.id;
    document.getElementById('edit-mem-name').value = m.name;
    document.getElementById('edit-mem-phone').value = m.phone;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}
function closeEditMemberModal() {
    const modal = document.getElementById('edit-member-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300);
}
function saveEditMember() {
    const id = document.getElementById('edit-mem-id').value;
    const m = state.members.find(x => x.id === id);
    if (m) {
        m.name = document.getElementById('edit-mem-name').value;
        m.phone = document.getElementById('edit-mem-phone').value;
        addActivityLog('Edit Member', 'Admin', m.name);
        saveState(); closeEditMemberModal(); renderMembers(); showNotification('Data member diupdate');
    }
}
function deleteMember(id) {
    if (confirm('Hapus member ini?')) {
        const m = state.members.find(x => x.id === id);
        if (m) addActivityLog('Hapus Member', 'Admin', m.name);
        state.members = state.members.filter(x => x.id !== id);
        saveState(); renderMembers(); showNotification('Member dihapus');
    }
}

function renderHistory() {
    const tbody = document.getElementById('history-table-body'); if (!tbody) return;
    const totalPages = Math.ceil(state.transactions.length / state.transactionItemsPerPage);
    const paginated = state.transactions.slice((state.transactionPage - 1) * state.transactionItemsPerPage, state.transactionPage * state.transactionItemsPerPage);
    if (document.getElementById('trx-total')) document.getElementById('trx-total').innerText = state.transactions.length;
    tbody.innerHTML = paginated.map(t => `
        <tr class="hover:bg-gray-50/50">
            <td class="px-8 py-5"><b>${t.id}</b><br><span class="text-[10px] text-gray-400 font-bold uppercase">${t.date}</span></td>
            <td class="px-8 py-5 font-bold text-orange-900">${t.customer}</td>
            <td class="px-8 py-5 text-right font-black text-lg">${formatIDR(t.total)}</td>
            <td class="px-8 py-5 text-center"><span class="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase">Selesai</span></td>
            <td class="px-8 py-5 text-center"><div class="flex items-center justify-center gap-1">
                <button class="p-2 text-blue-500"><i data-lucide="printer" class="w-4 h-4"></i></button>
            </div></td>
        </tr>`).join('') || '<tr><td colspan="5" class="p-20 text-center opacity-30 font-bold italic">Belum ada transaksi</td></tr>';
    renderPagination('trx-page-controls', state.transactionPage, totalPages, p => { state.transactionPage = p; renderHistory(); });
    if (window.lucide) lucide.createIcons();
}

function renderStockHistory() {
    const tbody = document.getElementById('stock-mutation-table-body'); if (!tbody) return;
    const totalPages = Math.ceil(state.stockHistory.length / state.stockHistoryItemsPerPage);
    const paginated = state.stockHistory.slice((state.stockHistoryPage - 1) * state.stockHistoryItemsPerPage, state.stockHistoryPage * state.stockHistoryItemsPerPage);
    if (document.getElementById('sh-total')) document.getElementById('sh-total').innerText = state.stockHistory.length;
    tbody.innerHTML = paginated.map((h, i) => {
        const realIndex = (state.stockHistoryPage - 1) * state.stockHistoryItemsPerPage + i;
        const qtySign = h.qty > 0 ? '+' : '';
        const typeLabel = h.type === 'add' ? 'Masuk' : h.type === 'sub' ? 'Keluar' : 'Set';
        const typeClass = h.type === 'add' ? 'bg-green-50 text-green-600' : h.type === 'sub' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600';
        
        return `<tr class="hover:bg-gray-50/50">
            <td class="px-8 py-5"><b>${h.prodName}</b><br><span class="text-[10px] text-gray-400 font-bold uppercase">${h.prodSku}</span></td>
            <td class="px-8 py-5 text-center"><span class="px-2 py-1 rounded-full text-[10px] font-black ${typeClass}">${typeLabel}</span></td>
            <td class="px-8 py-5 text-center font-black ${h.qty > 0 ? 'text-green-600' : h.qty < 0 ? 'text-red-500' : ''}">${qtySign}${h.qty}</td>
            <td class="px-8 py-5 text-center font-bold">${h.cashier}</td>
            <td class="px-8 py-5 text-center text-xs text-gray-400 font-bold">${h.date}</td>
            <td class="px-8 py-5 text-xs italic text-gray-500">${h.note || '-'}</td>
            <td class="px-8 py-5 text-center">
                <div class="flex items-center justify-center gap-1">
                    <button onclick="openEditMutationModal(${realIndex})" class="p-1 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit Keterangan"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteStockHistory(${realIndex})" class="p-1 text-red-500 hover:bg-red-50 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="7" class="p-20 text-center opacity-30 font-bold italic">Belum ada riwayat mutasi</td></tr>';
    renderPagination('sh-page-controls', state.stockHistoryPage, totalPages, p => { state.stockHistoryPage = p; renderStockHistory(); });
    if (window.lucide) lucide.createIcons();
}

function deleteStockHistory(index) {
    if (confirm('Hapus riwayat mutasi ini?')) {
        state.stockHistory.splice(index, 1);
        saveState(); renderStockHistory();
        showNotification('Riwayat mutasi dihapus');
    }
}

function openEditMutationModal(index) {
    const h = state.stockHistory[index]; if (!h) return;
    const modal = document.getElementById('edit-mutation-modal'); if (!modal) return;
    document.getElementById('edit-mut-index').value = index;
    document.getElementById('edit-mut-note').value = h.note || '';
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeEditMutationModal() {
    const modal = document.getElementById('edit-mutation-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300);
}

function saveEditMutation() {
    const index = document.getElementById('edit-mut-index').value;
    const note = document.getElementById('edit-mut-note').value;
    if (state.stockHistory[index]) {
        state.stockHistory[index].note = note;
        saveState(); renderStockHistory(); closeEditMutationModal();
        showNotification('Keterangan diperbarui');
    }
}

function openStockModal(id) {
    const p = state.products.find(x => x.id === id); if (!p) return;
    const modal = document.getElementById('stock-modal'); if (!modal) return;
    document.getElementById('stock-prod-id').value = id;
    document.getElementById('stock-prod-name').innerText = p.name;
    document.getElementById('stock-prod-value').value = p.stock;
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('stock-modal-content').classList.remove('scale-95'); }, 10);
}

function closeStockModal() {
    const modal = document.getElementById('stock-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); if (document.getElementById('stock-modal-content')) document.getElementById('stock-modal-content').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function saveStock() {
    const id = parseInt(document.getElementById('stock-prod-id').value);
    const newStock = parseInt(document.getElementById('stock-prod-value').value);
    const note = document.getElementById('stock-note').value;
    const authId = document.getElementById('stock-auth-id').value;
    const authPass = document.getElementById('stock-auth-pass').value;
    const cashier = state.cashiers.find(c => c.id === authId && c.pass === authPass);
    if (!cashier) return showNotification('Otorisasi Gagal!', 'error');
    const p = state.products.find(x => x.id === id);
    if (p && !isNaN(newStock)) {
        const diff = newStock - p.stock;
        if (diff !== 0) {
            state.stockHistory.unshift({
                prodName: p.name, prodSku: p.sku, type: diff > 0 ? 'add' : 'sub', qty: diff,
                cashier: cashier.name, date: new Date().toLocaleString('id-ID'), note: note || 'Update Stok Inventory'
            });
            addActivityLog('Update Stok', cashier.name, `${p.name} (${diff > 0 ? '+' : ''}${diff})`);
            p.stock = newStock;
            saveState(); renderInventory(); closeStockModal(); showNotification('Stok diperbarui');
        } else { closeStockModal(); }
    }
}

function openManualMutationModal() {
    const modal = document.getElementById('mutation-modal'); if (!modal) return;
    document.getElementById('mutation-prod-list').innerHTML = state.products.map(p => `<option value="${p.name} (${p.sku})">`).join('');
    modal.classList.remove('hidden'); setTimeout(() => modal.classList.remove('opacity-0'), 10);
}
function closeMutationModal() { const modal = document.getElementById('mutation-modal'); modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300); }

function saveManualMutation() {
    const prodInput = document.getElementById('mutation-prod-input').value;
    const qty = parseInt(document.getElementById('mutation-value').value);
    const note = document.getElementById('mutation-note').value;
    const authId = document.getElementById('mutation-auth-id').value;
    const authPass = document.getElementById('mutation-auth-pass').value;
    const cashier = state.cashiers.find(c => c.id === authId && c.pass === authPass);
    
    if (!cashier) return showNotification('Otorisasi gagal!', 'error');
    if (!prodInput || isNaN(qty) || qty === 0) return showNotification('Data tidak valid / Jumlah harus lebih dari 0!', 'error');
    
    const sku = (prodInput.match(/\(([^)]+)\)/) || [])[1];
    const p = state.products.find(x => x.sku === sku);
    if (!p) return showNotification('Produk tidak ditemukan!', 'error');
    
    // Fallback to UI state if variable is not enough
    let type = typeof currentMutationType !== 'undefined' ? currentMutationType : 'add';
    if (document.getElementById('mut-type-sub')?.classList.contains('bg-white')) type = 'sub';
    if (document.getElementById('mut-type-set')?.classList.contains('bg-white')) type = 'set';
    
    let realQty = qty;
    if (type === 'sub') realQty = -qty;
    if (type === 'set') { realQty = qty - p.stock; p.stock = qty; } else { p.stock += realQty; }
    
    state.stockHistory.unshift({ 
        prodName: p.name, 
        prodSku: p.sku, 
        type, 
        qty: realQty, 
        cashier: cashier.name, 
        date: new Date().toLocaleString('id-ID'),
        note: note || (type === 'set' ? 'Penyesuaian Stok' : 'Manual')
    });
    addActivityLog('Mutasi Manual', cashier.name, p.name);
    saveState(); renderStockHistory(); closeMutationModal(); showNotification('Mutasi dicatat');
}

function renderCategoryOptions() {
    const sel = document.getElementById('inventory-category'); if (!sel) return;
    sel.innerHTML = '<option value="Semua">Semua Kategori</option>' + state.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function renderUsers() {
    const tbody = document.getElementById('user-table-body'); if (!tbody) return;
    tbody.innerHTML = state.cashiers.map(u => `
        <tr class="hover:bg-gray-50/50">
            <td class="px-8 py-5 text-[10px] uppercase text-gray-400">${u.id}</td>
            <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">${u.name.charAt(0)}</div>
                    ${u.name}
                </div>
            </td>
            <td class="px-8 py-5 text-center">
                <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role==='Admin'?'bg-red-50 text-red-500':'bg-blue-50 text-blue-500'}">
                    ${u.role}
                </span>
            </td>
            <td class="px-8 py-5 text-center text-gray-400 text-xs">${u.email}</td>
            <td class="px-8 py-5 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="openEditUserModal('${u.id}')" class="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    ${u.id !== 'admin' ? `<button onclick="deleteUser('${u.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function openAddUserModal() {
    const modal = document.getElementById('user-modal'); if (!modal) return;
    document.getElementById('user-modal-title').innerText = 'Tambah User Baru';
    document.getElementById('user-edit-id').value = '';
    document.getElementById('user-name').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-pass').value = '';
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function openEditUserModal(id) {
    const u = state.cashiers.find(x => x.id === id); if (!u) return;
    const modal = document.getElementById('user-modal'); if (!modal) return;
    document.getElementById('user-modal-title').innerText = 'Edit Data User';
    document.getElementById('user-edit-id').value = u.id;
    document.getElementById('user-name').value = u.name;
    document.getElementById('user-email').value = u.email;
    document.getElementById('user-role').value = u.role;
    document.getElementById('user-pass').value = u.pass;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeUserModal() {
    const modal = document.getElementById('user-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300);
}

function saveUser() {
    const id = document.getElementById('user-edit-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;
    const pass = document.getElementById('user-pass').value;

    if (!name || !email || !pass) return showNotification('Lengkapi semua data!', 'error');

    if (id) {
        const u = state.cashiers.find(x => x.id === id);
        if (u) { 
            Object.assign(u, { name, email, role, pass }); 
            addActivityLog('Edit User', 'Admin', name);
        }
    } else {
        state.cashiers.push({ id: 'USR-' + Date.now(), name, email, role, pass, joinDate: new Date().toLocaleDateString('id-ID') });
        addActivityLog('Tambah User', 'Admin', name);
    }

    saveState(); closeUserModal(); renderUsers();
    showNotification(id ? 'Data user diperbarui' : 'User baru ditambahkan');
}

function deleteUser(id) {
    if (id === 'admin') return;
    if (confirm('Hapus user ini selamanya?')) {
        const u = state.cashiers.find(x => x.id === id);
        if (u) addActivityLog('Hapus User', 'Admin', u.name);
        state.cashiers = state.cashiers.filter(x => x.id !== id);
        saveState(); renderUsers(); showNotification('User telah dihapus');
    }
}
