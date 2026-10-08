import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import type { Team } from "../types";

const leagueNames: Record<string, string> = {
    wnba: "WNBA",
    ncaaw: "NCAAW BB",
    nwsl: "NWSL",
    wsl: "WSL",
};

function LeaguePage() {
    const { league } = useParams();
    const leagueName = league ? leagueNames[league] : undefined;
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        async function fetchTeams() {
            if (!leagueName) return;

            try {
                const data = await apiFetch<Team[]>(
                    `/leagues/${encodeURIComponent(leagueName)}/teams`,
                );
                setTeams(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchTeams();
    }, [leagueName]);

    if (!leagueName) {
        return <main className="container"><h1>League not found</h1></main>;
    }

    return (
        <main className="container">
            <div className="page-header">
                <h1>{leagueName}</h1>
            </div>

            <div className="team-grid">
                {teams.map((team) => (
                    <Link
                        to={`/teams/${team.id}`}
                        className="team-card"
                        key={team.id}
                    >
                        <h3>
                            {team.city ? `${team.city} ${team.name}` : team.name}
                        </h3>
                    </Link>
                ))}
            </div>
        </main>
    );
}

export default LeaguePage;
