/**
 * ===========================================
 * Arthings - Database Connection Module
 * ===========================================
 * 
 * Singleton Prisma client for database operations
 */

const { PrismaClient } = require('@prisma/client');

// Create singleton instance
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = prisma;
