import React from 'react';

const DebugPage: React.FC = () => {
  console.log('DebugPage rendering...');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h1>🔍 Debug Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div
        style={{ marginTop: '20px', padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}
      >
        <h3>System Info:</h3>
        <p>User Agent: {navigator.userAgent}</p>
        <p>URL: {window.location.href}</p>
        <p>React Version: {React.version}</p>
      </div>
    </div>
  );
};

export default DebugPage;
