// Use Link to prevent full browser reload on nav click
import { Link, useNavigate } from "react-router-dom";

function Navigation() {
    const navigate = useNavigate();
    const loggedIn = Boolean(localStorage.getItem("token"));

    function logout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <nav className="navbar">
            <div className="nav-content">
                <Link to="/">
                    <h1>WSports Hub</h1>
                </Link>

                <div className="nav-links">
                    <Link to="/wnba">WNBA</Link>
                    <Link to="/ncaaw">NCAAW BB</Link>
                    <Link to="/nwsl">NWSL</Link>
                    <Link to="/wsl">WSL</Link>
                    {loggedIn ? (
                        <>
                            <Link to="/favorites">Favorites</Link>
                            <button onClick={logout}>Log out</button>
                        </>
                    ) : (
                        <Link to="/login">Log in</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
