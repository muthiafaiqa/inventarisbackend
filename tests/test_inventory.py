import requests
import os
import uuid

TARGET_URL = os.getenv("TARGET_URL", "http://localhost:3000")

def test_inventory_workflow():
    # 1. Setup Admin Sesi untuk mendapatkan token
    unique_id = str(uuid.uuid4())[:8]
    email = f"admin_inv_{unique_id}@suryaelektrik.com"
    password = "securepassword123"
    nama = f"Admin Inv {unique_id}"

    # Registrasi admin
    requests.post(f"{TARGET_URL}/api/auth/register", json={
        "email": email,
        "password": password,
        "nama": nama
    })

    # Login admin
    login_res = requests.post(f"{TARGET_URL}/api/auth/login", json={
        "email": email,
        "password": password
    })
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    print(f"Token didapatkan. Mulai pengujian inventory dengan unique ID: {unique_id}")

    # 2. Pembuatan Produk Baru Sukses (TC-10)
    sku = f"SKU-{unique_id}"
    product_res = requests.post(
        f"{TARGET_URL}/api/products",
        headers=headers,
        json={
            "sku": sku,
            "nama": f"Kabel Tembaga {unique_id}",
            "harga": 50000,
            "unit": "meter",
            "minStock": 20
        }
    )
    assert product_res.status_code == 201, f"Gagal membuat produk: {product_res.text}"
    product_data = product_res.json()
    assert product_data.get("success") is True
    product_id = product_data.get("data").get("id")
    assert product_id is not None
    print(f"-> Pembuatan produk baru sukses diuji (TC-10). ID: {product_id}")

    # 3. Pembuatan Produk Gagal - SKU Duplikat (TC-11)
    dup_res = requests.post(
        f"{TARGET_URL}/api/products",
        headers=headers,
        json={
            "sku": sku, # SKU yang sama
            "nama": "Kabel Lain",
            "harga": 60000,
            "unit": "meter",
            "minStock": 10
        }
    )
    assert dup_res.status_code == 409, f"Harusnya conflict 409: {dup_res.text}"
    print("-> Pembuatan produk dengan SKU duplikat mengembalikan 409 Conflict diuji (TC-11)")

    # 4. Penambahan Stok Barang Sukses (TC-22)
    add_stock_res = requests.post(
        f"{TARGET_URL}/api/inventory/add-stock",
        headers=headers,
        json={
            "productId": product_id,
            "quantity": 100
        }
    )
    assert add_stock_res.status_code == 200, f"Gagal menambah stok: {add_stock_res.text}"
    print("-> Penambahan stok barang sukses diuji (TC-22)")

    # 5. Penambahan Stok Barang Gagal - ID Produk Tidak Ditemukan (TC-23)
    random_uuid = str(uuid.uuid4())
    add_stock_fail_res = requests.post(
        f"{TARGET_URL}/api/inventory/add-stock",
        headers=headers,
        json={
            "productId": random_uuid,
            "quantity": 50
        }
    )
    assert add_stock_fail_res.status_code == 404, f"Harusnya 404: {add_stock_fail_res.text}"
    print("-> Penambahan stok pada produk ID fiktif mengembalikan 404 Not Found diuji (TC-23)")

if __name__ == "__main__":
    test_inventory_workflow()
