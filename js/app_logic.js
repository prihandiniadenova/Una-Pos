// ... (previous app.js content)

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
            <td class="px-8 py-5 text-center">
                <span class="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">Selesai</span>
            </td>
            <td class="px-8 py-5 text-center">
                <div class="flex items-center justify-center gap-1">
                    <button class="p-2 text-blue-500 hover:bg-blue-50 rounded-xl" title="Struk"><i data-lucide="printer" class="w-4 h-4"></i></button>
                    <button class="p-2 text-slate-400 hover:bg-slate-50 rounded-xl" title="Detail"><i data-lucide="eye" class="w-4 h-4"></i></button>
                </div>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="p-20 text-center opacity-30 font-bold italic">Belum ada transaksi</td></tr>';
    renderPagination('trx-page-controls', state.transactionPage, totalPages, p => { state.transactionPage = p; renderHistory(); });
    if (window.lucide) lucide.createIcons();
}

function renderStockHistory() {
    const tbody = document.getElementById('stock-mutation-table-body'); if (!tbody) return;
    const totalPages = Math.ceil(state.stockHistory.length / state.stockHistoryItemsPerPage);
    const paginated = state.stockHistory.slice((state.stockHistoryPage - 1) * state.stockHistoryItemsPerPage, state.stockHistoryPage * state.stockHistoryItemsPerPage);
    
    if (document.getElementById('sh-total')) document.getElementById('sh-total').innerText = state.stockHistory.length;
    tbody.innerHTML = paginated.map(h => `
        <tr class="hover:bg-gray-50/50">
            <td class="px-8 py-5"><b>${h.prodName}</b><br><span class="text-[10px] text-gray-400 font-bold uppercase">${h.prodSku}</span></td>
            <td class="px-8 py-5 text-center"><span class="px-2 py-1 rounded-full text-[10px] font-black ${h.type === 'add' ? 'bg-green-50 text-green-600' : h.type === 'sub' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}">${h.type === 'add' ? 'Masuk' : h.type === 'sub' ? 'Keluar' : 'Set'}</span></td>
            <td class="px-8 py-5 text-center font-black ${h.qty >= 0 ? 'text-green-600' : 'text-red-500'}">${h.qty >= 0 ? '+' : ''}${h.qty}</td>
            <td class="px-8 py-5 text-center font-bold text-gray-900">${h.cashier}</td>
            <td class="px-8 py-5 text-center text-xs text-gray-400 font-bold">${h.date}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="p-20 text-center opacity-30 font-bold italic">Belum ada riwayat mutasi</td></tr>';
    renderPagination('sh-page-controls', state.stockHistoryPage, totalPages, p => { state.stockHistoryPage = p; renderStockHistory(); });
    if (window.lucide) lucide.createIcons();
}

function openManualMutationModal() {
    const modal = document.getElementById('mutation-modal'); if (!modal) return;
    const list = document.getElementById('mutation-prod-list');
    if (list) list.innerHTML = state.products.map(p => `<option value="${p.name} (${p.sku})">`).join('');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('mutation-modal-content')?.classList.remove('scale-95'); }, 10);
}

function closeMutationModal() {
    const modal = document.getElementById('mutation-modal'); if (!modal) return;
    modal.classList.add('opacity-0'); document.getElementById('mutation-modal-content')?.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function saveManualMutation() {
    const prodInput = document.getElementById('mutation-prod-input').value;
    const qty = parseInt(document.getElementById('mutation-value').value);
    const note = document.getElementById('mutation-note').value;
    const authId = document.getElementById('mutation-auth-id').value;
    const authPass = document.getElementById('mutation-auth-pass').value;
    
    const cashier = state.cashiers.find(c => c.id === authId && c.pass === authPass);
    if (!cashier) return showNotification('Otorisasi kasir gagal!', 'error');
    if (!prodInput || isNaN(qty)) return showNotification('Data tidak valid!', 'error');
    
    const skuMatch = prodInput.match(/\(([^)]+)\)/);
    const sku = skuMatch ? skuMatch[1] : '';
    const p = state.products.find(x => x.sku === sku);
    if (!p) return showNotification('Produk tidak ditemukan!', 'error');
    
    const type = typeof currentMutationType !== 'undefined' ? currentMutationType : 'add';
    let realQty = qty;
    if (type === 'sub') realQty = -qty;
    if (type === 'set') { realQty = qty - p.stock; p.stock = qty; } else { p.stock += realQty; }
    
    state.stockHistory.unshift({
        prodName: p.name, prodSku: p.sku, type: type, qty: realQty, cashier: cashier.name, date: new Date().toLocaleString('id-ID'), note: note
    });
    
    saveState(); renderStockHistory(); closeMutationModal();
    showNotification('Mutasi stok berhasil dicatat');
}

function exportToExcel() { showNotification('Fitur Ekspor sedang diproses...'); }
function renderCategoryOptions() {
    const sel = document.getElementById('inventory-category'); if (!sel) return;
    sel.innerHTML = '<option value="Semua">Semua Kategori</option>' + state.categories.map(c => `<option value="${typeof c === 'string' ? c : c.name}">${typeof c === 'string' ? c : c.name}</option>`).join('');
}
