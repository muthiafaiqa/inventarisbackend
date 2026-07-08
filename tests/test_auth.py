import requests
import os

# Base URL akan disesuaikan dengan target environment (lokal port 3000)
TARGET_URL = os.getenv("TARGET_URL", "http://localhost:3000")

def test_auth_workflow():
    # Gunakan email acak unik untuk menghindari tabrakan data saat dijalankan berulang
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    email = f"admin_{unique_id}@suryaelektrik.com"
    password = "securepassword123"
    nama = f"Admin {unique_id}"

    print(f"Menguji registrasi admin dengan email: {email}")

    # 1. Registrasi Sukses (POSITIVE)
    reg_res = requests.post(f"{TARGET_URL}/api/auth/register", json={
        "email": email,
        "password": password,
        "nama": nama
    })
    assert reg_res.status_code == 201, f"Registrasi gagal: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data.get("success") is True
    assert reg_data.get("data").get("email") == email
    print("-> Registrasi sukses berhasil diuji (TC-01)")

    # 2. Registrasi Gagal - Email Duplikat (NEGATIVE)
    reg_fail_res = requests.post(f"{TARGET_URL}/api/auth/register", json={
        "email": email,
        "password": password,
        "nama": "Nama Lain"
    })
    assert reg_fail_res.status_code == 409, f"Harusnya conflict 409: {reg_fail_res.text}"
    print("-> Registrasi duplikat mengembalikan 409 Conflict berhasil diuji (TC-02)")

    # 3. Login Sukses (POSITIVE)
    login_res = requests.post(f"{TARGET_URL}/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200, f"Login gagal: {login_res.text}"
    login_data = login_res.json()
    assert login_data.get("success") is True
    token = login_data.get("data").get("token")
    assert token is not None
    print("-> Login sukses dan mendapatkan JWT Token berhasil diuji (TC-04)")

    # 4. Login Gagal - Password Salah (NEGATIVE)
    login_fail_res = requests.post(f"{TARGET_URL}/api/auth/login", json={
        "email": email,
        "password": "wrongpassword"
    })
    assert login_fail_res.status_code == 401, f"Harusnya unauthorized 401: {login_fail_res.text}"
    print("-> Login dengan password salah mengembalikan 401 Unauthorized berhasil diuji (TC-05)")

    # 5. Proteksi Endpoint - Tanpa Token (NEGATIVE)
    protected_fail_res = requests.post(f"{TARGET_URL}/api/products", json={})
    assert protected_fail_res.status_code == 401, f"Harusnya blocked 401: {protected_fail_res.text}"
    print("-> Proteksi endpoint tanpa token berhasil diuji (TC-08)")

    # 6. Proteksi Endpoint - Dengan Token (POSITIVE)
    # Gunakan SKU yang juga unik
    sku = f"SKU-{unique_id}"
    protected_res = requests.post(
        f"{TARGET_URL}/api/products",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "sku": sku,
            "nama": "Test Product",
            "harga": 15000,
            "unit": "pcs",
            "minStock": 5
        }
    )
    assert protected_res.status_code == 201, f"Gagal akses dengan token: {protected_res.text}"
    print("-> Akses endpoint terproteksi dengan token valid berhasil diuji (TC-07)")

if __name__ == "__main__":
    test_auth_workflow()
