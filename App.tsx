import React, { useState, useEffect } from 'react';
import RadioScreen from './components/RadioScreen';
import PrayerScreen from './components/PrayerScreen';
import AdminPanel from './components/AdminPanel';
import { getConfig } from './services/configService';
import { AppConfig } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radio' | 'prayer'>('radio');
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Check URL hash for admin routing
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(window.location.hash === '#admin');
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Re-read config on mount
  useEffect(() => {
    setConfig(getConfig());
  }, []);

  const handleConfigUpdate = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  // If in Admin Route, render Admin Panel completely separate from Mobile Layout
  if (isAdminRoute) {
      return (
        <AdminPanel 
            currentConfig={config} 
            onUpdate={handleConfigUpdate} 
        />
      );
  }

  // Normal Mobile App Layout
  return (
    <div className="w-full h-full max-w-md mx-auto bg-gray-900 shadow-2xl relative overflow-hidden flex flex-col font-sans">
      
      {/* Mobile App Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'radio' ? (
            <RadioScreen config={config} />
        ) : (
            <PrayerScreen config={config} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-800 border-t border-gray-700 h-20 flex items-center justify-around z-20">
        <button 
            onClick={() => setActiveTab('radio')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'radio' ? 'text-white' : 'text-gray-500'}`}
        >
            <i className="fa-solid fa-radio text-xl"></i>
            <span className="text-xs font-medium">Radio</span>
        </button>

        {/* Fake FAB curve effect (optional aesthetics) */}
        <div className="w-px h-8 bg-gray-700"></div>

        <button 
            onClick={() => setActiveTab('prayer')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'prayer' ? 'text-white' : 'text-gray-500'}`}
        >
            <i className="fa-solid fa-kaaba text-xl"></i>
            <span className="text-xs font-medium">Prayer</span>
        </button>
      </div>
    </div>
  );
};

export default App;