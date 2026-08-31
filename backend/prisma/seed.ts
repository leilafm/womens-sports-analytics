import "dotenv/config";
// Added from prisma recommendation - check on functionality later
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Adding leagues to db");

  const wnba = await prisma.league.upsert({
    where: { name: "WNBA" },
    update: {},
    create: {
      name: "WNBA",
    },
  });

  const ncaa = await prisma.league.upsert({
    where: { name: "NCAAW BB" },
    update: {},
    create: {
      name: "NCAAW BB",
    },
  });

  const nwsl = await prisma.league.upsert({
    where: { name: "NWSL" },
    update: {},
    create: {
      name: "NWSL",
    },
  });

  const wsl = await prisma.league.upsert({
    where: { name: "WSL" },
    update: {},
    create: {
      name: "WSL",
    },
  });

  console.log("Leagues created!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());