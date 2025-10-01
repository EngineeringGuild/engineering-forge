/**
 * Auto Save Indicator Component - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/SaveLoad/AutoSaveIndicator.tsx
 *
 * Visual indicator for auto-save status and operations
 */

import { AlertCircle, CheckCircle, Clock, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AutoSaveIndicatorProps {
  isEnabled: boolean;
  lastSaved?: Date;
  isSaving?: boolean;
  hasError?: boolean;
  nextAutoSave?: Date;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isEnabled,
  lastSaved,
  isSaving = false,
  hasError = false,
  nextAutoSave,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeUntilNextSave, setTimeUntilNextSave] = useState<string>('');

  useEffect(() => {
    if (!nextAutoSave || !isEnabled) {
return;
}

    const updateTimer = () => {
      const now = new Date();
      const diff = nextAutoSave.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilNextSave('Saving...');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes > 0) {
        setTimeUntilNextSave(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilNextSave(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextAutoSave, isEnabled]);

  const getStatusIcon = () => {
    if (isSaving) {
return <Clock className="w-4 h-4 animate-spin" />;
}
    if (hasError) {
return <AlertCircle className="w-4 h-4" />;
}
    if (lastSaved) {
return <CheckCircle className="w-4 h-4" />;
}
    return <Save className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (isSaving) {
return 'text-blue-400';
}
    if (hasError) {
return 'text-red-400';
}
    if (lastSaved) {
return 'text-green-400';
}
    return 'text-gray-400';
  };

  const getTooltipContent = () => {
    if (!isEnabled) {
      return 'Auto-save is disabled';
    }

    if (isSaving) {
      return 'Saving game...';
    }

    if (hasError) {
      return 'Auto-save failed. Click to retry.';
    }

    if (lastSaved) {
      const lastSavedTime = lastSaved.toLocaleTimeString();
      return `Last saved: ${lastSavedTime}${timeUntilNextSave ? `\nNext save in: ${timeUntilNextSave}` : ''}`;
    }

    return 'Auto-save enabled';
  };

  if (!isEnabled) {
return null;
}

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center space-x-1 cursor-pointer ${getStatusColor()}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium">Auto-save</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-pre-line z-50">
          {getTooltipContent()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
