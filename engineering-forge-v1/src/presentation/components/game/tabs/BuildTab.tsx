import { Pause, Play, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { getUnlockedComponents } from '../../../../data/components';
import { GameActions } from '../../../../domains/gaming/application/services/GameActions';
import { GameState } from '../../../../domains/gaming/domain/value-objects/GameState';
import { ComponentPalette } from '../ComponentPalette';
import { ConstructionWorkspace } from '../ConstructionWorkspace';

interface BuildTabProps {
  gameState: GameState;
  gameActions: GameActions;
}

export const BuildTab: React.FC<BuildTabProps> = ({ gameState, gameActions }) => {
  const availableComponents = getUnlockedComponents(gameState.level);
  const [selectedCategory, setSelectedCategory] = useState<
    'mechanical' | 'electrical' | 'structural' | 'aerodynamic'
  >('mechanical');

  // Check if car is complete (has chassis, engine, and wheels)
  const hasChassis = gameState.workspaceComponents.some(c => c.type === 'chassis');
  const hasEngine = gameState.workspaceComponents.some(c => c.type === 'engine');
  const hasWheels = gameState.workspaceComponents.some(c => c.type === 'wheels');
  const isCarComplete = hasChassis && hasEngine && hasWheels;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
      {/* Component Palette */}
      <div className="lg:col-span-1">
        <ComponentPalette
          components={availableComponents}
          onComponentSelect={component => {
            console.log('Component selected:', component.name);

            // Check if component type already exists
            const existingComponent = gameState.workspaceComponents.find(
              c => c.type === component.type
            );
            if (existingComponent) {
              alert(
                `You already have a ${component.type} component! Remove it first to add a different one.`
              );
              return;
            }

            gameActions.addComponent(component);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
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

                {/* Car completion indicator */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${hasChassis ? 'bg-green-500' : 'bg-gray-500'}`}
                    title="Chassis"
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${hasEngine ? 'bg-green-500' : 'bg-gray-500'}`}
                    title="Engine"
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${hasWheels ? 'bg-green-500' : 'bg-gray-500'}`}
                    title="Wheels"
                  />
                  {isCarComplete && (
                    <span className="text-green-400 text-sm font-medium">🚗 Complete!</span>
                  )}
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
              onComponentRemove={componentId => gameActions.removeComponent(componentId)}
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
