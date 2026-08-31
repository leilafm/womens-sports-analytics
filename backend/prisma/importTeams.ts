import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function importWNBAteams() {
  console.log("Fetching WNBA teams from ESPN API");

  const response = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams",
  );

  // Only accept 200 before actually getting data
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }

  const data = await response.json();

  const wnba = await prisma.league.findUnique({
    where: { name: "WNBA" },
  });

  if (!wnba) {
    throw new Error("WNBA league not found in database.");
  }

  for (const item of data.sports[0].leagues[0].teams) {
    const team = item.team;

    await prisma.team.upsert({
      where: {
        // check this exists or not
        espnId: team.id,
      },
      update: {
        // if already exists
        name: team.name,
        city: team.location,
      },
      create: {
        // if not exists
        espnId: team.id,
        name: team.name,
        city: team.location,
        leagueId: wnba.id,
      },
    });

    console.log(`Imported: ${team.location} ${team.name}`);
  }

  console.log("WNBA teams imported!");
}

async function importNWSLTeams() {
    console.log("Fetching NWSL teams from ESPN API");
  
    const response = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.nwsl/teams",
    );
  
    // Only accept 200 before actually getting data
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }
  
    const data = await response.json();
  
    const nwsl = await prisma.league.findUnique({
      where: { name: "NWSL" },
    });
  
    if (!nwsl) {
      throw new Error("NWSL league not found in database.");
    }
  
    // item.city is a duplicate of name, so is null for NWSL teams
    for (const item of data.sports[0].leagues[0].teams) {
      const team = item.team;
  
      await prisma.team.upsert({
        where: {
          espnId: team.id,
        },
        update: {
          name: team.name,
          city: null,
        },
        create: {
          espnId: team.id,
          name: team.name,
          city: null,
          leagueId: nwsl.id,
        },
      });
  
      console.log(`Imported: ${team.name}`);
    }
  
    console.log("NWSL teams imported!");
  }

importWNBAteams()
  .then(()=> importNWSLTeams())
  .catch(console.error)
  .finally(() => prisma.$disconnect());