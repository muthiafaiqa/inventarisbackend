# Product Requirement Document (PRD)
## Sistem Peramalan Stok Barang Berbasis Website — Toko Surya Elektrik

**Tanggal:** 2026-06-30  
**Status:** Approved  
**Arsitektur Target:** Modular Monolith (Clean Architecture)  
**Metode Peramalan:** Trend Moment & Mean Absolute Percentage Error (MAPE)  

---

## 1. Latar Belakang & Masalah (Problem Statement)
Toko Surya Elektrik selama ini mengandalkan sistem pencatatan persediaan barang dagang secara manual menggunakan buku besar. Pendekatan konvensional ini melahirkan berbagai tantangan operasional yang menghambat efisiensi dan profitabilitas bisnis, di antaranya:
* **Context Evaporation & Data Loss:** Risiko kehilangan catatan fisik atau kerusakan dokumen historis sangat tinggi.
* **Stock Imbalance (Overstock & Understock):** Ketiadaan kalkulasi berbasis data analitis membuat perkiraan kebutuhan stok di masa mendatang menjadi tidak presisi. Hal ini mengakibatkan penumpukan modal kerja pada produk lambat (overstock) serta hilangnya potensi omzet akibat kekosongan barang esensial (understock).
* **Infrastruktur Bisnis yang Rentan:** Industri ritel elektronik bergerak sangat dinamis seiring perkembangan teknologi. Ketiadaan visibilitas performa pergerakan stok real-time menurunkan daya saing toko.

---

## 2. Solusi Sistem (Solution)
Membangun sistem *backend* berskala enterprise menggunakan pendekatan **Modular Monolith** dengan pembagian *Clean Architecture layers* yang ketat. Sistem ini mengintegrasikan manajemen inventaris harian dengan mesin peramalan deret waktu (*time-series forecasting*) menggunakan metode **Trend Moment**. Keandalan model peramalan akan diukur secara otomatis menggunakan metrik **Mean Absolute Percentage Error (MAPE)** untuk memastikan deviasi prediksi tetap berada di bawah batas toleransi bisnis (< 10%).

---

## 3. Batas Modul (Bounded Contexts)
Sistem dipecah menjadi empat modul independen yang terisolasi, di mana komunikasi lintas modul wajib melewati *Public API layer* menggunakan DTO flat guna mencegah kebocoran model domain internal:

```
src/modules/
├── user/          # Mengelola kredensial dan sesi autentikasi Admin.
├── inventory/     # Mengelola master data barang dan riwayat log mutasi stok.
├── sales/         # Mengelola pencatatan transaksi penjualan kasir.
└── forecasting/   # Core engine komputasi matematis peramalan & evaluasi MAPE.
```

---

## 4. Spesifikasi Aliran Data Fungsional (User Stories)

### Modul A: User & Autentikasi
1. **Login Sesi:** Sebagai Admin, saya ingin masuk ke sistem menggunakan email dan password yang terenkripsi agar seluruh fitur manajerial terlindungi dari akses ilegal.
2. **Proteksi Endpoint:** Sebagai Sistem, saya ingin memverifikasi token JWT pada setiap *protected request* guna memastikan integritas keamanan data.
3. **Logout Sesi:** Sebagai Admin, saya ingin dapat mengakhiri sesi secara aman agar token akses dinonaktifkan dari perangkat.

### Modul B: Inventory (Barang & Stok)
4. **Master Data CRUD:** Sebagai Admin, saya ingin menambah, mengubah, menampilkan, dan menghapus data barang (SKU, Nama, Unit, Harga Dasar, Minimum Stok) agar katalog kasir tetap aktual.
5. **Log Mutasi Stok:** Sebagai Admin, saya ingin sistem mencatat setiap penambahan atau pengurangan stok secara otomatis dalam bentuk tipe mutasi (`IN`, `OUT`, `ADJUSTMENT`) beserta tanggalnya untuk keperluan audit persediaan.

### Modul C: Sales (Penjualan)
6. **Checkout Multi-Item:** Sebagai Kasir, saya ingin memproses transaksi penjualan yang mencakup beberapa item barang sekaligus dalam satu nomor faktur (*invoice*).
7. **Snapshot Penjualan:** Sebagai Sistem, saya wajib menyimpan *snapshot* nama barang dan harga satuan saat transaksi diselesaikan ke tabel detail transaksi. Hal ini memastikan laporan keuangan historis dan dataset peramalan tidak berubah meskipun data master barang diubah atau dihapus di kemudian hari.

### Modul D: Forecasting (Peramalan Stok)
8. **Kalkulasi Peramalan:** Sebagai Admin, saya ingin sistem menarik data historis penjualan dari modul *Sales* untuk menghitung prediksi kebutuhan persediaan bulan berikutnya menggunakan rumus matematis *Trend Moment*.
9. **Evaluasi Akurasi (MAPE):** Sebagai Admin, saya ingin sistem menampilkan persentase tingkat kesalahan (*error rate*) peramalan menggunakan metrik MAPE agar saya bisa menilai keandalan hasil prediksi sebelum mengambil keputusan pembelian stok secara preventif.

---

## 5. Rancangan Basis Data & Integritas Relasional
Skema database diimplementasikan menggunakan PostgreSQL dengan pemetaan berbasis *snake_case* pada layer tabel. Berikut adalah konvensi relasi murni untuk memelihara integritas data jangka panjang:

### ERD Relational Map
* **`users`**: Menyimpan data akun administratif (`id`, `email`, `password`, `nama`).
* **`products`**: Menyimpan entitas barang unik (`id`, `sku` [UNIQUE], `nama`, `harga`, `unit`, `min_stock`).
* **`stock_movements`**: Log mutasi fisik barang. Memiliki relasi *Many-to-One* ke `products`. Menggunakan aturan `ON DELETE CASCADE` (jika barang dihapus dari sistem, log mutasinya dibersihkan).
* **`transactions`**: Header invoice penjualan (`id`, `total_amount`, `created_at`).
* **`transaction_items`**: Baris detail transaksi barang keluar. Relasi ke `products` wajib dikonfigurasi menggunakan aturan **`ON DELETE SET NULL`** dan field `product_id` dibuat opsional (*nullable*). Strategi ini memastikan bahwa jika barang dihapus dari katalog aktif, baris transaksi masa lampau tidak akan hilang, menjaga dataset *time-series forecasting* tetap utuh dan valid.

---

## 6. Spesifikasi Core Engine Peramalan (Forecasting Specification)

Modul `forecasting` mengimplementasikan kalkulasi statistik deret waktu secara otomatis tanpa pustaka pihak ketiga eksternal untuk menjamin performa eksekusi komputasi.

### A. Rumus Matematis Trend Moment
Persamaan garis tren dinyatakan dengan formula:
$$Y = a + bX$$

Untuk mencari nilai konstanta $a$ dan koefisien $b$, sistem mengeksekusi metode eliminasi persamaan linear dua variabel dari data historis:
1. $$\Sigma Y = n \cdot a + b \cdot \Sigma X$$
2. $$\Sigma XY = a \cdot \Sigma X + b \cdot \Sigma X^2$$

Secara programatik, rumus diselesaikan dengan algoritma berikut:
$$b = rac{n(\Sigma XY) - (\Sigma X)(\Sigma Y)}{n(\Sigma X^2) - (\Sigma X)^2}$$

$$a = rac{\Sigma Y - b(\Sigma X)}{n}$$

*Keterangan Variabel:*
* $Y$ = Hasil peramalan stok/penjualan pada periode ke-t.
* $X$ = Indeks waktu peninjauan (dimulai dari $0, 1, 2, 3, \dots, n-1$).
* $n$ = Jumlah total periode data historis yang tersedia.

### B. Rumus Validasi Akurasi (MAPE)
Tingkat presisi model dievaluasi secara matematis melalui rumus kesalahan persentase absolut rata-rata:
$$	ext{MAPE} = \left( rac{1}{n} \sum_{t=1}^{n} \left| rac{X_t - F_t}{X_t} ight| ight) 	imes 100\%$$

*Keterangan Variabel:*
* $X_t$ = Data Penjualan Riil (Aktual) pada periode ke-t.
* $F_t$ = Nilai Hasil Peramalan (Forecast) pada periode ke-t.

**Standar Keandalan Bisnis (Tabel Range MAPE):**
* $	ext{MAPE} < 10\%$ = Kemampuan peramalan **Sangat Baik** (Target Utama Sistem).
* $10\% \le 	ext{MAPE} < 20\%$ = Kemampuan peramalan **Baik**.
* $20\% \le 	ext{MAPE} < 50\%$ = Kemampuan peramalan **Layak**.
* $	ext{MAPE} \ge 50\%$ = Kemampuan peramalan **Buruk / Ditolak**.

---

## 7. Kontrak REST API (API Contracts)

Semua *request body* wajib melalui *middleware* penapisan skema Zod sebelum diteruskan ke *Application Use Case*.

| Method | Endpoint | Auth | Deskripsi | Status Code Sukses |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Otentikasi Admin, return JWT | `200 OK` |
| `POST` | `/api/auth/logout` | ❌ | Terminasi sesi JWT | `204 No Content` |
| `GET` | `/api/products` | ✅ | Mengambil katalog barang aktif | `200 OK` |
| `POST` | `/api/products` | ✅ | Menambah produk baru ke katalog | `201 Created` |
| `PUT` | `/api/products/:id` | ✅ | Mengubah detail data spesifikasi barang | `200 OK` |
| `DELETE` | `/api/products/:id` | ✅ | Menghapus barang dari katalog aktif | `200 OK` |
| `POST` | `/api/transactions` | ✅ | Mencatat transaksi kasir baru (mutasi stok keluar) | `201 Created` |
| `GET` | `/api/transactions/history` | ✅ | Mengambil histori invoice | `200 OK` |
| `GET` | `/api/forecasting/predict/:product_id` | ✅ | Menghitung Trend Moment & MAPE produk | `200 OK` |

---

## 8. Prinsip Pengujian Mutu Sistem (Testing Decisions)
Pengujian perangkat lunak berfokus pada pendekatan **Blackbox API Testing** untuk menguji fungsionalitas eksternal sistem secara independen:
* **Validasi Layer Keamanan:** Memastikan request protected tanpa menyertakan token JWT yang sah diblokir otomatis dengan kode respons `401 Unauthorized`.
* **Validasi Skema Zod:** Memastikan pengiriman data dengan tipe data salah (misal harga bernilai negatif atau nama barang kosong) dihentikan di layer terluar dengan kode respons `400 Bad Request`.
* **Uji Logika Bisnis Duplikasi:** Mengirimkan SKU produk yang sudah terdaftar di basis data wajib memicu pengecualian kode bisnis `409 Conflict`.
* **Akurasi Komputasi:** Menghastikan hasil kalkulasi *array* angka $Y = a + bX$ dan persentase MAPE pada endpoint `/api/forecasting/predict/:product_id` akurat hingga 4 angka di belakang koma dibandingkan dengan data pengujian manual.
