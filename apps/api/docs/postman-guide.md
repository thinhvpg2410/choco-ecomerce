# Choco Ecommerce API - Postman Guide

## Base Configuration

- Base URL: `http://localhost:3000/api`
- Content type: `application/json`
- Auth type for protected routes: `Bearer Token`
- Swagger UI: `http://localhost:3000/docs`

## Environment Variables (Postman)

Create a Postman environment with:

- `base_url` = `http://localhost:3000/api`
- `access_token` = _(set after login/register)_
- `refresh_token` = _(set after login/register)_
- `category_id` = _(set after create category)_
- `product_id` = _(set after create product)_

## Common Headers

### Public endpoints

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |

### Protected endpoints

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer {{access_token}}` |

## 1) Authentication

### Register

- Method: `POST`
- URL: `{{base_url}}/auth/register`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "email": "admin@choco.com",
  "password": "StrongPass123",
  "role": "admin"
}
```

- Success response:

```json
{
  "success": true,
  "message": "Register successfully",
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<jwt_refresh_token>",
    "user": {
      "id": "67f0f7c3c0e6f1d2b65f4f2a",
      "email": "admin@choco.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-03-27T08:00:00.000Z"
    }
  }
}
```

### Login

- Method: `POST`
- URL: `{{base_url}}/auth/login`
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "email": "admin@choco.com",
  "password": "StrongPass123"
}
```

### Refresh Token

- Method: `POST`
- URL: `{{base_url}}/auth/refresh`
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

### Current User

- Method: `GET`
- URL: `{{base_url}}/auth/me`
- Headers:
  - `Authorization: Bearer {{access_token}}`

## 2) Categories

### Get Categories

- Method: `GET`
- URL: `{{base_url}}/categories`
- Headers:
  - `Content-Type: application/json`

### Create Category (Admin)

- Method: `POST`
- URL: `{{base_url}}/categories`
- Headers:
  - `Authorization: Bearer {{access_token}}`
- Body:

```json
{
  "name": "Dark Chocolate",
  "description": "All dark chocolate products"
}
```

### Update Category (Admin)

- Method: `PUT`
- URL: `{{base_url}}/categories/{{category_id}}`
- Headers:
  - `Authorization: Bearer {{access_token}}`
- Body:

```json
{
  "name": "Premium Dark Chocolate",
  "description": "Updated description"
}
```

### Delete Category (Admin)

- Method: `DELETE`
- URL: `{{base_url}}/categories/{{category_id}}`
- Headers:
  - `Authorization: Bearer {{access_token}}`

## 3) Products

### Get Products (pagination/search/filter)

- Method: `GET`
- URL: `{{base_url}}/products?page=1&limit=10&search=dark&category_id={{category_id}}`
- Headers:
  - `Content-Type: application/json`

### Get Product Detail

- Method: `GET`
- URL: `{{base_url}}/products/{{product_id}}`
- Headers:
  - `Content-Type: application/json`

### Create Product (Admin)

- Method: `POST`
- URL: `{{base_url}}/products`
- Headers:
  - `Authorization: Bearer {{access_token}}`
- Body:

```json
{
  "name": "Dark Chocolate 80%",
  "description": "Premium chocolate bar",
  "price": 120000,
  "stock": 50,
  "images": [
    "https://cdn.example.com/products/dark-80-1.jpg",
    "https://cdn.example.com/products/dark-80-2.jpg"
  ],
  "category_id": "{{category_id}}"
}
```

### Update Product (Admin)

- Method: `PUT`
- URL: `{{base_url}}/products/{{product_id}}`
- Headers:
  - `Authorization: Bearer {{access_token}}`
- Body:

```json
{
  "price": 99000,
  "stock": 100
}
```

### Delete Product (Admin, soft delete)

- Method: `DELETE`
- URL: `{{base_url}}/products/{{product_id}}`
- Headers:
  - `Authorization: Bearer {{access_token}}`

## Error Response Format

All errors return:

```json
{
  "success": false,
  "message": "Readable error message",
  "data": {
    "path": "/api/products",
    "timestamp": "2026-03-27T08:00:00.000Z"
  }
}
```
