import React, { useState, useEffect } from 'react';

const TestComponent: React.FC = () => {
  const [renderTime, setRenderTime] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setRenderTime(new Date().toLocaleTimeString());
    setIsLoaded(true);
    console.log('🎮 TestComponent rendered successfully');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
      <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-2xl mx-4">
        <div className="mb-6">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎮 Engineering Forge V1.0
          </h1>
          <p className="text-xl text-gray-300 mb-2">Test Component - React is working perfectly!</p>
          <p className="text-sm text-gray-400">Advanced setup with enhanced styling</p>
        </div>
        
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
          <p className="text-white font-medium text-lg">
            ✅ If you can see this, the basic setup is working correctly!
          </p>
          <p className="text-blue-100 text-sm mt-2">
            All systems operational - Ready for game development
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
            <div className="text-green-400 font-semibold">React</div>
            <div className="text-green-300 text-sm">✅ Loaded</div>
          </div>
          <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="text-blue-400 font-semibold">TypeScript</div>
            <div className="text-blue-300 text-sm">✅ Working</div>
          </div>
          <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <div className="text-purple-400 font-semibold">Tailwind</div>
            <div className="text-purple-300 text-sm">✅ Styled</div>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 space-y-1">
          <p>🕐 Debug: Component rendered at {renderTime}</p>
          <p>🚀 Status: {isLoaded ? 'Fully Loaded' : 'Loading...'}</p>
          <p>🎯 Environment: Development Mode</p>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;