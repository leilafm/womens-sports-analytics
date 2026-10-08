import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Players from "../components/Players";
import Matchups from "../components/Matchups";
import { apiFetch } from "../api";
import type { Team } from "../types";

function teamName(team: Team) {
    return team.city ? `${team.city} ${team.name}` : team.name;
}

const leagueRoutes: Record<string, string> = {
    "WNBA": "wnba",
    "NCAAW BB": "ncaaw",
    "NWSL": "nwsl",
    "WSL": "wsl",
};

function TeamPage() {
    const { id } = useParams();
    const [team, setTeam] = useState<Team | null>(null);
    const [favorite, setFavorite] = useState(false);

    useEffect(() => {
        async function fetchTeam() {
            if (!id) return;

            try {
                const data = await apiFetch<Team>(`/teams/${id}`);
                setTeam(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchTeam();
    }, [id]);

    async function toggleFavorite() {
        if (!team) return;
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Log in to save favorites.");
            return;
        }

        try {
            if (favorite) {
                await apiFetch(`/favorites/teams/${team.id}`, { method: "DELETE" });
                setFavorite(false);
            } else {
                await apiFetch(`/favorites/teams/${team.id}`, { method: "POST" });
                setFavorite(true);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (!team) {
        return <main className="container"><p>Loading...</p></main>;
    }

    return (
        <main className="container">
            <div className="page-header">
                <h1>{teamName(team)}</h1>
                <p>{team.league?.name ?? ""}</p>
                <button onClick={toggleFavorite}>
                    {favorite ? "★ Favorited" : "☆ Favorite"}
                </button>
            </div>

            <div className="team-content">
                <Players />

                <div className="matchup-column">
                    <Matchups />
                    <Link className="back-link" to={`/${leagueRoutes[team.league?.name ?? ""] ?? ""}`}>
                        Back to league
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default TeamPage;
