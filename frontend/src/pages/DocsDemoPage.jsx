// src/pages/DocsDemoPage.jsx
import React, { useState } from 'react';
import CodeEditorPanel from '../components/Panels/CodeEditorPanel';
import LivePreviewPanel from '../components/Panels/LivePreviewPanel';

const DocsDemoPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handlePreview = (url) => {
    setPreviewUrl(url);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Mobile/Tablet: Live Preview First */}
      <div className="lg:hidden order-1">
        {previewUrl ? (
          <iframe 
            src={previewUrl}
            title="Fayda Widget Preview"
            className="w-full h-96 border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <LivePreviewPanel 
            apiKey={apiKey} 
            loginUrl={loginUrl} 
            onPreview={handlePreview} 
          />
        )}
      </div>

      {/* Mobile/Tablet: Code Editor Second */}
      <div className="lg:hidden order-2 border-t">
        <CodeEditorPanel
          apiKey={apiKey}
          setApiKey={setApiKey}
          loginUrl={loginUrl}
          setLoginUrl={setLoginUrl}
        />
      </div>

      {/* Desktop: Left Pane - Code & Config */}
      <div className="hidden lg:block lg:w-1/2 border-r overflow-auto">
        <CodeEditorPanel
          apiKey={apiKey}
          setApiKey={setApiKey}
          loginUrl={loginUrl}
          setLoginUrl={setLoginUrl}
        />
      </div>

      {/* Desktop: Right Pane - Live Widget Preview */}
      <div className="hidden lg:block lg:w-1/2">
        {previewUrl ? (
          <iframe 
            src={previewUrl}
            title="Fayda Widget Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <LivePreviewPanel 
            apiKey={apiKey} 
            loginUrl={loginUrl} 
            onPreview={handlePreview} 
          />
        )}
      </div>
    </div>
  );
};

export default DocsDemoPage;