import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TopPage from './pages/TopPage'
import LobbyPage from './pages/LobbyPage'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <Router basename="/FutonHit">
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  )
}

export default App
