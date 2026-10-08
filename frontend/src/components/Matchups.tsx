import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import type { Matchup } from "../types";

function formatGameDate(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function Matchups() {
    const { id } = useParams();
    const [matchups, setMatchups] = useState<Matchup[]>([]);

    useEffect(() => {
        async function fetchMatchups() {
            if (!id) return;

            try {
                const data = await apiFetch<Matchup[]>(`/teams/${id}/matchups`);
                setMatchups(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchMatchups();
    }, [id]);

    return (
        <section>
            <h2>Matchups</h2>

            <div className="matchup-list">
                {matchups.length === 0 && <p>No matchups imported yet.</p>}

                {matchups.map((matchup) => (
                    <Link
                        className="matchup-card"
                        to={`/matchups/${matchup.id}`}
                        key={matchup.id}
                    >
                        <p>{formatGameDate(matchup.gameDate)}</p>

                        <div>
                            <strong>
                                {matchup.awayTeam.city
                                    ? `${matchup.awayTeam.city} ${matchup.awayTeam.name}`
                                    : matchup.awayTeam.name}
                            </strong>
                            {" @ "}
                            <strong>
                                {matchup.homeTeam.city
                                    ? `${matchup.homeTeam.city} ${matchup.homeTeam.name}`
                                    : matchup.homeTeam.name}
                            </strong>
                        </div>

                        {matchup.homeScore !== null && matchup.awayScore !== null && (
                            <p>
                                {matchup.awayScore} - {matchup.homeScore}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Matchups;
