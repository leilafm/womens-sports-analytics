import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import LeaguePage from "./pages/LeaguePage";
import TeamPage from "./pages/TeamPage";

function App() {
    return (
      <div>
        <BrowserRouter> 
            <Navigation />

            <Routes>
                <Route path ="/wnba" element={<LeaguePage />} /> 
                <Route path ="/ncaaw" element={<LeaguePage />} /> 
                <Route path ="/nwsl" element={<LeaguePage />} /> 
                <Route path ="/wsl" element={<LeaguePage />} /> 

                <Route path="/teams/:id" element={<TeamPage />} />
            </Routes>

        </BrowserRouter>
      </div>
    )
  }

export default App;
