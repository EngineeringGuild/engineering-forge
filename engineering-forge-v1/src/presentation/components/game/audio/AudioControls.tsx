import {
  MousePointer,
  Music,
  Settings,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  AudioService,
  AudioSettings,
} from "../../../../domains/gaming/infrastructure/services/AudioService";
import { AnimatedButton } from "../../ui/AnimatedButton";
import { GlassCard } from "../../ui/GlassCard";

interface AudioControlsProps {
  className?: string;
  compact?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  className = "",
  compact = false,
}) => {
  const [audioService] = useState(() => AudioService.getInstance());
  const [settings, setSettings] = useState<AudioSettings>(
    audioService.getSettings()
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("audio-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        audioService.updateSettings(parsedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.warn("Failed to load audio settings:", error);
      }
    }
  }, [audioService]);

  const updateSettings = useCallback(
    (newSettings: Partial<AudioSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      audioService.updateSettings(updatedSettings);
      setSettings(updatedSettings);

      // Save to localStorage
      localStorage.setItem("audio-settings", JSON.stringify(updatedSettings));
    },
    [audioService, settings]
  );

  const handleMasterVolumeChange = useCallback(
    (volume: number) => {
      updateSettings({ masterVolume: volume / 100 });
    },
    [updateSettings]
  );

  const handleMusicVolumeChange = useCallback(
    (volume: number) => {
      updateSettings({ musicVolume: volume / 100 });
    },
    [updateSettings]
  );

  const handleSfxVolumeChange = useCallback(
    (volume: number) => {
      updateSettings({ sfxVolume: volume / 100 });
    },
    [updateSettings]
  );

  const handleUiVolumeChange = useCallback(
    (volume: number) => {
      updateSettings({ uiVolume: volume / 100 });
    },
    [updateSettings]
  );

  const toggleMute = useCallback(() => {
    updateSettings({ muted: !settings.muted });
  }, [updateSettings, settings.muted]);

  const testSound = useCallback(
    (type: "music" | "sfx" | "ui") => {
      const testTracks = {
        music: "bg-music-main",
        sfx: "sfx-component-place",
        ui: "ui-button-click",
      };

      audioService.playSound(testTracks[type], { volume: 0.5 });
    },
    [audioService]
  );

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          icon={
            settings.muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )
          }
          title={settings.muted ? "Unmute Audio" : "Mute Audio"}
        >
          {settings.muted ? "Unmute" : "Mute"}
        </AnimatedButton>
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          icon={<Settings className="w-4 h-4" />}
          title="Audio Settings"
        >
          Settings
        </AnimatedButton>
      </div>
    );
  }

  return (
    <GlassCard variant="default" className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Volume2 className="w-5 h-5 mr-2" />
          Audio Settings
        </h3>
        <AnimatedButton
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          icon={
            settings.muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )
          }
        >
          {settings.muted ? "Unmute" : "Mute"}
        </AnimatedButton>
      </div>

      <div className="space-y-4">
        {/* Master Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">
              Master Volume
            </label>
            <span className="text-sm text-gray-400">
              {Math.round(settings.masterVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.masterVolume * 100}
            onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
            disabled={settings.muted}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Music Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white flex items-center">
              <Music className="w-4 h-4 mr-2" />
              Music
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {Math.round(settings.musicVolume * 100)}%
              </span>
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => testSound("music")}
                icon={<Volume2 className="w-3 h-3" />}
                title="Test Music"
              >
                Test
              </AnimatedButton>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume * 100}
            onChange={(e) => handleMusicVolumeChange(Number(e.target.value))}
            disabled={settings.muted}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* SFX Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Sound Effects
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => testSound("sfx")}
                icon={<Volume2 className="w-3 h-3" />}
                title="Test SFX"
              >
                Test
              </AnimatedButton>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.sfxVolume * 100}
            onChange={(e) => handleSfxVolumeChange(Number(e.target.value))}
            disabled={settings.muted}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* UI Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white flex items-center">
              <MousePointer className="w-4 h-4 mr-2" />
              UI Sounds
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {Math.round(settings.uiVolume * 100)}%
              </span>
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => testSound("ui")}
                icon={<Volume2 className="w-3 h-3" />}
                title="Test UI Sound"
              >
                Test
              </AnimatedButton>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.uiVolume * 100}
            onChange={(e) => handleUiVolumeChange(Number(e.target.value))}
            disabled={settings.muted}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Audio Status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Playing Sounds:</span>
          <span className="text-white font-medium">
            {audioService.getPlayingSounds().length}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
