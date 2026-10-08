import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const leagues = [
  { name: "WNBA", sport: "basketball", espnLeague: "wnba" },
  {
    name: "NCAAW BB",
    sport: "basketball",
    espnLeague: "womens-college-basketball",
  },
  { name: "NWSL", sport: "soccer", espnLeague: "usa.nwsl" },
  { name: "WSL", sport: "soccer", espnLeague: "eng.w.1" },
];

async function importTeams(
  leagueName: string,
  sport: string,
  espnLeague: string,
) {
  const league = await prisma.league.findUnique({
    where: { name: leagueName },
  });

  if (!league) throw new Error(`${leagueName} league not found.`);

  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/${sport}/${espnLeague}/teams?limit=1000`,
  );

  if (!response.ok) {
    throw new Error(`ESPN API error for ${leagueName}: ${response.status}`);
  }

  const data = await response.json();

  for (const item of data.sports?.[0]?.leagues?.[0]?.teams ?? []) {
    const team = item.team;

    await prisma.team.upsert({
      where: { espnId: team.id },
      update: {
        name: team.name,
        city: team.location ?? null,
        leagueId: league.id,
      },
      create: {
        espnId: team.id,
        name: team.name,
        city: team.location ?? null,
        leagueId: league.id,
      },
    });
  }

  console.log(`${leagueName} teams imported.`);
}

async function main() {
  for (const league of leagues) {
    await importTeams(league.name, league.sport, league.espnLeague);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());