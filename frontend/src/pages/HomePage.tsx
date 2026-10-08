import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import type { Matchup } from "../types";

const leagueRoutes: Record<string, string> = {
    WNBA: "wnba",
    "NCAAW BB": "ncaaw",
    NWSL: "nwsl",
    WSL: "wsl",
};

function displayTeam(team: Matchup["homeTeam"]) {
    return team.city ? `${team.city} ${team.name}` : team.name;
}

function HomePage() {
    const [matchups, setMatchups] = useState<Matchup[]>([]);

    useEffect(() => {
        apiFetch<Matchup[]>("/matchups?limit=10")
            .then(setMatchups)
            .catch(console.error);
    }, []);

    return (
        <main className="container">
            <div className="page-header">
                <h1>Women's Sports</h1>
                <p>Follow teams, players, and games across women's sports.</p>
            </div>

            <section>
                <h2>Upcoming Matchups</h2>

                <div className="matchup-list">
                    {matchups.length === 0 && (
                        <p>No matchups have been imported yet.</p>
                    )}

                    {matchups.map((matchup) => (
                        <Link
                            className="matchup-card"
                            to={`/matchups/${matchup.id}`}
                            key={matchup.id}
                        >
                            <p>
                                {new Date(matchup.gameDate).toLocaleString()}
                            </p>
                            <strong>{displayTeam(matchup.awayTeam)}</strong>
                            {" @ "}
                            <strong>{displayTeam(matchup.homeTeam)}</strong>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="league-links">
                <h2>Leagues</h2>
                {Object.entries(leagueRoutes).map(([name, route]) => (
                    <Link className="league-card" to={`/${route}`} key={name}>
                        {name}
                    </Link>
                ))}
            </section>
        </main>
    );
}

export default HomePage;
