# Arthings Database Setup Guide

This document provides instructions for setting up MariaDB as the database for the Arthings rental platform.

## Prerequisites

- **Node.js** 18+ installed
- **MariaDB** 10.5+ installed and running
- **npm** or **yarn** package manager

---

## Quick Start

If you already have MariaDB installed and running:

```bash
# 1. Install dependencies
npm install

# 2. Create the database (run in MariaDB/MySQL client)
mysql -u root -p
> CREATE DATABASE arthings CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> exit;

# 3. Configure environment
# Edit .env file with your database credentials

# 4. Push schema to database
npx prisma db push

# 5. Seed initial data
npm run db:seed

# 6. Start the application
npm run dev
```

---

## Detailed Setup Instructions

### 1. MariaDB Installation

#### Windows (using XAMPP)

1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start the MariaDB service from XAMPP Control Panel
3. MariaDB will be available at `localhost:3306`

#### Windows (Standalone)

1. Download MariaDB from [mariadb.org/download](https://mariadb.org/download/)
2. Run the installer and follow the prompts
3. Set a root password (remember it!)
4. The service will start automatically

#### macOS (using Homebrew)

```bash
brew install mariadb
brew services start mariadb
mysql_secure_installation  # Set root password
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install mariadb-server
sudo systemctl start mariadb
sudo mysql_secure_installation
```

---

### 2. Create the Database

Connect to MariaDB and create the database:

```bash
# Connect to MariaDB
mysql -u root -p
```

Run these SQL commands:

```sql
-- Create database
CREATE DATABASE arthings CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- (Optional) Create dedicated user
CREATE USER 'arthings'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON arthings.* TO 'arthings'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
```

---

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# If using root without password (development only)
DATABASE_URL="mysql://root:@localhost:3306/arthings"

# If using root with password
DATABASE_URL="mysql://root:your_password@localhost:3306/arthings"

# If using dedicated user
DATABASE_URL="mysql://arthings:your_secure_password@localhost:3306/arthings"

# Session secret (change in production!)
SESSION_SECRET=your-random-secret-key

# Server port
PORT=3000
```

---

### 4. Install Dependencies

```bash
npm install
```

This will:
- Install all Node.js dependencies
- Generate the Prisma client (via `postinstall` script)

---

### 5. Create Database Schema

Push the Prisma schema to the database:

```bash
npx prisma db push
```

This creates all tables, indexes, and constraints.

To verify, you can open Prisma Studio:

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`.

---

### 6. Seed Initial Data

Run the seed script to populate the database:

```bash
npm run db:seed
```

This will:
- Import categories from the existing `database.json`
- Import cities
- Import legal documents
- Migrate existing users (preserving password hashes)
- Migrate existing products
- Migrate favorites and rentals

**Output example:**
```
🌱 Starting database seed...

📂 Found existing database.json, loading data...

📦 Seeding categories...
   ✓ 12 categories seeded

🏙️  Seeding cities...
   ✓ 25 cities seeded

📄 Seeding legal documents...
   ✓ 3 legal documents seeded

👤 Seeding users...
   ✓ 2 users migrated

📦 Seeding items...
   ✓ 6 items migrated

✅ Database seeding completed successfully!
```

---

### 7. Start the Application

```bash
npm run dev
```

The application will start at `http://localhost:3000`.

Verify the database connection:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-29T14:30:00.000Z"
}
```

---

## Database Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate:dev` | Create new migration (development) |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:reset` | Reset database (WARNING: deletes all data) |

---

## Troubleshooting

### "Can't connect to local MySQL server"

- Ensure MariaDB service is running
- Check if the port is correct (default: 3306)
- Verify credentials in `.env`

### "Access denied for user"

- Double-check username and password
- Ensure the user has privileges on the `arthings` database
- Try connecting manually: `mysql -u username -p`

### "Unknown database 'arthings'"

- Create the database first:
  ```sql
  CREATE DATABASE arthings CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### "Prisma client not generated"

Run:
```bash
npx prisma generate
```

### "Foreign key constraint fails" during seed

This usually means there's a data inconsistency. Try resetting:
```bash
npx prisma db push --force-reset
npm run db:seed
```

---

## Production Considerations

1. **Use environment variables** - Never commit `.env` to version control
2. **Secure password** - Use a strong, unique password for the database user
3. **SSL/TLS** - Enable encrypted connections to the database
4. **Connection pooling** - Prisma handles this automatically
5. **Backups** - Set up regular automated backups
6. **Migrations** - Use `prisma migrate` instead of `db push` in production

---

## Schema Overview

| Table | Description |
|-------|-------------|
| `users` | Registered platform users |
| `items` | Rentable products/items |
| `item_images` | Images for each item |
| `rentals` | Rental requests and history |
| `favorites` | User favorites (wishlist) |
| `legal_consents` | User acceptance of legal documents |
| `categories` | Product categories with translations |
| `cities` | Available cities |
| `legal_documents` | Legal document metadata |

---

## Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify database connection with `/api/health`
3. Use Prisma Studio (`npm run db:studio`) to inspect data
4. Check the [Prisma documentation](https://www.prisma.io/docs)
