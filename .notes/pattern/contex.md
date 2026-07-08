# Test Plan: Inventaris & POS Surya Elektrik Backend

Dokumen ini mendokumentasikan perencanaan pengujian backend (API) untuk sistem POS & peramalan inventaris Surya Elektrik. Test plan ini telah mencakup 15 skenario pengujian utama dengan total 45 test case, termasuk kategori (Positive, Negative, Edge) dan tingkat prioritasnya.

---

## Ringkasan Skenario Pengujian

| Scenario ID | Endpoint / Fitur | Deskripsi Alur Bisnis |
| :--- | :--- | :--- |
| **SC-01** | `POST /api/auth/register` | Pendaftaran akun admin baru untuk mengelola sistem. |
| **SC-02** | `POST /api/auth/login` | Autentikasi pengguna untuk mendapatkan token JWT. |
| **SC-03** | `authMiddleware` | Verifikasi proteksi token JWT di endpoint sensitif. |
| **SC-04** | `POST /api/products` | Penambahan produk barang baru ke katalog master. |
| **SC-05** | `GET /api/products` | Pengambilan daftar katalog produk aktif. |
| **SC-06** | `PUT /api/products/:id` | Perubahan detail informasi produk (nama, harga, dsb). |
| **SC-07** | `DELETE /api/products/:id` | Penghapusan produk dari katalog aktif. |
| **SC-08** | `POST /api/inventory/add-stock` | Peningkatan jumlah stok barang fisik masuk. |
| **SC-09** | `POST /api/transactions` | Checkout transaksi penjualan kasir (multi-item). |
| **SC-10** | Relasi Transaksional & ON DELETE | Integritas data detail transaksi lama saat produk dihapus. |
| **SC-11** | `GET /api/transactions/history` | Penarikan data riwayat log transaksi penjualan. |
| **SC-12** | `GET /api/forecasting/predict/:product_id` | Kalkulasi peramalan stok periode depan dengan rumus Trend Moment. |
| **SC-13** | Evaluasi MAPE | Penghitungan persentase error peramalan (MAPE). |
| **SC-14** | Batasan Minimum Periode Data | Penanganan sistem jika data penjualan kurang dari minimum (n < 2). |
| **SC-15** | Filter Rentang Tanggal | Validasi parameter query string periode tanggal awal dan akhir. |

---

## Detail Skenario & Test Cases

### Skenario 1: Registrasi Admin Baru (`POST /api/auth/register`)
*   **TC-01 [POSITIVE] - High Priority:**
    Registrasi sukses menggunakan data valid (email baru belum terdaftar, password minimal 6 karakter, nama lengkap terisi).
*   **TC-02 [NEGATIVE] - High Priority:**
    Registrasi gagal jika email yang didaftarkan sudah ada dalam database (Conflict - 409).
*   **TC-03 [EDGE] - Medium Priority:**
    Registrasi gagal jika request body nama dikirim sebagai string kosong (Validation Error - 400).

### Skenario 2: Login Admin (`POST /api/auth/login`)
*   **TC-04 [POSITIVE] - High Priority:**
    Login sukses dengan kredensial email dan password yang cocok, mengembalikan token JWT.
*   **TC-05 [NEGATIVE] - High Priority:**
    Login gagal jika password yang dimasukkan salah (Unauthorized - 401).
*   **TC-06 [EDGE] - Medium Priority:**
    Login gagal jika format email tidak valid sesuai Zod Schema (Bad Request - 400).

### Skenario 3: Proteksi Endpoint dengan JWT (`authMiddleware`)
*   **TC-07 [POSITIVE] - High Priority:**
    Mengakses endpoint sensitif (misal: penambahan produk) menggunakan header `Authorization: Bearer <token_valid>`.
*   **TC-08 [NEGATIVE] - High Priority:**
    Mengakses endpoint terproteksi tanpa menyertakan header Authorization (Unauthorized - 401).
*   **TC-09 [EDGE] - High Priority:**
    Mengakses endpoint terproteksi dengan token yang sudah kedaluwarsa atau dimanipulasi secara ilegal (401).

### Skenario 4: Pembuatan Produk Baru (`POST /api/products`)
*   **TC-10 [POSITIVE] - High Priority:**
    Menambahkan produk baru ke katalog dengan data lengkap (sku, nama, harga, unit, minStock) dan SKU belum terdaftar.
*   **TC-11 [NEGATIVE] - High Priority:**
    Gagal menambahkan produk baru jika SKU yang dikirim sudah terdaftar pada produk lain (Conflict - 409).
*   **TC-12 [EDGE] - Medium Priority:**
    Gagal menambahkan produk jika nilai harga yang dimasukkan bernilai negatif (Bad Request - 400).

### Skenario 5: Pengambilan Katalog Produk (`GET /api/products`)
*   **TC-13 [POSITIVE] - Medium Priority:**
    Mengambil seluruh daftar katalog produk aktif dari database.
*   **TC-14 [NEGATIVE] - Low Priority:**
    Penanganan elegan sistem (mengembalikan format error terpusat 500) saat database terputus.
*   **TC-15 [EDGE] - Low Priority:**
    Mengembalikan array kosong `[]` secara sukses saat database belum memiliki data produk sama sekali.

### Skenario 6: Pembaruan Detail Produk (`PUT /api/products/:id`)
*   **TC-16 [POSITIVE] - High Priority:**
    Memperbarui harga dan nama produk dengan ID produk valid.
*   **TC-17 [NEGATIVE] - High Priority:**
    Gagal memperbarui produk jika ID produk tidak terdaftar di database (Not Found - 404).
*   **TC-18 [EDGE] - Medium Priority:**
    Gagal memperbarui produk jika format ID produk pada URL param bukan berformat UUID.

### Skenario 7: Penghapusan Produk dari Katalog (`DELETE /api/products/:id`)
*   **TC-19 [POSITIVE] - High Priority:**
    Menghapus produk dari katalog aktif menggunakan ID produk valid.
*   **TC-20 [NEGATIVE] - High Priority:**
    Gagal menghapus produk jika ID produk tidak ditemukan (Not Found - 404).
*   **TC-21 [EDGE] - Medium Priority:**
    Gagal menghapus produk jika format ID bukan berformat UUID.

### Skenario 8: Penambahan Stok Barang (`POST /api/inventory/add-stock`)
*   **TC-22 [POSITIVE] - High Priority:**
    Menambahkan stok barang fisik masuk menggunakan ID produk yang valid dan kuantitas bernilai positif.
*   **TC-23 [NEGATIVE] - High Priority:**
    Gagal menambahkan stok jika ID produk tidak terdaftar di database (Not Found - 404).
*   **TC-24 [EDGE] - Medium Priority:**
    Gagal menambahkan stok jika kuantitas penambahan bernilai nol atau negatif.

### Skenario 9: Checkout Transaksi Multi-Item (`POST /api/transactions`)
*   **TC-25 [POSITIVE] - High Priority:**
    Checkout sukses untuk transaksi penjualan yang memuat beberapa produk sekaligus, secara otomatis mengurangi stok (IN/OUT) di database.
*   **TC-26 [NEGATIVE] - High Priority:**
    Gagal checkout transaksi jika salah satu item memiliki kuantitas melebihi stok yang tersedia (INSUFFICIENT_STOCK - 400).
*   **TC-27 [EDGE] - Medium Priority:**
    Gagal checkout transaksi jika array items kosong (Bad Request - 400).

### Skenario 10: Snapshot Penjualan pada Detail Transaksi & ON DELETE
*   **TC-28 [POSITIVE] - High Priority:**
    Menyimpan detail transaksi penjualan dengan nilai snapshot `namaProduk` dan `hargaSatuan` yang mengikat secara historis.
*   **TC-29 [NEGATIVE] - High Priority:**
    Gagal checkout jika terjadi tabrakan transaksi di mana produk dihapus tepat saat checkout sedang diproses.
*   **TC-30 [EDGE] - High Priority:**
    Setelah produk dihapus dari katalog, data transaksi masa lalu tetap utuh dengan `productId` bernilai `NULL` (relasi `ON DELETE SET NULL`), namun detail snapshot `namaProduk` dan `hargaSatuan` tetap terbaca.

### Skenario 11: Pengambilan Riwayat Transaksi (`GET /api/transactions/history`)
*   **TC-31 [POSITIVE] - Medium Priority:**
    Mengambil data seluruh riwayat log transaksi penjualan yang telah diselesaikan.
*   **TC-32 [NEGATIVE] - High Priority:**
    Gagal mengambil riwayat transaksi jika token JWT absen atau tidak valid (401).
*   **TC-33 [EDGE] - Low Priority:**
    Mengembalikan array kosong jika belum ada transaksi penjualan sama sekali.

### Skenario 12: Kalkulasi Peramalan Trend Moment (`GET /api/forecasting/predict/:product_id`)
*   **TC-34 [POSITIVE] - High Priority:**
    Menghitung peramalan stok periode depan pada produk yang memiliki data penjualan historis (mengembalikan konstanta a, b, dan nilai prediksi).
*   **TC-35 [NEGATIVE] - High Priority:**
    Gagal menghitung peramalan karena ID produk tidak ditemukan (Not Found - 404).
*   **TC-36 [EDGE] - Medium Priority:**
    Gagal menghitung peramalan jika ID produk bukan UUID (Bad Request - 400).

### Skenario 13: Evaluasi MAPE
*   **TC-37 [POSITIVE] - High Priority:**
    Mengembalikan nilai persentase MAPE dan kategori keandalan model peramalan bersama hasil prediksi.
*   **TC-38 [NEGATIVE] - High Priority:**
    Menghindari error pembagian dengan nol dengan mengabaikan periode penjualan aktual 0 dari kalkulasi MAPE.
*   **TC-39 [EDGE] - Medium Priority:**
    Menghitung MAPE ketika nilai prediksi tepat sama dengan nilai penjualan aktual (MAPE = 0%).

### Skenario 14: Batasan Minimum Periode Data
*   **TC-40 [POSITIVE] - High Priority:**
    Peramalan sukses ketika jumlah data point historis bernilai minimal (2 data point).
*   **TC-41 [NEGATIVE] - High Priority:**
    Mengembalikan error terstruktur `Insufficient sales history` (400) jika data historis kurang dari 2 periode.
*   **TC-42 [EDGE] - High Priority:**
    Meminta peramalan untuk produk baru yang sama sekali belum memiliki data penjualan (mengembalikan 400 Bad Request secara aman).

### Skenario 15: Filter Rentang Tanggal
*   **TC-43 [POSITIVE] - Medium Priority:**
    Menyaring data penjualan historis berdasarkan query string parameter `startDate` and `endDate` yang valid.
*   **TC-44 [NEGATIVE] - Medium Priority:**
    Gagal memproses request jika parameter `startDate` bernilai lebih besar dari tanggal `endDate`.
*   **TC-45 [EDGE] - Medium Priority:**
    Gagal memproses request jika format parameter `startDate` atau `endDate` tidak valid (bukan format tanggal standard).
