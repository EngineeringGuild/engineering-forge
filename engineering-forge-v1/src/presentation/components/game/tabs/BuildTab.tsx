import { Pause, Play, Zap } from 'lucide-react';
import React from 'react';
import { getUnlockedComponents } from '../../../../data/components';
import { GameActions } from '../../../../domains/gaming/application/services/GameActions';
import { GameState } from '../../../../domains/gaming/domain/entities/GameState';
import { ComponentPalette } from '../ComponentPalette';
import { ConstructionWorkspace } from '../ConstructionWorkspace';

interface BuildTabProps {
  gameState: GameState;
  gameActions: GameActions;
}

export const BuildTab: React.FC<BuildTabProps> = ({ gameState, gameActions }) => {
  const availableComponents = getUnlockedComponents(gameState.level);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
      {/* Component Palette */}
      <div className="lg:col-span-1">
        <ComponentPalette
          components={availableComponents}
          onComponentSelect={component => {
            console.log('Component selected:', component.name);
            gameActions.addComponent(component);
          }}
          selectedCategory="mechanical"
          onCategoryChange={() => {}}
          userLevel={gameState.level}
        />
      </div>

      {/* Construction Workspace */}
      <div className="lg:col-span-3">
        <div className="h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-400" />
                Construction Workspace
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  {gameState.workspaceComponents.length} components
                </div>
                <button
                  onClick={() => gameActions.togglePlayPause()}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {gameState.isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="h-[calc(100%-80px)] p-4">
            <ConstructionWorkspace
              components={gameState.workspaceComponents}
              onComponentMove={(componentId, position) =>
                gameActions.moveComponent(componentId, position)
              }
              onComponentSelect={componentId => gameActions.selectComponent(componentId)}
              selectedComponentId={gameState.selectedComponentId || undefined}
              gridSize={gameState.gridSize}
              snapToGrid={gameState.snapToGrid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
