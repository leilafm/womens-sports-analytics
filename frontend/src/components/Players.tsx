import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api";
import type { Player } from "../types";

function Players() {
    const { id } = useParams();
    const [players, setPlayers] = useState<Player[]>([]);
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    useEffect(() => {
        async function fetchPlayers() {
            if (!id) return;

            try {
                const data = await apiFetch<Player[]>(`/teams/${id}/players`);
                setPlayers(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchPlayers();
    }, [id]);

    async function toggleFavorite(playerId: number) {
        if (!localStorage.getItem("token")) {
            alert("Log in to save favorites.");
            return;
        }

        const isFavorite = favorites.has(playerId);
        try {
            await apiFetch(`/favorites/players/${playerId}`, {
                method: isFavorite ? "DELETE" : "POST",
            });
            setFavorites((current) => {
                const next = new Set(current);
                if (isFavorite) next.delete(playerId);
                else next.add(playerId);
                return next;
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <section>
            <h2>Roster</h2>

            <div className="roster-grid">
                {players.map((player) => (
                    <div className="player-card" key={player.id}>
                        {player.headshot && (
                            <img
                                className="player-headshot"
                                src={player.headshot}
                                alt={player.name}
                            />
                        )}
                        <div>
                            <h3>{player.name}</h3>
                            <p>
                                {player.position ?? "Player"}
                                {player.jersey ? ` · #${player.jersey}` : ""}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Players;
