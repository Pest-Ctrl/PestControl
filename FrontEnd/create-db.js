const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public' }
    }
  });
  
  try {
    await prisma.$executeRawUnsafe('CREATE DATABASE pestcontrol;');
    console.log("Database pestcontrol created successfully!");
  } catch (e) {
    console.error("Error creating DB:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
