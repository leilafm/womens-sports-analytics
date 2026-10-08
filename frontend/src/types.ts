export type League = {
    id: number;
    name: string;
};

export type Team = {
    id: number;
    espnId: string;
    name: string;
    city: string | null;
    leagueId: number;
    league?: League;
};

export type Player = {
    id: number;
    espnId: string;
    name: string;
    position: string | null;
    jersey: string | null;
    headshot: string | null;
    teamId: number;
};

export type Matchup = {
    id: number;
    espnId: string;
    gameDate: string;
    homeScore: number | null;
    awayScore: number | null;
    homeTeam: Team;
    awayTeam: Team;
    league: League;
};
