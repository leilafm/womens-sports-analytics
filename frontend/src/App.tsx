import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import LeaguePage from "./pages/LeaguePage";
import TeamPage from "./pages/TeamPage";
import MatchupPage from "./pages/MatchupPage";
import AuthPage from "./pages/AuthPage";
import FavoritesPage from "./pages/FavoritesPage";

function App() {
    return (
        <BrowserRouter>
            <Navigation />

            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route path=":league" element={<LeaguePage />} />
                <Route path=":league" element={<LeaguePage />} />
                <Route path=":league" element={<LeaguePage />} />
                <Route path=":league" element={<LeaguePage />} />

                <Route path="/teams/:id" element={<TeamPage />} />
                <Route path="/matchups/:id" element={<MatchupPage />} />

                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
