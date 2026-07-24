import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PackSelect } from './pages/PackSelect';
import { StructuresLevelSelect } from './pages/StructuresLevelSelect';
import { StructuresPlayLevel } from './pages/StructuresPlayLevel';
import { CircuitsLevelSelect } from './pages/CircuitsLevelSelect';
import { CircuitsPlayLevel } from './pages/CircuitsPlayLevel';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PackSelect />} />
        <Route path="/structures" element={<StructuresLevelSelect />} />
        <Route path="/structures/level/:levelId" element={<StructuresPlayLevel />} />
        <Route path="/circuits" element={<CircuitsLevelSelect />} />
        <Route path="/circuits/level/:levelId" element={<CircuitsPlayLevel />} />
      </Routes>
    </BrowserRouter>
  );
}
