import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function importLeaguePlayers(leagueName: string, sport: string, league: string) {
  const teams = await prisma.team.findMany({
    where: { league: { name: leagueName } },
  });

  for (const team of teams) {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team.espnId}/roster`,
    );

    if (!response.ok) {
      console.log(`Skipping ${team.name}: ${response.status}`);
      continue;
    }

    const data = await response.json();

    for (const player of data.athletes ?? []) {
      await prisma.player.upsert({
        where: { espnId: player.id },
        update: {
          name: player.fullName,
          position: player.position?.displayName ?? null,
          jersey: player.jersey ?? null,
          headshot: player.headshot?.href ?? null,
          teamId: team.id,
        },
        create: {
          espnId: player.id,
          name: player.fullName,
          position: player.position?.displayName ?? null,
          jersey: player.jersey ?? null,
          headshot: player.headshot?.href ?? null,
          teamId: team.id,
        },
      });
    }

    console.log(`Imported ${team.name}`);
  }
}

async function main() {
  await importLeaguePlayers("WNBA", "basketball", "wnba");
  // Add the other leagues here after their teams are imported:
  // await importLeaguePlayers("NCAAW BB", "basketball", "womens-college-basketball");
  // await importLeaguePlayers("NWSL", "soccer", "usa.nwsl");
  // await importLeaguePlayers("WSL", "soccer", "eng.wsl");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
