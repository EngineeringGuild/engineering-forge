import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
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
import { EducatorAcademyPage } from './pages/EducatorAcademyPage';
import { AchievementBanner } from './components/AchievementBanner';
import { GlobalNavBar } from './components/GlobalNavBar';

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-bg text-fg flex flex-col">
        <GlobalNavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<PackSelect />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/educator" element={<EducatorAcademyPage />} />
            <Route path="/structures" element={<StructuresLevelSelect />} />
            <Route path="/structures/level/:levelId" element={<StructuresPlayLevel />} />
            <Route path="/circuits" element={<CircuitsLevelSelect />} />
            <Route path="/circuits/level/:levelId" element={<CircuitsPlayLevel />} />
            <Route path="/machines" element={<VehiclesLevelSelect />} />
            <Route path="/machines/level/:levelId" element={<VehiclesPlayLevel />} />
            <Route path="/mechatronics" element={<MechatronicsLevelSelect />} />
            <Route path="/mechatronics/level/:levelId" element={<MechatronicsPlayLevel />} />
            {/* Catch-all route to guarantee no blank screens on invalid paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <AchievementBanner />
      </div>
    </HashRouter>
  );
}
