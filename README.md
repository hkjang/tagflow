# TagFlow - RFID Tag Management System

NW.js-based desktop application for RFID tag event management with role-based access control.

## Features

- **Role-Based Access Control**: Admin and Operator roles with different permissions
- **RFID Event Tracking**: Real-time tag event capture and storage
- **Webhook System**: Configurable webhooks with field mapping and retry mechanism
- **Automatic Data Cleanup**: Scheduled cleanup based on data retention policies
- **Comprehensive Reporting**: Event statistics and webhook performance monitoring

## Tech Stack

- **NW.js**: Desktop application framework
- **NestJS**: Backend REST API
- **Next.js**: Frontend UI
- **SQLite**: Local database

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed initial admin user
npm run seed
```

### Development

```bash
# Start all services (backend, frontend, nwjs)
npm run dev
```

The application will automatically:

- Start NestJS backend on `http://localhost:3001`
- Start Next.js frontend on `http://localhost:3000`
- Open NW.js window

### Default Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

**⚠️ Change the default password after first login!**

## User Roles

### Admin

- Full system access
- Webhook management
- User management
- View cleanup logs
- Automatic data cleanup on login

### Operator

- View tag events
- View webhook logs (read-only)
- View reports
- No configuration access

## Project Structure

```
tagflow/
├── nwjs/              # NW.js main process
├── backend/           # NestJS backend API
├── frontend/          # Next.js frontend
├── shared/            # Shared TypeScript types
└── data/              # SQLite database (created on first run)
```

## Database Schema

- `users` - User accounts with roles
- `tag_events` - RFID tag scan events
- `webhooks` - Webhook configurations
- `webhook_mappings` - Field mapping rules
- `webhook_logs` - Webhook execution history
- `cleanup_logs` - Data cleanup history
- `cleanup_fail_logs` - Cleanup error logs

## Data Retention Policies

- **Tag Events**: 1 year (auto-cleanup on admin login)
- **Webhook Logs**: 90 days
- **Cleanup Logs**: 2 years

## Build

```bash
# Build for production
npm run build

# Package NW.js app (requires NW.js SDK)
npm run build:exe
```

자세한 패키징 정보는 [nwjs/PACKAGING.md](nwjs/PACKAGING.md)를 참조하세요.

## License

Proprietary
