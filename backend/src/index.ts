import "dotenv/config";
import express from "express";
import cors from "cors";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const app = express();
const PORT = 3000;
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
  
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from my Women's Sports backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/leagues/WNBA/teams", async (req, res) => {
    const teams = await prisma.team.findMany({
        where: {
            league: {
                name: "WNBA",
            },
        },
    });

    res.json(teams);
});

app.get("/api/teams/:id", async (req, res) => {
    const id = Number(req.params.id);
    const team = await prisma.team.findUnique({
        where: {
            id: id,
        },
    });

    res.json(team);
});

app.get("/api/teams/:id/players", async (req, res) => {
    const id = Number(req.params.id);
    const players = await prisma.player.findMany({
        where: {
            teamId: id,
        },
    });

    res.json(players);
});

