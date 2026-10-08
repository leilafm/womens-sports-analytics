import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const leagues = [
  { name: "WNBA", sport: "basketball", league: "wnba" },
//   {
//     name: "NCAAW BB",
//     sport: "basketball",
//     league: "womens-college-basketball",
//   },
  { name: "NWSL", sport: "soccer", league: "usa.nwsl" },
  { name: "WSL", sport: "soccer", league: "eng.w.1" },
];

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

async function importLeague(
  leagueName: string,
  sport: string,
  espnLeague: string,
) {
  const league = await prisma.league.findUnique({
    where: { name: leagueName },
  });

  if (!league) {
    throw new Error(`League ${leagueName} not found.`);
  }

  const start = new Date();

  console.log(`Fetching ${leagueName} matchups...`);

  // Fetch the next 60 days one day at a time.
  for (let i = 0; i < 60; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const formattedDate = formatDate(date);

    const url =
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${espnLeague}/scoreboard` +
      `?limit=1000&dates=${formattedDate}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `ESPN API error for ${leagueName} on ${formattedDate}: ${response.status}`,
      );
    }

    const data = await response.json();

    for (const event of data.events ?? []) {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors ?? [];

      const home = competitors.find(
        (team: any) => team.homeAway === "home",
      );

      const away = competitors.find(
        (team: any) => team.homeAway === "away",
      );

      if (!home || !away) continue;

      const homeTeam = await prisma.team.findUnique({
        where: { espnId: home.team.id },
      });

      const awayTeam = await prisma.team.findUnique({
        where: { espnId: away.team.id },
      });

      if (!homeTeam || !awayTeam) {
        console.log(`Skipping ${event.name}: team not in database.`);
        continue;
      }

      await prisma.matchup.upsert({
        where: { espnId: event.id },
        update: {
          gameDate: new Date(event.date),
          homeScore: home.score ? Number(home.score) : null,
          awayScore: away.score ? Number(away.score) : null,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
        },
        create: {
          espnId: event.id,
          leagueId: league.id,
          gameDate: new Date(event.date),
          homeScore: home.score ? Number(home.score) : null,
          awayScore: away.score ? Number(away.score) : null,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
        },
      });
    }
  }

  console.log(`${leagueName} matchups imported.`);
}

async function main() {
  for (const league of leagues) {
    await importLeague(league.name, league.sport, league.league);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());