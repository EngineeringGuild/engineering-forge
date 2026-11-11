import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PackSelect } from './pages/PackSelect';
import { StructuresLevelSelect } from './pages/StructuresLevelSelect';
import { StructuresPlayLevel } from './pages/StructuresPlayLevel';
import { CircuitsLevelSelect } from './pages/CircuitsLevelSelect';
import { CircuitsPlayLevel } from './pages/CircuitsPlayLevel';
import { VehiclesLevelSelect } from './pages/VehiclesLevelSelect';
import { VehiclesPlayLevel } from './pages/VehiclesPlayLevel';
import { MechatronicsLevelSelect } from './pages/MechatronicsLevelSelect';
import { MechatronicsPlayLevel } from './pages/MechatronicsPlayLevel';
import { LabPage } from './pages/LabPage';
import { AchievementBanner } from './components/AchievementBanner';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PackSelect />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/structures" element={<StructuresLevelSelect />} />
        <Route path="/structures/level/:levelId" element={<StructuresPlayLevel />} />
        <Route path="/circuits" element={<CircuitsLevelSelect />} />
        <Route path="/circuits/level/:levelId" element={<CircuitsPlayLevel />} />
        <Route path="/machines" element={<VehiclesLevelSelect />} />
        <Route path="/machines/level/:levelId" element={<VehiclesPlayLevel />} />
        <Route path="/mechatronics" element={<MechatronicsLevelSelect />} />
        <Route path="/mechatronics/level/:levelId" element={<MechatronicsPlayLevel />} />
      </Routes>
      <AchievementBanner />
    </BrowserRouter>
  );
}
