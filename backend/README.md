# CitySync Backend — Authentication & Department Management

## 1. Project Overview

CitySync is a city-level inter-departmental collaboration platform designed to help government departments coordinate their work, manage information, and improve planning and implementation.

This backend module focuses on secure user authentication, role-based access control, department management, and assigning users to departments.

## 2. My Contribution

**Module:** Authentication & Department Management

My responsibilities include:

- Implementing user registration and login.
- Securing passwords using bcrypt hashing.
- Generating JWT tokens for authenticated users.
- Implementing JWT authentication middleware.
- Implementing role-based authorization.
- Creating and managing city departments.
- Viewing registered users.
- Assigning users to departments.
- Protecting administrative APIs from unauthorized access.
- Connecting the application to MongoDB Atlas.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Backend JavaScript runtime |
| Express.js | REST API development |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| dotenv | Environment variable management |
| cors | Cross-origin request support |

## 4. Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── departmentController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Department.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── departmentRoutes.js
│   │   └── userRoutes.js
│   └── app.js
├── .env
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## 5. Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a MongoDB instance
- Postman or another API testing tool

### Step 1: Navigate to the backend folder

```bash
cd backend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=1d
```

Replace the placeholder values with your own configuration. Never commit real database credentials or JWT secrets to GitHub.

### Step 4: Start the backend server

For development:

```bash
npm run dev
```

Alternatively:

```bash
npm start
```

The server uses port `5000` by default, unless another port is configured.

### Step 5: Check server health

```http
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "message": "CitySync backend is running"
}
```

## 6. User Roles and Permissions

CitySync supports three user roles:

| Role | Permissions |
|---|---|
| `city_admin` | Manage departments, view users, and assign users to departments |
| `department_head` | Recognized role for department-level access control |
| `officer` | Register, log in, and access permitted authenticated endpoints |

New registrations receive the `officer` role by default. Administrative privileges should be assigned only through a trusted administrative process.

## 7. Authentication APIs

Base URL:

```text
http://localhost:5000/api/auth
```

### 7.1 Register a User

**Endpoint:** `POST /api/auth/register`

Request body:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "your_secure_password"
}
```

Features:
- Validates required fields.
- Checks for duplicate email addresses.
- Requires a password of at least eight characters.
- Hashes the password before saving it.
- Assigns the default `officer` role.

### 7.2 Login

**Endpoint:** `POST /api/auth/login`

Request body:

```json
{
  "email": "rahul@example.com",
  "password": "your_secure_password"
}
```

On successful login, the API returns a JWT token and safe user details.

Use the returned token when accessing protected endpoints.

### 7.3 Get Current Authenticated User

**Endpoint:** `GET /api/auth/me`

Header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Returns the authenticated user's details if the token is valid and the account still exists.

## 8. Department Management APIs

Base URL:

```text
http://localhost:5000/api/departments
```

All department endpoints require authentication.

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/api/departments` | Authenticated user | List active departments |
| POST | `/api/departments` | City Admin | Create a department |
| PUT | `/api/departments/:id` | City Admin | Update department details |
| PATCH | `/api/departments/:id/deactivate` | City Admin | Deactivate a department |

### 8.1 Create a Department

**Request:** `POST /api/departments`

Header:

```http
Authorization: Bearer YOUR_CITY_ADMIN_TOKEN
```

Example body:

```json
{
  "name": "Road Development",
  "code": "ROAD",
  "description": "Manages city road development",
  "contactEmail": "roads@example.com",
  "location": "City Office"
}
```

The department name and code must be unique.

### 8.2 Get Departments

**Request:** `GET /api/departments`

Returns the active departments sorted by name.

### 8.3 Update a Department

**Request:** `PUT /api/departments/DEPARTMENT_ID`

Example body:

```json
{
  "description": "Manages road construction and maintenance",
  "location": "Central City Office"
}
```

Only the supported department fields can be updated.

### 8.4 Deactivate a Department

**Request:** `PATCH /api/departments/DEPARTMENT_ID/deactivate`

The department is marked inactive instead of being permanently deleted.

## 9. User Management APIs

Base URL:

```text
http://localhost:5000/api/users
```

These endpoints require authentication and City Admin authorization.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users` | Retrieve registered users |
| PATCH | `/api/users/:userId/department` | Assign or update a user's department |

### 9.1 Get All Users

**Request:** `GET /api/users`

Returns the user list, including safe user information and populated department details.

Passwords are excluded from the response.

### 9.2 Assign a Department to a User

**Request:** `PATCH /api/users/USER_ID/department`

Header:

```http
Authorization: Bearer YOUR_CITY_ADMIN_TOKEN
```

Example request body:

```json
{
  "departmentId": "DEPARTMENT_ID"
}
```

Use the actual MongoDB department ID in place of `DEPARTMENT_ID`.

This operation associates the selected user with the specified department, subject to the controller's validation rules.

## 10. Authentication and Authorization Flow

1. A user registers with their name, email, and password.
2. The backend validates the input and hashes the password.
3. During login, the backend compares the supplied password with the stored hash.
4. On successful login, the backend generates a JWT token.
5. The client sends the token in the `Authorization` header.
6. Authentication middleware verifies the token and retrieves the current user.
7. Role middleware checks whether the user is allowed to perform the requested operation.
8. The controller processes the request and returns the appropriate response.

## 11. Security Features

- Password hashing with bcryptjs.
- JWT-based authentication.
- Role-based access control.
- Password exclusion from normal user queries.
- Protected department and user management endpoints.
- Validation of required fields and duplicate department names or codes.
- Environment variables for sensitive configuration.
- Soft deactivation of departments instead of permanent deletion.

## 12. API Testing

Use Postman or a similar REST API client.

Recommended testing sequence:

1. Register a new user.
2. Log in and save the returned JWT token.
3. Call `/api/auth/me` with the token.
4. Test department listing as an authenticated user.
5. Test department creation and updates with a City Admin token.
6. Verify that an ordinary officer receives `403 Forbidden` when attempting an admin-only operation.
7. Test user listing and department assignment with a City Admin token.
8. Verify invalid tokens and invalid input are handled correctly.

Typical status codes include:

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request or validation error |
| 401 | Authentication required or token invalid |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 500 | Unexpected server error |

Exact status codes and response messages may vary by endpoint.

## 13. Troubleshooting

**MongoDB connection error**
- Verify `MONGO_URI` in `.env`.
- Check MongoDB Atlas network access and database credentials.
- Ensure the connection string is correctly formatted.

**401 Unauthorized**
- Check that the token is valid and not expired.
- Send it as `Authorization: Bearer YOUR_JWT_TOKEN`.

**403 Forbidden**
- Confirm that the logged-in account has the required role.

**Port already in use**
- Stop the other process using the port or configure a different `PORT`.

**Missing environment variables**
- Confirm that `backend/.env` exists locally and contains the required values.

## 14. Future Improvements

- Email verification and password reset.
- More granular department-head permissions.
- Pagination and search for users and departments.
- Automated API tests.
- API documentation using Swagger/OpenAPI.
- Audit logs for administrative operations.

## 15. Summary

This module provides the core backend functionality for CitySync user authentication, role-based access control, department administration, and user-to-department assignment.

It is designed to support secure collaboration between city departments and provide a foundation for further CitySync platform development.
