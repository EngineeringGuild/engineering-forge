// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/ConstructionWorkspace.tsx

import React, { useCallback, useRef, useState } from 'react';
import { Component } from '../../../domains/gaming/domain/entities/Component';
import { Position, PositionVO } from '../../../domains/gaming/domain/value-objects/Position';
import { useGameSounds } from '../../../hooks/useAudio';
import { GlassCard } from '../ui/GlassCard';

interface ConstructionWorkspaceProps {
  components: Component[];
  onComponentMove: (componentId: string, position: Position) => void;
  onComponentSelect: (componentId: string | null) => void;
  selectedComponentId?: string;
  gridSize?: number;
  snapToGrid?: boolean;
}

export const ConstructionWorkspace: React.FC<ConstructionWorkspaceProps> = ({
  components,
  onComponentMove,
  onComponentSelect,
  selectedComponentId,
  gridSize = 20,
  snapToGrid = true
}) => {
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>(new PositionVO(0, 0));
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { playComponentSelect, playComponentPlace } = useGameSounds();

  const snapToGridPosition = useCallback(
    (position: Position): Position => {
      if (!snapToGrid) return position;

      const snappedX = Math.round(position.x / gridSize) * gridSize;
      const snappedY = Math.round(position.y / gridSize) * gridSize;

      return new PositionVO(snappedX, snappedY);
    },
    [gridSize, snapToGrid]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, component: Component) => {
      event.preventDefault();
      event.stopPropagation();

      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const offset = new PositionVO(mouseX - component.position.x, mouseY - component.position.y);

      setDragOffset(offset);
      setDraggedComponent(component);
      onComponentSelect(component.id);
      playComponentSelect();
    },
    [onComponentSelect]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!draggedComponent || !workspaceRef.current) return;

      const rect = workspaceRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const newPosition = new PositionVO(mouseX - dragOffset.x, mouseY - dragOffset.y);

      const snappedPosition = snapToGridPosition(newPosition);
      onComponentMove(draggedComponent.id, snappedPosition);
    },
    [draggedComponent, dragOffset, onComponentMove, snapToGridPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (draggedComponent) {
      playComponentPlace();
    }
    setDraggedComponent(null);
    setDragOffset(new PositionVO(0, 0));
  }, [draggedComponent, playComponentPlace]);

  const handleWorkspaceClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === workspaceRef.current) {
        onComponentSelect(null);
      }
    },
    [onComponentSelect]
  );

  return (
    <div
      ref={workspaceRef}
      className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-600 overflow-hidden rounded-xl"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleWorkspaceClick}
      style={{
        backgroundImage: snapToGrid
          ? `radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`
          : 'none',
        backgroundSize: `${gridSize}px ${gridSize}px`
      }}
    >
      {/* Enhanced grid overlay with glow effect */}
      {snapToGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(59, 130, 246, 0.4) 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`
          }}
        />
      )}

      {/* Component drop zones indicator */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-xs text-blue-400/60 font-medium">Drop Zone</div>
        <div className="absolute bottom-4 right-4 text-xs text-blue-400/60 font-medium">
          {components.length} components
        </div>
      </div>

      {components.map((component, index) => (
        <div
          key={component.id}
          className={`absolute cursor-move select-none transition-all duration-300 ease-out ${
            selectedComponentId === component.id
              ? 'ring-2 ring-blue-400 ring-opacity-60 shadow-lg shadow-blue-500/30 scale-105 z-10'
              : 'hover:ring-2 hover:ring-gray-400 hover:ring-opacity-50 hover:shadow-lg hover:shadow-gray-500/20 hover:scale-102 z-0'
          }`}
          style={{
            left: component.position.x,
            top: component.position.y,
            width: component.size.width,
            height: component.size.height,
            transform: `rotate(${component.rotation}deg)`,
            animationDelay: `${index * 100}ms`
          }}
          onMouseDown={e => handleMouseDown(e, component)}
        >
          <GlassCard
            variant="colored"
            hover={false}
            glow={selectedComponentId === component.id}
            className="w-full h-full p-2"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-2xl mb-1 drop-shadow-lg">{component.icon}</div>
              <div className="text-xs text-center text-white font-medium drop-shadow-sm">
                {component.name}
              </div>
              <div className="text-xs text-blue-200/80">{component.type}</div>

              {/* Component stats overlay */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white/20 animate-pulse" />
            </div>
          </GlassCard>
        </div>
      ))}

      {/* Connection lines between components */}
      {components.length > 1 && (
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {components.map((component, index) => {
            if (index === 0) return null;
            const prevComponent = components[index - 1];
            const startX = prevComponent.position.x + prevComponent.size.width / 2;
            const startY = prevComponent.position.y + prevComponent.size.height / 2;
            const endX = component.position.x + component.size.width / 2;
            const endY = component.position.y + component.size.height / 2;

            return (
              <line
                key={`connection-${index}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            );
          })}
        </svg>
      )}

      {/* Empty state with enhanced styling */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <GlassCard variant="subtle" className="p-8 text-center">
            <div className="text-6xl mb-4 opacity-50">🚗</div>
            <h3 className="text-xl font-semibold text-white mb-2">Empty Workspace</h3>
            <p className="text-gray-400">Drag components from the palette to start building</p>
            <div className="mt-4 text-sm text-blue-400">
              💡 Tip: Use the grid to align components perfectly
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
