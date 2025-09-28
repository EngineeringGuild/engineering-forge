import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import FixedGamePage from './pages/FixedGamePage';
import HomePage from './pages/HomePage';
import SimpleGamePage from './pages/SimpleGamePage';
import TestGamePage from './pages/TestGamePage';

function App() {
  return (
    <Router basename="/v1">
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<SimpleGamePage />} />
          <Route path="/game-fixed" element={<FixedGamePage />} />
          <Route path="/game-simple" element={<SimpleGamePage />} />
          <Route path="/game-full" element={<SimpleGamePage />} />
          <Route path="/game-test" element={<TestGamePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
