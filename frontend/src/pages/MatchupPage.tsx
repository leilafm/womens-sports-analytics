import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import type { Matchup } from "../types";

function displayTeam(team: Matchup["homeTeam"]) {
    return team.city ? `${team.city} ${team.name}` : team.name;
}

function MatchupPage() {
    const { id } = useParams();
    const [matchup, setMatchup] = useState<Matchup | null>(null);

    useEffect(() => {
        if (!id) return;

        apiFetch<Matchup>(`/matchups/${id}`)
            .then(setMatchup)
            .catch(console.error);
    }, [id]);

    if (!matchup) {
        return <main className="container"><p>Loading...</p></main>;
    }

    const hasScore =
        matchup.homeScore !== null && matchup.awayScore !== null;

    return (
        <main className="container">
            <div className="matchup-detail">
                <p>{matchup.league.name}</p>
                <h1>
                    {displayTeam(matchup.awayTeam)} @{" "}
                    {displayTeam(matchup.homeTeam)}
                </h1>

                <p>{new Date(matchup.gameDate).toLocaleString()}</p>

                {hasScore ? (
                    <h2>
                        {matchup.awayScore} - {matchup.homeScore}
                    </h2>
                ) : (
                    <h2>Upcoming</h2>
                )}

                <div className="matchup-teams">
                    <Link to={`/teams/${matchup.awayTeam.id}`}>
                        {displayTeam(matchup.awayTeam)}
                    </Link>
                    <span>@</span>
                    <Link to={`/teams/${matchup.homeTeam.id}`}>
                        {displayTeam(matchup.homeTeam)}
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default MatchupPage;
