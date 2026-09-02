// Use Link to prevent full browser reload on nav click
import { Link } from "react-router-dom";

function Navigation() {
    return (
        <nav>
            <h1>WSports Hub</h1>

            <div>
                <Link to="/wnba">WNBA</Link>
                <Link to="/ncaaw">NCAAW BB</Link>
                <Link to="/nwsl">NWSL</Link>
                <Link to="/wsl">WSL</Link>
            </div>
        </nav>
    );
}

export default Navigation;