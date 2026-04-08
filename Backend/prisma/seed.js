const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting enhanced system seeding...');

  try {
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
        area: 'Metro Central',
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
        area: 'Bole District',
      },
    });

    // 3. Normal User (Citizen)
    const citizen = await prisma.user.upsert({
      where: { email: 'citizen@issop.com' },
      update: {},
      create: {
        name: 'Samuel Tessema',
        email: 'citizen@issop.com',
        password: hashedPassword,
        role: 'USER',
        phone: '1234567893',
        area: 'Bole District',
      },
    });

    // 4. Seeding Agents
    console.log('📡 Seeding Field Agents...');
    const agents = [];
    const agentNames = ['Dawit', 'Hanna', 'Abel', 'Marta', 'Yared', 'Sifan', 'Nebiyu', 'Selam', 'Kidus', 'Beza'];
    for (let i = 0; i < 10; i++) {
        const ag = await prisma.user.upsert({
            where: { email: `agent${i+1}@issop.com` },
            update: {},
            create: {
                name: agentNames[i],
                email: `agent${i+1}@issop.com`,
                password: hashedPassword,
                role: 'AGENT',
                phone: `091100000${i+1}`,
                area: i < 5 ? 'Bole District' : 'Dill City',
                latitude: 8.98 + (Math.random() * 0.1),
                longitude: 38.70 + (Math.random() * 0.1),
                status: 'AVAILABLE',
            }
        });
        agents.push(ag);
    }

    // 5. Seeding Requests
    console.log('📝 Seeding Production-Ready Requests...');
    const categories = ['INFRASTRUCTURE', 'SANITATION', 'TRAFFIC', 'UTILITIES', 'PUBLIC_SAFETY'];
    const requestTitles = [
      'Burst Water Pipe near Bole Highschool',
      'Illegal Waste Dumping in Alley 4',
      'Street Light Malfunction at Meskel Square',
      'Pothole on Main Airport Road',
      'Traffic Signal Power Loss',
      'Fallen Tree Blocking Sidewalk',
      'Uncollected Garbage Overload',
      'Sewer Overflowing in District 5',
      'Exposed Electrical Cables near Park',
      'Graffiti Removal Request'
    ];

    for (let i = 0; i < 10; i++) {
        const status = i < 3 ? 'PENDING' : i < 6 ? 'ASSIGNED' : i < 9 ? 'IN_PROGRESS' : 'COMPLETED';
        const agentId = (status === 'ASSIGNED' || status === 'IN_PROGRESS' || status === 'COMPLETED') 
            ? agents[i % agents.length].id 
            : null;

        await prisma.request.create({
            data: {
                title: requestTitles[i],
                description: `Automatic report of type ${categories[i % categories.length]} requiring immediate intervention. High priority detected by system.`,
                category: categories[i % categories.length],
                status: status,
                latitude: 8.98 + (Math.random() * 0.1),
                longitude: 38.70 + (Math.random() * 0.1),
                address: i % 2 === 0 ? 'Bole Road, Addis Ababa' : 'Meskel Square, Addis Ababa',
                citizenId: citizen.id,
                agentId: agentId,
                createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over 10 days
                ...(status === 'COMPLETED' ? { completionProofUrl: 'https://images.unsplash.com/photo-1541888941259-7927394eb996' } : {})
            }
        });
        
        if (agentId) {
            await prisma.user.update({
                where: { id: agentId },
                data: { status: status === 'COMPLETED' ? 'AVAILABLE' : 'BUSY' }
            });
        }
    }

    // 6. Seeding Notifications for Admins
    console.log('🔔 Seeding System Activity Alerts...');
    const admins = [superAdmin, admin];
    const notifications = [
        { type: 'REQUEST_CREATED', message: 'High priority request submitted: "Water Pipe Burst"' },
        { type: 'STATUS_UPDATED', message: 'Agent Dawit marked "Stray Animal Alert" as IN_PROGRESS' },
        { type: 'TASK_ASSIGNED', message: 'New Task "Graffiti Removal" assigned to Field Unit Abel' },
        { type: 'REQUEST_CREATED', message: 'Emergency: Traffic Signal Failure at Meskel Sq.' }
    ];

    for (const a of admins) {
        for (const n of notifications) {
            await prisma.notification.create({
                data: {
                    userId: a.id,
                    type: n.type,
                    message: n.message,
                    isRead: Math.random() > 0.5
                }
            });
        }
    }

    console.log('✅ System Seed Complete.');
  } catch (e) {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
