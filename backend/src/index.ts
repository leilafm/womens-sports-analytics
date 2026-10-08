import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = 3000;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const scrypt = promisify(crypto.scrypt);

app.use(cors());
app.use(express.json());

type AuthRequest = Request & { userId?: number };

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");

  return (
    storedKey.length === derivedKey.length &&
    crypto.timingSafeEqual(storedKey, derivedKey)
  );
}

async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  const token = header.slice("Bearer ".length);

  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ message: "Invalid or expired session." });
    return;
  }

  req.userId = session.userId;
  next();
}

app.get("/", (_req, res) => {
  res.json({ message: "Women's Sports backend is running!" });
});

/* ---------------- LEAGUES ---------------- */

app.get("/api/leagues", async (_req, res) => {
  const leagues = await prisma.league.findMany({
    include: {
      _count: {
        select: { teams: true, matchups: true },
      },
    },
  });

  res.json(leagues);
});

app.get("/api/leagues/:league/teams", async (req, res) => {
  const league = await prisma.league.findUnique({
    where: { name: req.params.league },
  });

  if (!league) {
    res.status(404).json({ message: "League not found." });
    return;
  }

  const teams = await prisma.team.findMany({
    where: { leagueId: league.id },
    orderBy: { name: "asc" },
  });

  res.json(teams);
});

/* ---------------- TEAMS ---------------- */

app.get("/api/teams/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid team ID." });
    return;
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      league: true,
      _count: {
        select: { players: true, homeMatchups: true, awayMatchups: true },
      },
    },
  });

  if (!team) {
    res.status(404).json({ message: "Team not found." });
    return;
  }

  res.json(team);
});

app.get("/api/teams/:id/players", async (req, res) => {
  const id = Number(req.params.id);

  const players = await prisma.player.findMany({
    where: { teamId: id },
    orderBy: { name: "asc" },
  });

  res.json(players);
});

app.get("/api/teams/:id/matchups", async (req, res) => {
  const id = Number(req.params.id);

  const matchups = await prisma.matchup.findMany({
    where: {
      OR: [{ homeTeamId: id }, { awayTeamId: id }],
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { gameDate: "asc" },
  });

  res.json(matchups);
});

/* ---------------- MATCHUPS ---------------- */

app.get("/api/matchups", async (req, res) => {
  const leagueName =
    typeof req.query.league === "string" ? req.query.league : undefined;

  const limit =
    typeof req.query.limit === "string"
      ? Math.min(Number(req.query.limit), 100)
      : 20;

  const matchups = await prisma.matchup.findMany({
    where: leagueName
    ? { league: { name: leagueName } }
    : {},
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
    orderBy: { gameDate: "asc" },
    take: Number.isNaN(limit) ? 20 : limit,
  });

  res.json(matchups);
});

app.get("/api/matchups/:id", async (req, res) => {
  const id = Number(req.params.id);

  const matchup = await prisma.matchup.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  if (!matchup) {
    res.status(404).json({ message: "Matchup not found." });
    return;
  }

  res.json(matchup);
});

/* ---------------- AUTH ---------------- */

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ message: "Password must be at least 8 characters." });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    res.status(409).json({ message: "Email is already registered." });
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: typeof name === "string" ? name : null,
    },
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  const token = crypto.randomUUID();

  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, name: true },
  });

  res.json(user);
});

/* ---------------- FAVORITES ---------------- */

app.get("/api/favorites/teams", requireAuth, async (req: AuthRequest, res) => {
  const favorites = await prisma.favoriteTeam.findMany({
    where: { userId: req.userId! },
    include: { team: true },
  });

  res.json(favorites.map((favorite) => favorite.team));
});

app.post("/api/favorites/teams/:teamId", requireAuth, async (req: AuthRequest, res) => {
  const teamId = Number(req.params.teamId);

  const favorite = await prisma.favoriteTeam.upsert({
    where: {
      userId_teamId: {
        userId: req.userId!,
        teamId,
      },
    },
    update: {},
    create: {
      userId: req.userId!,
      teamId,
    },
  });

  res.status(201).json(favorite);
});

app.delete("/api/favorites/teams/:teamId", requireAuth, async (req: AuthRequest, res) => {
  const teamId = Number(req.params.teamId);

  await prisma.favoriteTeam.deleteMany({
    where: {
      userId: req.userId!,
      teamId,
    },
  });

  res.status(204).send();
});

app.get("/api/favorites/players", requireAuth, async (req: AuthRequest, res) => {
  const favorites = await prisma.favoritePlayer.findMany({
    where: { userId: req.userId!
     },
    include: { player: { include: { team: true } } },
  });

  res.json(favorites.map((favorite) => favorite.player));
});

app.post("/api/favorites/players/:playerId", requireAuth, async (req: AuthRequest, res) => {
  const playerId = Number(req.params.playerId);

  const favorite = await prisma.favoritePlayer.upsert({
    where: {
      userId_playerId: {
        userId: req.userId!,
        playerId,
      },
    },
    update: {},
    create: {
      userId: req.userId!,
      playerId,
    },
  });

  res.status(201).json(favorite);
});

app.delete("/api/favorites/players/:playerId", requireAuth, async (req: AuthRequest, res) => {
  const playerId = Number(req.params.playerId);

  await prisma.favoritePlayer.deleteMany({
    where: {
      userId: req.userId!,
      playerId,
    },
  });

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
