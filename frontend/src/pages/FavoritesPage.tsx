import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import type { Player, Team } from "../types";

function FavoritesPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchFavorites() {
            try {
                const [favoriteTeams, favoritePlayers] = await Promise.all([
                    apiFetch<Team[]>("/favorites/teams"),
                    apiFetch<Player[]>("/favorites/players"),
                ]);

                setTeams(favoriteTeams);
                setPlayers(favoritePlayers);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Please log in.");
            }
        }

        fetchFavorites();
    }, []);

    return (
        <main className="container">
            <div className="page-header">
                <h1>Favorites</h1>
            </div>

            {error && <p>{error}</p>}

            <section>
                <h2>Teams</h2>
                <div className="team-grid">
                    {teams.map((team) => (
                        <Link
                            className="team-card"
                            to={`/teams/${team.id}`}
                            key={team.id}
                        >
                            <h3>{team.city ? `${team.city} ${team.name}` : team.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <h2>Players</h2>
                <div className="roster-grid">
                    {players.map((player) => (
                        <div className="player-card" key={player.id}>
                            <h3>{player.name}</h3>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default FavoritesPage;
