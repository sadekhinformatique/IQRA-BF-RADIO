import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { saveConfig, resetConfig } from '../services/configService';

interface AdminPanelProps {
  currentConfig: AppConfig;
  onUpdate: (config: AppConfig) => void;
  onClose?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentConfig, onUpdate, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<AppConfig>(currentConfig);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (password === "admin") {
          setIsAuthenticated(true);
      } else {
          alert("Incorrect password");
      }
  };

  const handleSave = () => {
    saveConfig(config);
    onUpdate(config);
    setMessage("Configuration saved successfully!");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReset = () => {
    const defaults = resetConfig();
    setConfig(defaults);
    onUpdate(defaults);
    setMessage("Reset to defaults.");
    setTimeout(() => setMessage(null), 3000);
  };

  if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
                            placeholder="Enter password"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Login
                    </button>
                    <div className="text-center mt-4">
                        <a href="/" className="text-sm text-gray-500 hover:text-gray-300">Back to App</a>
                    </div>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-gray-700 border-b border-gray-600">
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <a href="/" className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-white no-underline">
                Open App
            </a>
        </div>

        <div className="p-6 space-y-6">
            {message && (
                <div className="bg-green-600/20 text-green-400 p-3 rounded border border-green-500">
                    {message}
                </div>
            )}

            {/* General Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Radio Name</label>
                    <input 
                        type="text" 
                        value={config.radioName}
                        onChange={(e) => setConfig({...config, radioName: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Primary Color (Hex)</label>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="color" 
                            value={config.primaryColor}
                            onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                            className="h-10 w-10 bg-transparent border-none cursor-pointer"
                        />
                        <input 
                            type="text" 
                            value={config.primaryColor}
                            onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                            className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none uppercase"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-gray-400 text-sm mb-2">Logo URL</label>
                <div className="flex space-x-4">
                    <input 
                        type="text" 
                        value={config.logoUrl}
                        onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
                        className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                    <img src={config.logoUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* Single Stream Config */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Stream Configuration</h3>
                <div className="bg-gray-900 p-4 rounded border border-gray-700 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Stream Title</label>
                        <input 
                            type="text" 
                            value={config.streamTitle}
                            onChange={(e) => setConfig({...config, streamTitle: e.target.value})}
                            className="w-full bg-gray-800 border-none rounded p-2 text-sm text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Stream URL (MP3, AAC, m3u8)</label>
                        <input 
                            type="text" 
                            value={config.streamUrl}
                            onChange={(e) => setConfig({...config, streamUrl: e.target.value})}
                            className="w-full bg-gray-800 border-none rounded p-2 text-sm text-white"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 bg-gray-700 border-t border-gray-600 flex justify-end space-x-4">
            <button 
                onClick={handleReset}
                className="px-4 py-2 text-red-400 hover:bg-gray-600 rounded transition-colors"
            >
                Reset Defaults
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;