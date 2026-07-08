import requests
import os
import uuid

TARGET_URL = os.getenv("TARGET_URL", "http://localhost:3000")

def test_sales_workflow():
    # 1. Setup Admin Sesi untuk mendapatkan token
    unique_id = str(uuid.uuid4())[:8]
    email = f"admin_sales_{unique_id}@suryaelektrik.com"
    password = "securepassword123"
    nama = f"Admin Sales {unique_id}"

    requests.post(f"{TARGET_URL}/api/auth/register", json={
        "email": email,
        "password": password,
        "nama": nama
    })

    login_res = requests.post(f"{TARGET_URL}/api/auth/login", json={
        "email": email,
        "password": password
    })
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Buat produk pertama
    prod1_res = requests.post(
        f"{TARGET_URL}/api/products",
        headers=headers,
        json={
            "sku": f"SKU-A-{unique_id}",
            "nama": f"Lampu LED 10W {unique_id}",
            "harga": 25000,
            "unit": "pcs",
            "minStock": 5
        }
    )
    prod1_id = prod1_res.json()["data"]["id"]

    # Tambah stok produk pertama agar cukup untuk dibeli
    requests.post(
        f"{TARGET_URL}/api/inventory/add-stock",
        headers=headers,
        json={
            "productId": prod1_id,
            "quantity": 10
        }
    )

    print(f"Produk test berhasil dibuat. ID: {prod1_id}, stok awal: 10")

    # 2. Checkout Transaksi Multi-Item Sukses (TC-25)
    checkout_res = requests.post(
        f"{TARGET_URL}/api/transactions",
        headers=headers,
        json={
            "items": [
                {
                    "productId": prod1_id,
                    "quantity": 3
                }
            ]
        }
    )
    assert checkout_res.status_code == 201, f"Checkout gagal: {checkout_res.text}"
    checkout_data = checkout_res.json()
    assert checkout_data.get("success") is True
    print("-> Checkout transaksi multi-item sukses diuji (TC-25)")

    # Verifikasi sisa stok (seharusnya 10 - 3 = 7)
    product_stock_res = requests.get(f"{TARGET_URL}/api/products")
    products = product_stock_res.json()["data"]
    target_product = next(p for p in products if p["productId"] == prod1_id)
    assert target_product["currentStock"] == 7, f"Sisa stok salah, terbaca: {target_product['currentStock']}"
    print("-> Integrasi mutasi stok otomatis OUT setelah checkout berhasil diverifikasi")

    # 3. Checkout Gagal - Insufficient Stock (TC-26/Edge)
    # Mencoba membeli 15 item sedangkan stok tinggal 7
    fail_checkout_res = requests.post(
        f"{TARGET_URL}/api/transactions",
        headers=headers,
        json={
            "items": [
                {
                    "productId": prod1_id,
                    "quantity": 15
                }
            ]
        }
    )
    assert fail_checkout_res.status_code == 400, f"Harusnya bad request 400: {fail_checkout_res.text}"
    assert fail_checkout_res.json().get("code") == "INSUFFICIENT_STOCK"
    print("-> Checkout gagal karena stok tidak mencukupi berhasil diuji (TC-26/Edge)")

if __name__ == "__main__":
    test_sales_workflow()
