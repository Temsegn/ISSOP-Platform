const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting exact seeding...');

  try {
    // Clean existing users dynamically (Optional, maybe we just verify if they exist)
    // using Prisma upsert to avoid duplicate errors

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. SuperAdmin
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@issop.com' },
      update: {},
      create: {
        name: 'Master SuperAdmin',
        email: 'superadmin@issop.com',
        password: hashedPassword,
        role: 'SUPERADMIN',
        phone: '1234567890',
      },
    });

    // 2. Admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@issop.com' },
      update: {},
      create: {
        name: 'Regional Admin',
        email: 'admin@issop.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '1234567891',
        area: 'Bole City',
      },
    });

    // 3. Agent
    const agent = await prisma.user.upsert({
      where: { email: 'agent@issop.com' },
      update: {},
      create: {
        name: 'Field Agent',
        email: 'agent@issop.com',
        password: hashedPassword,
        role: 'AGENT',
        phone: '1234567892',
        area: 'Bole City', // Matches admin's area
        latitude: 9.03, // Dummy location close to Addis Ababa
        longitude: 38.74,
      },
    });

    // 4. User
    const user = await prisma.user.upsert({
      where: { email: 'user@issop.com' },
      update: {},
      create: {
        name: 'Normal Citizen',
        email: 'user@issop.com',
        password: hashedPassword,
        role: 'USER',
        phone: '1234567893',
      },
    });

    // 5. Add 10 dummy Field Agents
    console.log('Seeding 10 Field Agents...');
    for (let i = 1; i <= 10; i++) {
        await prisma.user.upsert({
            where: { email: `agent${i}@issop.com` },
            update: {},
            create: {
                name: `Agent ${i} (Field Unit)`,
                email: `agent${i}@issop.com`,
                password: hashedPassword,
                role: 'AGENT',
                phone: `091100000${i}`,
                area: 'Bole City',
                latitude: 8.98 + (Math.random() * 0.1),
                longitude: 38.70 + (Math.random() * 0.1),
            }
        });
    }

    console.log('✅ Seed completed successfully:');
    console.log('-> SuperAdmin:', superAdmin.email);
    console.log('-> Admin:', admin.email);
    console.log('-> Agent:', agent.email);
    console.log('-> User:', user.email);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
