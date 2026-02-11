# Installation Guide

Complete guide for setting up the Furniture Management System locally.

## Prerequisites

- **Node.js**: 18.20.2+ or 20.9.0+
- **pnpm**: 9+ or 10+
- **MongoDB**: Local or cloud instance (MongoDB Atlas)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd furniture-mangment-system
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/furnitureManagment

# Payload Secret (generate a strong secret)
PAYLOAD_SECRET=your-super-secret-key-here-min-32-chars

# Server URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# God Admin Credentials
GOD_ADMIN_EMAIL=admin@example.com
GOD_ADMIN_PASSWORD=secure-password-here
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at:
- **Dashboard**: http://localhost:3000/dashboard
- **Admin Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/furnitureManagment`

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get connection string
5. Update `DATABASE_URL` in `.env`

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/furnitureManagment?retryWrites=true&w=majority
```

### Option 3: Docker

```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name fms-mongo mongo:latest

# Update .env
DATABASE_URL=mongodb://localhost:27017/furnitureManagment
```

## Docker Compose Setup

For a complete containerized setup:

```bash
# Update MongoDB URL for Docker network
# .env
DATABASE_URL=mongodb://mongo:27017/furnitureManagment

# Start services
docker-compose up -d
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - mongo
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
```

## First Login

1. Navigate to http://localhost:3000/admin
2. Log in with God Admin credentials from `.env`
3. Create your first tenant (furniture shop)
4. Create owner users for the tenant

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000
```

### MongoDB Connection Error

```bash
# Check MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Or with Docker
docker ps | grep mongo
```

### Payload Secret Error

Ensure `PAYLOAD_SECRET` is:
- At least 32 characters long
- Randomly generated
- Never committed to version control

### Clear Next.js Cache

```bash
pnpm devsafe
# or
rm -rf .next && pnpm dev
```

## Next Steps

- [Environment Setup](./environment-setup.md)
- [Development Workflow](./development-workflow.md)
- [Architecture Overview](../architecture/overview.md)
