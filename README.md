# Blog System Backend

A Node.js/Express backend for a blog system with user and admin roles.

## Features

- User authentication (register/login)
- Role-based authorization (admin/user)
- JWT authentication
- MongoDB database integration

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/blog-system
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

3. Make sure MongoDB is running on your system

4. Start the server:
```
# Development mode
npm run dev

# Production mode
npm start
```

## Seeding the Database

To populate the database with sample users (admin and regular user):

```
npm run seed
```

This will create the following accounts:
- Admin: admin@example.com / password123
- User: user@example.com / password123

## Testing the API

To test the authentication API endpoints:

```
npm run test
```

Or to both seed the database and run tests in one command:

```
npm run setup-test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info (requires authentication)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data (admin only)
- `GET /api/admin/users` - Get all users (admin only)

## Role-Based Redirection

- When a user logs in, the API returns a `redirect` field:
  - Admin users: redirected to `/admin`
  - Regular users: redirected to `/` (home page)

## Example Usage

### Register a user
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
``` 