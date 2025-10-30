import { PrismaClient } from '@prisma/client';
  import bcrypt from 'bcrypt';
  import readline from 'readline';

  const prisma = new PrismaClient();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  async function createAdmin() {
    console.log('\n=== Create Admin User ===\n');

    const email = await question('Email: ');
    const password = await question('Password: ');
    const fullName = await question('Full Name: ');
    const role = await question('Role (admin/manager) [admin]: ') || 'admin';

    if (!email || !password || !fullName) {
      console.error('Email, password, and full name are required!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      console.error(`\n❌ User with email ${email} already exists!`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role,
        active: true,
        totpEnabled: false,
        totpSecret: null,
        permissions: {}
      }
    });

    console.log(`\n✅ Admin user created successfully!`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`\nYou can now login with this account.\n`);

    await prisma.$disconnect();
    rl.close();
  }

  createAdmin().catch((error) => {
    console.error('Error creating admin:', error);
    process.exit(1);
  });
