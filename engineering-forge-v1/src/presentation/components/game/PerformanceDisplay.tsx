// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/PerformanceDisplay.tsx

import { Fuel, Gauge, Target, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { PerformanceMetrics } from '../../../domains/gaming/domain/value-objects/PerformanceMetrics';
import { GlassCard } from '../ui/GlassCard';

interface PerformanceDisplayProps {
  performance: PerformanceMetrics;
  title?: string;
  showDetails?: boolean;
}

export const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
  performance,
  title = 'Performance Metrics',
  showDetails = true
}) => {
  const getPerformanceColor = (value: number): string => {
    if (value >= 80) {
return 'text-green-400';
}
    if (value >= 60) {
return 'text-yellow-400';
}
    if (value >= 40) {
return 'text-orange-400';
}
    return 'text-red-400';
  };

  const getPerformanceBarColor = (value: number): string => {
    if (value >= 80) {
return 'bg-green-500';
}
    if (value >= 60) {
return 'bg-yellow-500';
}
    if (value >= 40) {
return 'bg-orange-500';
}
    return 'bg-red-500';
  };

  const formatValue = (value: number, unit: string): string => {
    return `${value.toFixed(1)} ${unit}`;
  };

  const PerformanceBar: React.FC<{
    label: string;
    value: number;
    max: number;
    unit: string;
    icon: React.ReactNode;
  }> = ({ label, value, max, unit, icon }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-sm font-medium text-white">
          <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center mr-3">
            {icon}
          </div>
          <span>{label}</span>
        </div>
        <span className={`text-sm font-bold ${getPerformanceColor((value / max) * 100)}`}>
          {formatValue(value, unit)}
        </span>
      </div>
      <div className="relative">
        <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getPerformanceBarColor((value / max) * 100)} shadow-md`}
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white/80 drop-shadow-sm">
            {Math.round((value / max) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <GlassCard variant="colored" className="p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        {title}
      </h3>

      {/* Overall Performance */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">Overall Performance</span>
          <div className="flex items-center space-x-2">
            <span className={`text-3xl font-bold ${getPerformanceColor(performance.overall)}`}>
              {performance.overall.toFixed(1)}%
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="relative">
          <div className="w-full bg-white/10 rounded-full h-4 backdrop-blur-sm">
            <div
              className={`h-4 rounded-full transition-all duration-500 ease-out ${getPerformanceBarColor(performance.overall)} shadow-lg`}
              style={{ width: `${performance.overall}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow-lg">
              {performance.overall >= 90
                ? '🏆 Excellent'
                : performance.overall >= 80
                  ? '⭐ Very Good'
                  : performance.overall >= 70
                    ? '👍 Good'
                    : performance.overall >= 60
                      ? '📊 Average'
                      : '⚠️ Needs Improvement'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-1">
        <PerformanceBar
          label="Acceleration"
          value={performance.acceleration}
          max={15}
          unit="s (0-100 km/h)"
          icon={<Zap className="w-4 h-4" />}
        />

        <PerformanceBar
          label="Top Speed"
          value={performance.topSpeed}
          max={300}
          unit="km/h"
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <PerformanceBar
          label="Handling"
          value={performance.handling}
          max={100}
          unit="rating"
          icon={<Target className="w-4 h-4" />}
        />

        <PerformanceBar
          label="Fuel Efficiency"
          value={performance.fuelEfficiency}
          max={20}
          unit="km/l"
          icon={<Fuel className="w-4 h-4" />}
        />
      </div>

      {/* Detailed Stats */}
      {showDetails && (
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Technical Specifications</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Weight</div>
              <div className="text-white font-medium">{formatValue(performance.weight, 'kg')}</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Power</div>
              <div className="text-white font-medium">{formatValue(performance.power, 'HP')}</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Torque</div>
              <div className="text-white font-medium">{formatValue(performance.torque, 'Nm')}</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-gray-400">Power/Weight</div>
              <div className="text-white font-medium">
                {formatValue(performance.getPowerToWeightRatio(), 'HP/kg')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Rating */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Performance Rating</span>
          <span className={`text-sm font-medium ${getPerformanceColor(performance.overall)}`}>
            {performance.overall >= 90
              ? 'Excellent'
              : performance.overall >= 80
                ? 'Very Good'
                : performance.overall >= 70
                  ? 'Good'
                  : performance.overall >= 60
                    ? 'Average'
                    : performance.overall >= 50
                      ? 'Below Average'
                      : 'Poor'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
