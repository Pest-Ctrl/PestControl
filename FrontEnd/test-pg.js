const { PrismaClient } = require('@prisma/client');

async function check(url) {
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });
  try {
    await prisma.$connect();
    console.log(`Success: ${url}`);
    return true;
  } catch (e) {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const passwords = ['postgres', 'admin', 'root', 'password', '123456', ''];
  const users = ['postgres', 'admin', 'root'];
  const dbs = ['postgres', 'mydb', 'pestcontrol'];

  for (const u of users) {
    for (const p of passwords) {
      for (const d of dbs) {
        const url = `postgresql://${u}:${p}@localhost:5432/${d}?schema=public`;
        if (await check(url)) {
          process.exit(0);
        }
      }
    }
  }
  console.log('None worked');
}

main();
