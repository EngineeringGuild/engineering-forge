import React from 'react';

interface TabNavigationProps {
  activeTab: 'build' | 'test' | 'performance' | 'achievements';
  onTabSwitch: (tab: 'build' | 'test' | 'performance' | 'achievements') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabSwitch }) => {
  const tabs = [
    { id: 'build', label: 'Build', icon: '🔨' },
    { id: 'test', label: 'Test', icon: '🧪' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ] as const;

  return (
    <div className="flex space-x-1 mb-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabSwitch(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};
