# Authentication Setup Instructions

## Overview
The Ethiopian Airlines Feedback Demo now has full authentication with:
- Email/password signup and login
- JWT token-based authentication
- Role-based access control (passenger vs agent)
- Protected routes for each user type

## Backend Setup

### 1. Database Configuration
Set up a PostgreSQL database and configure the connection:

```bash
# Copy the example environment file
cd artifacts/api-server
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL=postgresql://user:password@localhost:5432/ethiopian_feedback
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
NODE_ENV=development
```

### 2. Push Database Schema
```bash
cd lib/db
pnpm run push
```

### 3. Seed Demo Users
```bash
cd lib/db
tsx src/seed.ts
```

This creates two demo users:
- **Passenger**: passenger@demo.com / password123
- **Agent**: agent@demo.com / password123

### 4. Start API Server
```bash
cd artifacts/api-server
pnpm run dev
```

The API will be available at `http://localhost:3000`

## Frontend Setup

### 1. Configure API URL
```bash
cd artifacts/ethiopian-feedback
cp .env.example .env
```

Edit `.env` if your API server runs on a different port:
```
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Start Frontend
```bash
cd artifacts/ethiopian-feedback
pnpm run dev
```

The frontend will be available at the URL shown in the terminal (typically `http://localhost:5173`)

## Testing the Authentication Flow

### 1. Signup Flow
1. Navigate to `/signup`
2. Fill in name, email, password (min 8 characters)
3. Choose role (Passenger or Agent)
4. Click "Create account"
5. You'll be redirected to the appropriate dashboard

### 2. Login Flow
1. Navigate to `/login` (or `/`)
2. Use demo credentials:
   - Passenger: passenger@demo.com / password123
   - Agent: agent@demo.com / password123
3. Or use the quick demo buttons to auto-fill credentials
4. Click "Sign in"
5. You'll be redirected to the appropriate dashboard

### 3. Protected Routes
- Passenger routes (`/passenger/*`) require passenger role
- Agent routes (`/agent/*`) require agent role
- Attempting to access routes without proper role redirects to appropriate dashboard
- Unauthenticated users are redirected to `/login`

### 4. Logout
- Click "Sign out" in the sidebar
- You'll be redirected to `/login`
- Token is cleared from localStorage

## API Endpoints

### POST /api/auth/signup
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "passenger"
}
```

### POST /api/auth/login
Authenticate and get token
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /api/auth/me
Get current user (requires Bearer token in Authorization header)

## Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **Password Hashing**: Uses bcryptjs with salt rounds of 10
3. **Token Expiration**: JWT tokens expire after 7 days
4. **HTTPS**: Use HTTPS in production for secure token transmission
5. **Database**: Ensure your database is secured with strong credentials

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct in `.env`
- Ensure PostgreSQL is running
- Check database exists and user has permissions

### CORS Errors
- Ensure API server allows CORS from frontend URL
- Check `VITE_API_BASE_URL` matches API server URL

### Authentication Fails
- Verify demo users were seeded successfully
- Check JWT_SECRET matches between API server and any validation
- Ensure tokens are being sent in Authorization header: `Bearer <token>`
