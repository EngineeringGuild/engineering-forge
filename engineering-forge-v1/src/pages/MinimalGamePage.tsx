import React, { useState } from 'react';

const MinimalGamePage: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Engineering Forge</h1>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-4">Minimal Game Page</h2>
          <p className="text-gray-300 mb-6">
            This is a minimal version to test if React is working.
          </p>
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Count: {count}
          </button>
          <div className="mt-4 text-sm text-gray-400">
            If you can see this and the button works, React is functioning correctly.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalGamePage;
