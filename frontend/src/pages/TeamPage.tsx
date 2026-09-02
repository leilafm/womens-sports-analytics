import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
        <div>
            <h2>
                {team && (
                    <div> 
                        <h3> {team.city} {team.name} </h3>
                    </div>
                )}
            </h2>
        </div>
    );
}

export default TeamPage;