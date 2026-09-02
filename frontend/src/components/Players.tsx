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
        <section>
            <h2>Roster</h2>

            <div className="roster-grid">
                {players.map((player) => (
                    <div className="player-card" key={player.id}>
                        <h3>{player.name}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Players;