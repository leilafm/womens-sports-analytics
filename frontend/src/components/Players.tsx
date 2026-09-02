import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Players() {
    const { id } = useParams();
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        async function fetchPlayers() {
            const response = await fetch(
                `http://localhost:3000/api/teams/${id}/players`
            );
    
            const data = await response.json();
    
            setPlayers(data);
        }
    
        fetchPlayers();
    }, [id]);
    return (
        <div>
            Roster
            {players.map((player) => (
                    <p key={player.id}>
                        {player.name}
                    </p>
                ))}
        </div>
    );
}

export default Players;