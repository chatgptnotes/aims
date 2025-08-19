import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      background: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: '#333', fontSize: '2rem', marginBottom: '20px' }}>
        🎉 NeuroSense360 Test Page
      </h1>
      <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '30px' }}>
        If you can see this page, the React app is working correctly!
      </p>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: '15px' }}>✅ System Status</h2>
        <ul style={{ textAlign: 'left', color: '#333', lineHeight: '1.8' }}>
          <li>✅ React is loading</li>
          <li>✅ Components are rendering</li>
          <li>✅ Styling is working</li>
          <li>✅ Development server is active</li>
        </ul>
        <div style={{ marginTop: '20px', padding: '15px', background: '#e0f2fe', borderRadius: '8px' }}>
          <strong style={{ color: '#0277bd' }}>Next Steps:</strong>
          <br />
          <small style={{ color: '#0277bd' }}>
            Try accessing: <code>/login</code> or <code>/admin</code>
          </small>
        </div>
      </div>
    </div>
  );
};

export default TestPage;