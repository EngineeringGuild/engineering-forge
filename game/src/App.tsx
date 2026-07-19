import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LevelSelect } from './pages/LevelSelect';
import { PlayLevel } from './pages/PlayLevel';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LevelSelect />} />
        <Route path="/level/:levelId" element={<PlayLevel />} />
      </Routes>
    </BrowserRouter>
  );
}
