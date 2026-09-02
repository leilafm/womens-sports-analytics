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
            <div>
                {teams.map((team) => (
                    <p key={team.id}>
                        <a href={`/teams/${team.id}`}>
                            {team.city} {team.name}
                        </a>
                    </p>
                ))}
            </div> 
        </div>
    );
}

export default LeaguePage;