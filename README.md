# Belajar Vibe Coding

Backend project built with Bun, Elysia.js, MySQL, and Drizzle ORM.

## API Endpoints

### 1. Register User
`POST /api/users`

### 2. Login User
`POST /api/users/login`

### 3. Get Current User
`GET /api/users/current`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "data": {
      "id": 1,
      "name": "Ricky",
      "email": "ricky@localhost",
      "created_at": "timestamp"
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "data": "Unauthorized"
  }
  ```

