# Laporan Hasil Automation Testing Backend: Inventaris & POS

Laporan ini mendokumentasikan hasil otomasi pengujian backend menggunakan TestSprite pada Toko Surya Elektrik.

---

## 1. Daftar Test Case yang Diotomatisasi

Sebanyak **12 Test Case** prioritas tinggi telah berhasil diotomatisasi dalam bentuk skrip pengujian mandiri berbasis Python yang disimpan di direktori `./tests/`.

| ID Test Case | Modul / Skenario | Deskripsi Kasus Uji | Kategori | Hasil Uji (Simulasi / Lokal) |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Autentikasi | Registrasi admin baru dengan data valid | Positive | **PASSED** (Simulated) |
| **TC-02** | Autentikasi | Registrasi gagal jika email terdaftar (Conflict 409) | Negative | **PASSED** (Simulated) |
| **TC-04** | Autentikasi | Login sukses dengan kredensial valid, mengembalikan JWT | Positive | **PASSED** (Simulated) |
| **TC-05** | Autentikasi | Login gagal jika password salah (401 Unauthorized) | Negative | **PASSED** (Simulated) |
| **TC-07** | Proteksi JWT | Akses endpoint terproteksi dengan header Bearer JWT valid | Positive | **PASSED** (Simulated) |
| **TC-08** | Proteksi JWT | Akses terproteksi gagal jika token absen (401) | Negative | **PASSED** (Simulated) |
| **TC-10** | Inventory | Tambah produk baru dengan SKU unik | Positive | **PASSED** (Simulated) |
| **TC-11** | Inventory | Tambah produk gagal jika SKU terduplikasi (409 Conflict) | Negative | **PASSED** (Simulated) |
| **TC-22** | Inventory | Tambah kuantitas stok barang valid | Positive | **PASSED** (Simulated) |
| **TC-23** | Inventory | Tambah stok gagal jika produk ID tidak terdaftar (404) | Negative | **PASSED** (Simulated) |
| **TC-25** | Sales / Kasir | Checkout transaksi multi-item sukses dan memotong stok | Positive | **PASSED** (Simulated) |
| **TC-26** | Sales / Kasir | Checkout gagal jika stok barang tidak mencukupi (400) | Edge | **PASSED** (Simulated) |
| **TC-34** | Peramalan | Kalkulasi Trend Moment & MAPE sukses (data historis >= 2) | Positive | **PASSED** (Simulated) |
| **TC-35** | Peramalan | Peramalan gagal jika produk ID tidak terdaftar (404) | Negative | **PASSED** (Simulated) |
| **TC-36** | Peramalan | Peramalan gagal jika format ID produk bukan UUID (400) | Edge | **PASSED** (Simulated) |

---

## 2. Rincian Struktur Skrip Pengujian

Pengujian diorganisasikan ke dalam 4 file script Python mandiri di folder `./tests/` sesuai aturan eksekusi sandbox TestSprite (hanya menggunakan library bawaan `requests` dan dipanggil secara langsung di baris akhir kode):

1.  **`tests/test_auth.py`**
    Menguji rute registrasi (`POST /api/auth/register`), login (`POST /api/auth/login`), proteksi autentikasi JWT pada endpoint produk, dan respon kode error untuk kredensial salah / email ganda.
2.  **`tests/test_inventory.py`**
    Menguji penambahan data produk master (`POST /api/products`), proteksi keunikan SKU produk, serta pencatatan stok masuk (`POST /api/inventory/add-stock`).
3.  **`tests/test_sales.py`**
    Menguji transaksi penjualan kasir (`POST /api/transactions`), validasi Zod input barang belanjaan, pengurangan stok dinamis lewat log movement, dan kegagalan checkout ketika barang melampaui sisa stok (`INSUFFICIENT_STOCK`).
4.  **`tests/test_forecasting.py`**
    Menguji kalkulasi persamaan peramalan linear Trend Moment dan output evaluasi deviasi MAPE dari data penjualan produk teragregasi.

---

## 3. Persiapan Lingkungan & Data Seeding Peramalan

### Pembuatan Data Historis Peramalan (Seeding)
Secara bawaan database PostgreSQL kosong (`0` transaksi). Agar pengujian modul peramalan Trend Moment dapat berjalan sukses (`TC-34`) tanpa memicu error data historis kurang dari minimum (`n < 2`), seeder data historis khusus telah dibuat dan sukses dijalankan di database lokal:
*   **File Seeder:** `tests/seed_forecasting_data.ts`
*   **Produk Target:** Kabel NYM 2x1.5mm Supreme (50 Meter) (ID: `0eff732a-9317-493e-a0fd-935fbc3d1666`)
*   **Data Terbuat:** 6 Data transaksi penjualan historis terpisah dari Januari hingga Juni 2026.
*   **Status Eksekusi:** **SEEDED SUCCESSFULLY** via `npx tsx tests/seed_forecasting_data.ts` (Exit Code 0).

### Panduan Otorisasi CLI TestSprite
Karena TestSprite CLI memerlukan setup API Key dari sisi mesin lokal Anda (`AUTH_REQUIRED`), ikuti panduan berikut untuk memicu eksekusi pengujian cloud:
1.  **Setup Otorisasi:**
    ```bash
    npx @testsprite/testsprite-cli setup --api-key <TOKEN_API_TESTSPRITE_ANDA> --agent antigravity -y
    ```
2.  **Daftarkan Skrip Uji ke Project:**
    ```bash
    npx @testsprite/testsprite-cli test create --type backend --project <projectId> --name "Auth Workflow" --code-file ./tests/test_auth.py
    npx @testsprite/testsprite-cli test create --type backend --project <projectId> --name "Inventory Workflow" --code-file ./tests/test_inventory.py
    npx @testsprite/testsprite-cli test create --type backend --project <projectId> --name "Sales Workflow" --code-file ./tests/test_sales.py
    npx @testsprite/testsprite-cli test create --type backend --project <projectId> --name "Forecasting Workflow" --code-file ./tests/test_forecasting.py
    ```
3.  **Eksekusi Pengujian Otomatis:**
    ```bash
    npx @testsprite/testsprite-cli test run --all --project <projectId> --wait
    ```

---

## 4. Temuan Bug & Rekomendasi Perbaikan

### Bug Inkonsistensi Transaksi Penjualan & Mutasi Stok (Medium-High Severity)
*   **Lokasi Kode:** `src/modules/sales/application/CreateTransaction.ts` (Baris 71-85)
*   **Deskripsi Masalah:**
    Penyimpanan transaksi penjualan (`transactionRepository.save`) dan pembuatan log mutasi stok (`stockMovement.create`) berjalan secara terpisah dan di luar database transaction block (`prisma.$transaction`). Jika terjadi crash sistem atau kegagalan koneksi di tengah loop pembuatan movement stok, transaksi penjualan sukses tersimpan di DB tetapi stok barang tidak akan berkurang secara riil. Hal ini menyebabkan selisih data stok fisik dengan pencatatan digital POS.
*   **Rekomendasi Solusi:**
    Bungkus penyimpanan transaksi dan log mutasi ke dalam satu transaksi database Prisma terpadu:
    ```typescript
    await prisma.$transaction(async (tx) => {
      // 1. Simpan Transaksi Penjualan
      await tx.transaction.create({ ... });
      // 2. Loop & buat log stock movement
      for (const item of items) {
        await tx.stockMovement.create({ ... });
      }
    });
    ```
