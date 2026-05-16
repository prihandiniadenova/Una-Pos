# 🍊 UNA POS - Modern Management & POS System

UNA POS adalah sistem Manajemen Inventaris dan Point of Sale (POS) modern yang dirancang dengan estetika *Warm & Premium*. Aplikasi ini berjalan sepenuhnya di browser menggunakan `localStorage` untuk penyimpanan data, menjadikannya solusi cepat dan ringan untuk pengelolaan toko.

## ✨ Fitur Utama

- **📊 Dashboard Pintar**: Visualisasi data real-time untuk Omzet, Jumlah Transaksi, Stok Menipis, dan Total Member.
- **📦 Manajemen Inventaris**:
  - Pelacakan stok otomatis.
  - Status stok dinamis (Tersedia, Menipis, Habis).
  - Manajemen kategori produk.
  - Export data stok ke Excel.
- **🛒 Point of Sale (POS)**:
  - Pencarian produk cepat dengan barcode/nama.
  - Sistem keranjang belanja (Cart).
  - Kalkulasi Pajak (PPN 11%) dan Diskon Member otomatis.
  - Berbagai metode pembayaran (Tunai, QRIS, Transfer, Voucher).
- **👥 Sistem Membership**:
  - Database pelanggan terintegrasi.
  - Diskon khusus member (10%).
  - Pelacakan poin loyalitas.
- **🔐 Keamanan & Audit**:
  - Otorisasi Kasir (ID & Password) untuk aksi kritis seperti edit/hapus transaksi.
  - Log Audit untuk setiap perubahan data sensitif.
  - Riwayat Buka/Tutup Kasir (Shift Management).

## 🎨 Desain Sistem (Warm Theme)

Aplikasi ini menggunakan palet warna yang memberikan kesan hangat dan profesional:
- **Background Utama**: `#F6F1E9`
- **Warna Card/Kontainer**: `#FFFDF8`
- **Highlight (Yellow)**: `#FFD93D`
- **Aksen Utama (Orange)**: `#FF9A00`
- **Tipografi**: Plus Jakarta Sans & Inter.

## 🚀 Cara Penggunaan

1. **Persiapan**: Pastikan browser Anda mendukung `localStorage`.
2. **Inisialisasi**: Saat pertama kali dibuka, aplikasi akan memuat data sampel.
3. **Buka Kasir**: Sebelum melakukan transaksi, kasir harus memasukkan saldo awal melalui tombol "Buka Kasir".
4. **Transaksi**: Pilih produk, masukkan ke keranjang, pilih member (opsional), dan selesaikan pembayaran.
5. **Manajemen**: Gunakan tab di sidebar untuk mengelola stok, melihat riwayat, atau menambah akun kasir.

## 🛠️ Teknologi yang Digunakan

- **HTML5 & Vanilla JavaScript (ES6+)**
- **Tailwind CSS** (via CDN)
- **Lucide Icons** (Ikonografi modern)
- **SheetJS** (Untuk fitur Export Excel)
- **Local Storage API** (Persistence data tanpa database server)

---
*Dikembangkan dengan ❤️ untuk UNA POS.*
