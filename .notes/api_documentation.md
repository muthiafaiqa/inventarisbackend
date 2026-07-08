# Surya Elektrik POS & Inventory System: API Documentation

Welcome to the API Documentation for the Surya Elektrik POS & Inventory backend application.

*   **Production API URL:** `https://inventarisbackend-production.up.railway.app`
*   **Default Port (Local):** `3000`
*   **Format:** All request and response payloads must be in JSON format.

---

## Authentication & Security

Endpoints marked with **[Protected]** require a valid JSON Web Token (JWT) sent via HTTP Authorization Header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Register Admin Account
Create a new administrative user to access the POS system.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/auth/register`
*   **Authentication:** `Public (No Token Required)`
*   **Request Body:**
    ```json
    {
      "email": "admin@suryaelektrik.com",
      "password": "securepassword123",
      "nama": "Admin Surya Elektrik"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "e44d32f7-e547-494b-9721-654ef24cd512",
        "email": "admin@suryaelektrik.com",
        "nama": "Admin Surya Elektrik",
        "createdAt": "2026-07-08T10:00:00.000Z",
        "updatedAt": "2026-07-08T10:00:00.000Z"
      }
    }
    ```

### Login Account
Authenticate credentials and obtain a bearer JWT session token.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/auth/login`
*   **Authentication:** `Public (No Token Required)`
*   **Request Body:**
    ```json
    {
      "email": "admin@suryaelektrik.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "id": "e44d32f7-e547-494b-9721-654ef24cd512",
          "email": "admin@suryaelektrik.com",
          "nama": "Admin Surya Elektrik"
        }
      }
    }
    ```

---

## 2. Product Management Endpoints

### Create New Product
Add a new product profile to the master catalog.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/products`
*   **Authentication:** **[Protected]**
*   **Request Body:**
    ```json
    {
      "sku": "KBL-NYM-215-SP",
      "nama": "Kabel NYM 2x1.5mm Supreme (50 Meter)",
      "harga": 300000,
      "unit": "roll",
      "minStock": 5
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "0eff732a-9317-493e-a0fd-935fbc3d1666",
        "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
        "product_id": "0eff732a-9317-493e-a0fd-935fbc3d1666",
        "sku": "KBL-NYM-215-SP",
        "nama": "Kabel NYM 2x1.5mm Supreme (50 Meter)",
        "harga": 300000,
        "unit": "roll",
        "minStock": 5,
        "createdAt": "2026-07-08T10:10:00.000Z",
        "updatedAt": "2026-07-08T10:10:00.000Z"
      }
    }
    ```

### Get All Products
Retrieve all products along with their real-time calculated stock quantities.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/products`
*   **Authentication:** `Public (No Token Required)`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "0eff732a-9317-493e-a0fd-935fbc3d1666",
          "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
          "product_id": "0eff732a-9317-493e-a0fd-935fbc3d1666",
          "sku": "KBL-NYM-215-SP",
          "name": "Kabel NYM 2x1.5mm Supreme (50 Meter)",
          "price": 300000,
          "currentStock": 75,
          "minStock": 5,
          "unit": "roll"
        }
      ]
    }
    ```

### Update Product
Modify attributes of an existing product.
*   **HTTP Method:** `PUT`
*   **Endpoint:** `/api/products/:id` (e.g. `/api/products/0eff732a-9317-493e-a0fd-935fbc3d1666`)
*   **Authentication:** **[Protected]**
*   **Request Body:**
    ```json
    {
      "nama": "Kabel NYM 2x1.5mm Supreme (50 Meter) Premium",
      "harga": 320000,
      "unit": "roll",
      "minStock": 10
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "0eff732a-9317-493e-a0fd-935fbc3d1666",
        "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
        "product_id": "0eff732a-9317-493e-a0fd-935fbc3d1666",
        "sku": "KBL-NYM-215-SP",
        "nama": "Kabel NYM 2x1.5mm Supreme (50 Meter) Premium",
        "harga": 320000,
        "unit": "roll",
        "minStock": 10,
        "createdAt": "2026-07-08T10:10:00.000Z",
        "updatedAt": "2026-07-08T10:15:00.000Z"
      }
    }
    ```

### Delete Product
Remove a product from the active catalog. Historic transactions will preserve the product details but change the link reference to `NULL`.
*   **HTTP Method:** `DELETE`
*   **Endpoint:** `/api/products/:id` (e.g. `/api/products/0eff732a-9317-493e-a0fd-935fbc3d1666`)
*   **Authentication:** **[Protected]**
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product deleted successfully"
    }
    ```

---

## 3. Inventory & Stock Management

### Add Stock (Inbound Movement)
Increase physical product stock. It writes a transaction to the stock movements log ledger.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/inventory/add-stock`
*   **Authentication:** **[Protected]**
*   **Request Body:**
    ```json
    {
      "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
      "quantity": 50
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Stock added successfully"
    }
    ```

---

## 4. Point of Sales (POS) Transactions

### Checkout Transaction
Record a client purchase checkout. This decreases stock levels and registers historical item price snapshots.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/transactions`
*   **Authentication:** **[Protected]**
*   **Request Body:**
    ```json
    {
      "items": [
        {
          "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
          "quantity": 2
        }
      ]
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "fc52aa8e-493a-4db3-ae41-a3bf681ef232",
        "totalAmount": 600000,
        "tanggal": "2026-07-08T10:20:00.000Z",
        "items": [
          {
            "id": "eefc73d9-a417-42cf-9a4f-8cfbc34da251",
            "transactionId": "fc52aa8e-493a-4db3-ae41-a3bf681ef232",
            "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
            "namaProduk": "Kabel NYM 2x1.5mm Supreme (50 Meter)",
            "hargaSatuan": 300000,
            "quantity": 2
          }
        ]
      }
    }
    ```

### Get Transaction History
Retrieve previous POS checkout transactions.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/transactions/history`
*   **Authentication:** **[Protected]**
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "fc52aa8e-493a-4db3-ae41-a3bf681ef232",
          "totalAmount": 600000,
          "tanggal": "2026-07-08T10:20:00.000Z",
          "items": [
            {
              "id": "eefc73d9-a417-42cf-9a4f-8cfbc34da251",
              "transactionId": "fc52aa8e-493a-4db3-ae41-a3bf681ef232",
              "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
              "namaProduk": "Kabel NYM 2x1.5mm Supreme (50 Meter)",
              "hargaSatuan": 300000,
              "quantity": 2
            }
          ]
        }
      ]
    }
    ```

---

## 5. Forecasting Module

### Predict Product Sales Demand (Trend Moment & MAPE)
Retrieve future sales forecasting demand for the next period, computed using simple linear regression (Trend Moment) and evaluated with Mean Absolute Percentage Error (MAPE).
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/forecasting/predict/:product_id` (e.g. `/api/forecasting/predict/0eff732a-9317-493e-a0fd-935fbc3d1666`)
*   **Authentication:** **[Protected]**
*   **Query Parameters:**
    *   `period` (string, optional): Aggregate period intervals. Options: `daily`, `weekly`, `monthly` (default).
    *   `startDate` (string, optional): Beginning of historical bounds filter (e.g., `2026-01-01`).
    *   `endDate` (string, optional): End of historical bounds filter (e.g., `2026-06-30`).
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "productId": "0eff732a-9317-493e-a0fd-935fbc3d1666",
        "a": 8.133333333333333,
        "b": 1.542857142857143,
        "mape": 4.582910392,
        "forecastValue": 17.39047619047619
      }
    }
    ```
