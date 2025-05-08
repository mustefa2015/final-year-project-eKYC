// src/components/LivePreviewPanel.jsx
import React, { useState, useEffect } from 'react';

const LivePreviewPanel = ({ apiKey, loginUrl, onPreview }) => {
  //console.log('API Key:', apiKey);
  //console.log('Login URL:', loginUrl);
  const myfaydaLogo = 'https://res.cloudinary.com/dnsnj1z1g/image/upload/v1746488307/fav2_fkepqh.png';
  const developerLogo = 'https://bit.ly/433sY7x';
  const previewUrl = `https://myfayda.up.railway.app/userportal?apiKey=${encodeURIComponent(apiKey)}&login_url=${encodeURIComponent(loginUrl)}`;

  const [animatedText, setAnimatedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  const messages = [
    '👋 Welcome Developer!',
    '🚀 Supercharge your signups with MyFayda eKYC',
    '🔒 We handle secure user verification so you don\'t have to',
    '✨ Here\'s how simple integration works:',
    '1️⃣ Get your API key from the dashboard',
    '2️⃣ Copy our one-line button code',
    '3️⃣ Paste into your registration page',
    '4️⃣ Users click "Sign Up with FaydaID"',
    '5️⃣ Get verified user data in your backend',
    '✅ Done! No complex KYC processes to build'
  ];

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing animation
  useEffect(() => {
    if (!isTyping) return;

    let typingTimeout;
    const currentMessage = messages[currentMessageIndex];
    
    if (animatedText.length < currentMessage.length) {
      typingTimeout = setTimeout(() => {
        setAnimatedText(currentMessage.substring(0, animatedText.length + 1));
      }, 40 + Math.random() * 30);
    } else {
      setIsTyping(false);
      setTimeout(() => {
        setAnimatedText('');
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsTyping(true);
      }, 2500);
    }

    return () => clearTimeout(typingTimeout);
  }, [animatedText, currentMessageIndex, isTyping]);

  const handleClick = (e) => {
    e.preventDefault();
    if (apiKey && loginUrl) {
      onPreview(previewUrl);
      //console.log('Preview URL:', previewUrl);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-start min-h-[500px] w-full max-w-3xl mx-auto">
      {/* Animated Description */}
      <div className="mb-6 w-full bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="min-h-[120px] flex items-center justify-center">
          <p className="text-xl font-medium text-gray-800 text-center leading-relaxed">
            {animatedText}
            <span className={`inline-block w-2 h-6 bg-blue-500 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
          </p>
        </div>
      </div>

      {/* Integration Preview Notice */}
      <div className="text-sm text-gray-500 text-center mb-6 px-4 py-2 ">
        This is how the FaydaID button will appear on your registration page
      </div>

      {/* Demo Sign-up Section */}
      <div className="w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {/* App Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex justify-center border-b border-gray-200">
          <img src={developerLogo} alt="Developer App Logo" className="h-12" />
        </div>
        
        {/* Sign-up Form */}
        <div className="p-8">
          <div className="space-y-4">
            <button
              onClick={handleClick}
              disabled={!apiKey || !loginUrl}
              className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-all ${
                apiKey && loginUrl
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-[1.02]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <img
                src={myfaydaLogo}
                alt="Fayda Logo"
                className="h-5 w-5 mr-3"
              />
              Sign Up with FaydaID
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline font-medium">Terms</a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Developer Tip */}
      <div className="mt-6 text-sm text-gray-600 text-center max-w-md">
        Tip: The button will open the FaydaID verification flow when clicked
      </div>
    </div>
  );
};

export default LivePreviewPanel;