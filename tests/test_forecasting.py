import requests
import os
import uuid

TARGET_URL = os.getenv("TARGET_URL", "http://localhost:3000")

def test_forecasting_workflow():
    # 1. Setup Admin Sesi untuk mendapatkan token
    unique_id = str(uuid.uuid4())[:8]
    email = f"admin_fc_{unique_id}@suryaelektrik.com"
    password = "securepassword123"
    nama = f"Admin FC {unique_id}"

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

    # ID Produk valid yang sudah memiliki data historis penjualan (seeded data)
    valid_product_id = "0eff732a-9317-493e-a0fd-935fbc3d1666"

    print("Mulai pengujian forecasting...")

    # 2. Kalkulasi Peramalan Sukses (TC-34)
    fc_res = requests.get(
        f"{TARGET_URL}/api/forecasting/predict/{valid_product_id}?period=monthly",
        headers=headers
    )
    assert fc_res.status_code == 200, f"Kalkulasi peramalan gagal: {fc_res.text}"
    fc_data = fc_res.json()
    assert fc_data.get("success") is True
    
    data = fc_data.get("data")
    assert "a" in data, "Konstanta a tidak ditemukan"
    assert "b" in data, "Koefisien b tidak ditemukan"
    assert "mape" in data, "Nilai MAPE tidak ditemukan"
    assert "forecastValue" in data, "Nilai forecastValue tidak ditemukan"
    
    print(f"-> Kalkulasi peramalan Trend Moment sukses diuji (TC-34)")
    print(f"   Hasil: a={data['a']}, b={data['b']}, MAPE={data['mape']}%, Prediksi={data['forecastValue']}")

    # 3. Kalkulasi Peramalan Gagal - Produk Tidak Ditemukan (TC-35)
    random_uuid = str(uuid.uuid4())
    fc_fail_404 = requests.get(
        f"{TARGET_URL}/api/forecasting/predict/{random_uuid}?period=monthly",
        headers=headers
    )
    assert fc_fail_404.status_code == 404, f"Harusnya 404: {fc_fail_404.text}"
    print("-> Peramalan untuk produk fiktif mengembalikan 404 Not Found diuji (TC-35)")

    # 4. Kalkulasi Peramalan Gagal - ID Produk Bukan UUID (TC-36/Edge)
    fc_fail_400 = requests.get(
        f"{TARGET_URL}/api/forecasting/predict/invalid-uuid?period=monthly",
        headers=headers
    )
    assert fc_fail_400.status_code == 400, f"Harusnya 400: {fc_fail_400.text}"
    print("-> Peramalan dengan ID bukan format UUID mengembalikan 400 Bad Request diuji (TC-36/Edge)")

if __name__ == "__main__":
    test_forecasting_workflow()
