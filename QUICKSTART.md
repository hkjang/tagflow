# TagFlow - Quick Start Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Windows OS

## Installation

### 1. Install all dependencies

```powershell
cd d:\project\tagflow
npm install
```

### 2. Build shared types

```powershell
cd shared
npm run build
cd ..
```

### 3. Setup database

```powershell
cd backend
npm run build
npm run migrate
npm run seed
cd ..
```

## Running the Application

### Development Mode

**Run all services at once:**

```powershell
npm run dev
```

This starts:

- Backend (NestJS) on http://localhost:3001
- Frontend (Next.js) on http://localhost:3000
- NW.js window (after 5 seconds)

**OR run services separately:**

Terminal 1 - Backend:

```powershell
cd backend
npm run start:dev
```

Terminal 2 - Frontend:

```powershell
cd frontend
npm run dev
```

Terminal 3 - NW.js (optional):

```powershell
cd nwjs
npm run build
npm run dev
```

## Default Login

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator

## First Steps

1. Login with admin credentials
2. Navigate to "Tag Events" page
3. Test RFID input by typing a card UID and pressing Enter
4. Navigate to "Admin > Webhooks" to configure webhooks
5. Use "Test" button to verify webhook connectivity

## Project Structure

```
tagflow/
├── backend/      # NestJS API (port 3001)
├── frontend/     # Next.js UI (port 3000)
├── nwjs/         # Desktop app wrapper
├── shared/       # TypeScript types
└── data/         # SQLite database (created on first run)
```

## Common Issues

### Port already in use

Kill processes on ports 3000 or 3001:

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database locked

Ensure only one backend instance is running.

### Dependencies not found

Run `npm install` in root, then in each workspace.

## API Endpoints

Base URL: http://localhost:3001

### Authentication

- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Events (Both Roles)

- `GET /events` - List events
- `POST /events` - Create event

### Webhooks (Admin Only)

- `GET /webhooks` - List webhooks
- `POST /webhooks` - Create webhook
- `PUT /webhooks/:id` - Update webhook
- `DELETE /webhooks/:id` - Delete webhook
- `POST /webhooks/:id/test` - Test webhook

### Reports (Both Roles)

- `GET /reports/events` - Event statistics
- `GET /reports/webhooks` - Webhook performance

## Building for Production

```powershell
npm run build
cd nwjs
npm run build
```

Installer will be in `nwjs/dist/`

## Support

For issues, check:

1. Backend console for errors
2. Frontend browser console (F12)
3. Database file in `data/tagflow.db`

## Security Notes

- Change default admin password immediately
- Set `JWT_SECRET` environment variable for production
- Review webhook target URLs before activation
