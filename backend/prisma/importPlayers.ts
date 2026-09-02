import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function importWNBAPlayers() {
    console.log("Fetching WNBA players from ESPN API");
  
    // This is required to use created id to get espn id to pull accurate data from api
    const teams = await prisma.team.findMany({
      where: {
        league: {
          name: "WNBA",
        },
      },
    });

    for (const team of teams) {
        const response = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams/${team.espnId}/roster`,
        )

        if (!response.ok) {
            throw new Error(`ESPN API error: ${response.status}`);
        }

        const data = await response.json();
        const players = data.athletes;

        for (const player of players) {
            await prisma.player.upsert({
                where: {
                  espnId: player.id,
                },
                update: {
                  name: player.fullName,
                  teamId: team.id,
                },
                create: {
                  espnId: player.id,
                  name: player.fullName,
                  teamId: team.id,
                },
              });

            console.log(`Imported: ${player.fullName} to ${team.name}`);
        }
    }
    
    console.log("WNBA players imported!");
}

importWNBAPlayers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());