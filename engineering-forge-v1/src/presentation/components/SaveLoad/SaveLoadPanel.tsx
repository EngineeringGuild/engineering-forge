/**
 * Save Load Panel Component - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/SaveLoad/SaveLoadPanel.tsx
 *
 * Comprehensive save/load panel with save slots, import/export, and backup management
 */

import { AlertCircle, Download, HardDrive, Save, Trash2, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { GameSaveData, SaveSlot } from '../../../domains/gaming/entities/GameSave';
import { SaveService } from '../../../domains/gaming/services/SaveService';

interface SaveLoadPanelProps {
  userId: string;
  saveService: SaveService;
  isVisible: boolean;
  onClose: () => void;
  onSave?: (saveData: GameSaveData) => void;
  onLoad?: (saveData: GameSaveData) => void;
}

interface SaveSlotDisplay extends SaveSlot {
  displayName: string;
  playTimeFormatted: string;
  lastPlayedFormatted: string;
  saveSizeFormatted: string;
}

export const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({
  userId,
  saveService,
  isVisible,
  onClose,
  onSave,
  onLoad
}) => {
  const [saveSlots, setSaveSlots] = useState<SaveSlotDisplay[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'manage'>('save');
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  // const [showImportDialog, setShowImportDialog] = useState(false); // TODO: Use in future implementation
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible) {
      loadSaveSlots();
    }
  }, [isVisible, userId, saveService]);

  const loadSaveSlots = async () => {
    try {
      const slots = saveService.getSaveSlots(userId);
      const displaySlots: SaveSlotDisplay[] = slots.map(slot => ({
        ...slot,
        displayName: slot.saveData?.saveName || `Empty Slot ${slot.slotNumber}`,
        playTimeFormatted: formatTime(slot.saveData?.playTime || 0),
        lastPlayedFormatted: slot.saveData ? formatDate(slot.saveData.lastPlayed) : 'Never',
        saveSizeFormatted: formatBytes(slot.saveData?.metadata.saveSize || 0)
      }));
      setSaveSlots(displaySlots);
    } catch (error) {
      showMessage('error', 'Failed to load save slots');
    }
  };

  const handleSave = async () => {
    if (!selectedSlot) {
      showMessage('error', 'Please select a save slot');
      return;
    }

    if (!saveName.trim()) {
      showMessage('error', 'Please enter a save name');
      return;
    }

    setIsLoading(true);
    try {
      // This would typically come from the game state
      const currentGameState: GameSaveData = {
        id: `save_${userId}_${selectedSlot}_${Date.now()}`,
        userId,
        version: '1.0.0',
        saveName: saveName.trim(),
        description: saveDescription.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastPlayed: new Date(),
        playTime: 0, // TODO: Get from game state
        currentLevel: 1, // TODO: Get from game state
        score: 0, // TODO: Get from game state
        credits: 100, // TODO: Get from game state
        workspaceComponents: [], // TODO: Get from game state
        testResults: [], // TODO: Get from game state
        unlockedComponents: [], // TODO: Get from game state
        unlockedAchievements: [], // TODO: Get from game state
        userProgress: {
          userId,
          level: 1,
          experience: 0,
          totalExperience: 0,
          credits: 100,
          playTime: 0,
          projectsCompleted: 0,
          testsCompleted: 0,
          componentsUnlocked: 0,
          achievementsUnlocked: 0,
          highestScore: 0,
          averageScore: 0,
          totalScore: 0,
          sessionsPlayed: 0,
          lastPlayed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        settings: {
          gridSize: 20,
          snapToGrid: true,
          soundEnabled: true,
          musicEnabled: true,
          quality: 'medium'
        },
        metadata: {
          gameVersion: '1.0.0',
          platform: 'web',
          deviceInfo: navigator.userAgent,
          saveSize: 0,
          checksum: ''
        }
      };

      const result = await saveService.saveGame(userId, currentGameState, selectedSlot);

      if (result.success) {
        showMessage('success', result.message);
        setSaveName('');
        setSaveDescription('');
        setSelectedSlot(null);
        await loadSaveSlots();
        onSave?.(result.saveData!);
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to save game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (slotNumber: number) => {
    setIsLoading(true);
    try {
      const result = await saveService.loadGame(userId, slotNumber);

      if (result.success && result.saveData) {
        showMessage('success', result.message);
        onLoad?.(result.saveData);
        onClose();
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slotNumber: number) => {
    if (!confirm('Are you sure you want to delete this save? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveService.deleteSave(userId, slotNumber);

      if (result.success) {
        showMessage('success', result.message);
        await loadSaveSlots();
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (slotNumber: number) => {
    try {
      saveService.exportSave(userId, slotNumber);
      showMessage('success', 'Save exported successfully');
    } catch (error) {
      showMessage('error', 'Failed to export save');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await saveService.importSave(userId, file);

      if (result.success) {
        showMessage('success', result.message);
        await loadSaveSlots();
        // setShowImportDialog(false); // TODO: Use in future implementation
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to import save');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Save & Load Game</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 ${
              message.type === 'success'
                ? 'bg-green-900/20 border-green-500/30'
                : message.type === 'error'
                  ? 'bg-red-900/20 border-red-500/30'
                  : 'bg-blue-900/20 border-blue-500/30'
            } border-l-4`}
          >
            <div className="flex items-center">
              <AlertCircle
                className={`w-5 h-5 mr-2 ${
                  message.type === 'success'
                    ? 'text-green-400'
                    : message.type === 'error'
                      ? 'text-red-400'
                      : 'text-blue-400'
                }`}
              />
              <span className="text-white">{message.text}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex">
            {[
              { id: 'save', label: 'Save Game', icon: Save },
              { id: 'load', label: 'Load Game', icon: Download },
              { id: 'manage', label: 'Manage', icon: HardDrive }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2 inline" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'save' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Save Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Save Game</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Save Name
                    </label>
                    <input
                      type="text"
                      value={saveName}
                      onChange={e => setSaveName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      placeholder="Enter save name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={saveDescription}
                      onChange={e => setSaveDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      placeholder="Enter save description"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isLoading || !selectedSlot || !saveName.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Game'}
                  </button>
                </div>

                {/* Save Slots */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Select Save Slot</h3>
                  <div className="space-y-2">
                    {saveSlots.map(slot => (
                      <div
                        key={slot.slotNumber}
                        onClick={() => setSelectedSlot(slot.slotNumber)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedSlot === slot.slotNumber
                            ? 'border-green-500 bg-green-900/20'
                            : slot.isEmpty
                              ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
                              : 'border-blue-500 bg-blue-900/20 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-white">
                              Slot {slot.slotNumber}: {slot.displayName}
                            </div>
                            {!slot.isEmpty && (
                              <div className="text-sm text-gray-400 mt-1">
                                <div>Play Time: {slot.playTimeFormatted}</div>
                                <div>Last Played: {slot.lastPlayedFormatted}</div>
                                <div>Size: {slot.saveSizeFormatted}</div>
                              </div>
                            )}
                          </div>
                          {selectedSlot === slot.slotNumber && (
                            <div className="text-green-400">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'load' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Load Game</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saveSlots.map(slot => (
                  <div
                    key={slot.slotNumber}
                    className={`p-4 rounded-lg border ${
                      slot.isEmpty
                        ? 'border-gray-600 bg-gray-800'
                        : 'border-blue-500 bg-blue-900/20 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-white">
                          Slot {slot.slotNumber}: {slot.displayName}
                        </div>
                        {!slot.isEmpty && (
                          <div className="text-sm text-gray-400 mt-1">
                            <div>Level: {slot.saveData?.currentLevel}</div>
                            <div>Score: {slot.saveData?.score.toLocaleString()}</div>
                            <div>Play Time: {slot.playTimeFormatted}</div>
                            <div>Last Played: {slot.lastPlayedFormatted}</div>
                          </div>
                        )}
                      </div>
                      {!slot.isEmpty && (
                        <button
                          onClick={() => handleLoad(slot.slotNumber)}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Load
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Save Management</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Import/Export */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-white">Import/Export</h4>

                  <button
                    onClick={() => {
                      /* setShowImportDialog(true) */
                    }} // TODO: Use in future implementation
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Save File
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />

                  <div className="text-sm text-gray-400">
                    Import save files from other devices or backups
                  </div>
                </div>

                {/* Save Slots Management */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-white">Save Slots</h4>

                  <div className="space-y-2">
                    {saveSlots.map(slot => (
                      <div
                        key={slot.slotNumber}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                      >
                        <div>
                          <div className="text-white font-medium">
                            Slot {slot.slotNumber}: {slot.displayName}
                          </div>
                          {!slot.isEmpty && (
                            <div className="text-sm text-gray-400">
                              {slot.saveSizeFormatted} • {slot.lastPlayedFormatted}
                            </div>
                          )}
                        </div>

                        {!slot.isEmpty && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleExport(slot.slotNumber)}
                              className="text-blue-400 hover:text-blue-300 p-1"
                              title="Export Save"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(slot.slotNumber)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete Save"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadPanel;
