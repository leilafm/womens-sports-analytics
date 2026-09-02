import { useEffect, useState } from "react";

function LeaguePage() {
    // Teams stored here on backend return
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        async function fetchTeams() {
            const response = await fetch(
                "http://localhost:3000/api/leagues/WNBA/teams"
            );
    
            const data = await response.json();
    
            setTeams(data);
        }
    
        fetchTeams();
    }, []);

    return (
        <div> 
            <h2> WNBA </h2>
            <div className="team-grid">
                {teams.map((team) => (
                    <a
                        href={`/teams/${team.id}`}
                        className="team-card"
                        key={team.id}
                    >
                        <h3>{team.city} {team.name}</h3>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default LeaguePage;