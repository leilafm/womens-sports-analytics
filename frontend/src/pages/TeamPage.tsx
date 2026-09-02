import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Players from "../components/Players";

function TeamPage() {
    const { id } = useParams();
    const [team, setTeam] = useState(null);

    useEffect(() => {
        async function fetchTeam() {
            const response = await fetch(
                `http://localhost:3000/api/teams/${id}`
            );
    
            const data = await response.json();
    
            setTeam(data);
        }
    
        fetchTeam();
    }, [id]);

    return (
        <main className="container">
            {team && (
                <div className="page-header">
                    <h1>{team.city} {team.name}</h1>
                </div>
            )}
    
            <Players />
        </main>
    );
}

export default TeamPage;