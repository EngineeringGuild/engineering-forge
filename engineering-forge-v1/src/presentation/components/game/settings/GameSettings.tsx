import { RotateCcw } from "lucide-react";
import React from "react";
import { AnimatedButton } from "../../ui/AnimatedButton";
import { GlassCard } from "../../ui/GlassCard";
import { AudioControls } from "../audio/AudioControls";

interface GameSettingsProps {
  gridSize: number;
  snapToGrid: boolean;
  onGridSizeChange: (size: number) => void;
  onSnapToGridChange: (enabled: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  gridSize,
  snapToGrid,
  onGridSizeChange,
  onSnapToGridChange,
  onReset,
  onClose,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Game Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workspace Settings */}
          <GlassCard variant="subtle" className="p-4">
            <h4 className="text-md font-semibold mb-4 text-white">
              Workspace Settings
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grid Size: {gridSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={gridSize}
                  onChange={(e) => onGridSizeChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="snapToGrid"
                  checked={snapToGrid}
                  onChange={(e) => onSnapToGridChange(e.target.checked)}
                  className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="snapToGrid" className="text-sm text-gray-300">
                  Snap to Grid
                </label>
              </div>

              <div>
                <AnimatedButton
                  variant="danger"
                  size="sm"
                  onClick={onReset}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset Workspace
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>

          {/* Audio Settings */}
          <AudioControls />
        </div>
      </div>
    </div>
  );
};
