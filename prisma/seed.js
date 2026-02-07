/**
 * ===========================================
 * Arthings - Database Seed Script
 * ===========================================
 * 
 * Migrates existing data from database.json to MariaDB
 * Run with: npm run db:seed
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Path to legacy JSON database
const JSON_DB_PATH = path.join(__dirname, '../database.json');

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Load existing JSON data if available
    let jsonData = null;
    if (fs.existsSync(JSON_DB_PATH)) {
        console.log('📂 Found existing database.json, loading data...');
        const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
        jsonData = JSON.parse(data);
    }

    // ===========================================
    // Seed Categories
    // ===========================================
    console.log('\n📦 Seeding categories...');

    const categories = jsonData?.categories || [
        { id: 'electronics', name: 'Electronics', nameUk: 'Електроніка', icon: '📷' },
        { id: 'emergency', name: 'Emergency & Survival', nameUk: 'Надзвичайні ситуації', icon: '🔦' },
        { id: 'tools', name: 'Tools & Equipment', nameUk: 'Інструменти', icon: '🔧' },
        { id: 'outdoor', name: 'Outdoor & Camping', nameUk: 'Активний відпочинок', icon: '⛺' },
        { id: 'home', name: 'Home & Garden', nameUk: 'Дім і сад', icon: '🏠' },
        { id: 'sports', name: 'Sports & Fitness', nameUk: 'Спорт та фітнес', icon: '⚽' },
        { id: 'vehicles', name: 'Vehicles & Transport', nameUk: 'Транспорт', icon: '🚗' },
        { id: 'music', name: 'Music & Audio', nameUk: 'Музика та аудіо', icon: '🎸' },
        { id: 'party', name: 'Party & Events', nameUk: 'Свята та події', icon: '🎉' },
        { id: 'baby', name: 'Baby & Kids', nameUk: 'Дитячі товари', icon: '👶' },
        { id: 'fashion', name: 'Fashion & Accessories', nameUk: 'Мода та аксесуари', icon: '👗' },
        { id: 'other', name: 'Other', nameUk: 'Інше', icon: '📦' }
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { id: cat.id },
            update: { name: cat.name, nameUk: cat.nameUk, icon: cat.icon },
            create: { id: cat.id, name: cat.name, nameUk: cat.nameUk, icon: cat.icon }
        });
    }
    console.log(`   ✓ ${categories.length} categories seeded`);

    // ===========================================
    // Seed Cities
    // ===========================================
    console.log('\n🏙️  Seeding cities...');

    const cities = jsonData?.cities || [
        'Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk', 'Zaporizhzhia',
        'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Mariupol', 'Luhansk', 'Vinnytsia',
        'Makiivka', 'Simferopol', 'Kherson', 'Poltava', 'Chernihiv', 'Cherkasy',
        'Zhytomyr', 'Sumy', 'Rivne', 'Ivano-Frankivsk', 'Ternopil', 'Lutsk', 'Uzhhorod'
    ];

    for (const cityName of cities) {
        await prisma.city.upsert({
            where: { name: cityName },
            update: {},
            create: { name: cityName }
        });
    }
    console.log(`   ✓ ${cities.length} cities seeded`);

    // ===========================================
    // Seed Legal Documents
    // ===========================================
    console.log('\n📄 Seeding legal documents...');

    const legalDocs = jsonData?.legalDocuments || [
        { type: 'public-offer', version: '1.0', file: 'PUBLIC-OFFER-AGREEMENT.docx', updatedAt: new Date() },
        { type: 'privacy-policy', version: '1.0', file: 'privacy-policy-arthings.docx', updatedAt: new Date() },
        { type: 'terms-of-performance', version: '1.0', file: 'terms-of-performance-arthings.docx', updatedAt: new Date() }
    ];

    for (const doc of legalDocs) {
        await prisma.legalDocument.upsert({
            where: { type: doc.type },
            update: { version: doc.version, file: doc.file, updatedAt: new Date(doc.updatedAt) },
            create: { type: doc.type, version: doc.version, file: doc.file, updatedAt: new Date(doc.updatedAt) }
        });
    }
    console.log(`   ✓ ${legalDocs.length} legal documents seeded`);

    // ===========================================
    // Seed Users (from JSON if available)
    // ===========================================
    console.log('\n👤 Seeding users...');

    // Map old user IDs to new database IDs
    const userIdMap = new Map();

    if (jsonData?.users && jsonData.users.length > 0) {
        for (const user of jsonData.users) {
            const createdUser = await prisma.user.upsert({
                where: { email: user.email.toLowerCase() },
                update: {
                    passwordHash: user.password,
                    name: user.name,
                    phone: user.phone || null,
                    city: user.city || null,
                    avatar: user.avatar || null,
                    isVerified: false,
                    updatedAt: new Date()
                },
                create: {
                    email: user.email.toLowerCase(),
                    passwordHash: user.password,
                    name: user.name,
                    phone: user.phone || null,
                    city: user.city || null,
                    avatar: user.avatar || null,
                    isVerified: false,
                    createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
                }
            });
            userIdMap.set(user.id, createdUser.id);
        }
        console.log(`   ✓ ${jsonData.users.length} users migrated`);
    } else {
        // Create demo user if no existing users
        const demoUser = await prisma.user.create({
            data: {
                email: 'demo@arthings.com',
                passwordHash: '$2a$10$rQnM7X8YxJQn6r8GQKcMXO9ZdK7ZfJnI.WBVEJqjy0yH.7PJHXPZe', // password: demo123
                name: 'Demo User',
                phone: '+380501234567',
                city: 'Kyiv',
                isVerified: true
            }
        });
        userIdMap.set('user-demo-1', demoUser.id);
        console.log('   ✓ Demo user created');
    }

    // ===========================================
    // Seed Items/Products (from JSON if available)
    // ===========================================
    console.log('\n📦 Seeding items...');

    // Map old item IDs to new database IDs
    const itemIdMap = new Map();

    if (jsonData?.products && jsonData.products.length > 0) {
        let migratedCount = 0;
        let skippedCount = 0;

        for (const product of jsonData.products) {
            const userId = userIdMap.get(product.userId);
            if (!userId) {
                console.log(`   ⚠️  Skipping product "${product.title}" - owner not found`);
                continue;
            }

            // Check if item with same title and user already exists
            const existingItem = await prisma.item.findFirst({
                where: {
                    userId: userId,
                    title: product.title
                }
            });

            if (existingItem) {
                itemIdMap.set(product.id, existingItem.id);
                skippedCount++;
                continue;
            }

            const createdItem = await prisma.item.create({
                data: {
                    userId: userId,
                    title: product.title,
                    description: product.description,
                    pricePerDay: product.price,
                    priceUnit: product.priceUnit || 'day',
                    category: product.category,
                    city: product.city || null,
                    isAvailable: product.available !== false,
                    views: product.views || 0,
                    createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
                }
            });
            itemIdMap.set(product.id, createdItem.id);
            migratedCount++;

            // Create item images
            if (product.images && product.images.length > 0) {
                for (let i = 0; i < product.images.length; i++) {
                    await prisma.itemImage.create({
                        data: {
                            itemId: createdItem.id,
                            imagePath: product.images[i],
                            sortOrder: i
                        }
                    });
                }
            }
        }
        console.log(`   ✓ ${migratedCount} items migrated, ${skippedCount} already existed`);
    } else {
        console.log('   ℹ️  No items to migrate');
    }

    // ===========================================
    // Seed Favorites (from JSON if available)
    // ===========================================
    console.log('\n❤️  Seeding favorites...');

    if (jsonData?.favorites && jsonData.favorites.length > 0) {
        let migratedCount = 0;
        for (const fav of jsonData.favorites) {
            const userId = userIdMap.get(fav.userId);
            const itemId = itemIdMap.get(fav.productId);

            if (userId && itemId) {
                await prisma.favorite.upsert({
                    where: { userId_itemId: { userId, itemId } },
                    update: {},
                    create: {
                        userId,
                        itemId,
                        createdAt: fav.createdAt ? new Date(fav.createdAt) : new Date()
                    }
                });
                migratedCount++;
            }
        }
        console.log(`   ✓ ${migratedCount} favorites migrated`);
    } else {
        console.log('   ℹ️  No favorites to migrate');
    }

    // ===========================================
    // Seed Rentals (from JSON if available)
    // ===========================================
    console.log('\n📋 Seeding rentals...');

    if (jsonData?.rentals && jsonData.rentals.length > 0) {
        let migratedCount = 0;
        for (const rental of jsonData.rentals) {
            const itemId = itemIdMap.get(rental.productId);
            const renterId = userIdMap.get(rental.renterId);

            if (itemId && renterId) {
                await prisma.rental.create({
                    data: {
                        itemId,
                        renterId,
                        startDate: new Date(rental.startDate),
                        endDate: new Date(rental.endDate),
                        days: rental.days || 1,
                        pricePerDay: rental.pricePerDay || 0,
                        totalPrice: rental.totalPrice || 0,
                        message: rental.message || null,
                        status: rental.status || 'pending',
                        createdAt: rental.createdAt ? new Date(rental.createdAt) : new Date()
                    }
                });
                migratedCount++;
            }
        }
        console.log(`   ✓ ${migratedCount} rentals migrated`);
    } else {
        console.log('   ℹ️  No rentals to migrate');
    }

    // ===========================================
    // Seed Legal Consents (from JSON if available)
    // ===========================================
    console.log('\n📝 Seeding legal consents...');

    if (jsonData?.legalConsents && jsonData.legalConsents.length > 0) {
        let migratedCount = 0;
        for (const consent of jsonData.legalConsents) {
            const userId = userIdMap.get(consent.userId);

            if (userId) {
                await prisma.legalConsent.create({
                    data: {
                        userId,
                        documentType: consent.documentType,
                        documentVersion: consent.documentVersion,
                        ipAddress: consent.ip || null,
                        userAgent: consent.userAgent || null,
                        acceptedAt: consent.acceptedAt ? new Date(consent.acceptedAt) : new Date()
                    }
                });
                migratedCount++;
            }
        }
        console.log(`   ✓ ${migratedCount} legal consents migrated`);
    } else {
        console.log('   ℹ️  No legal consents to migrate');
    }

    console.log('\n✅ Database seeding completed successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
