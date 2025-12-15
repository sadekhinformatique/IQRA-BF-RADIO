import React, { useState, useEffect } from 'react';
import { AppConfig, Stream } from '../types';
import { saveConfig, resetConfig } from '../services/configService';

interface AdminPanelProps {
  currentConfig: AppConfig;
  onUpdate: (config: AppConfig) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentConfig, onUpdate, onClose }) => {
  const [config, setConfig] = useState<AppConfig>(currentConfig);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

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

  const handleStreamChange = (index: number, field: keyof Stream, value: any) => {
    const newStreams = [...config.streams];
    newStreams[index] = { ...newStreams[index], [field]: value };
    setConfig({ ...config, streams: newStreams });
  };

  const addStream = () => {
    if (config.streams.length >= 3) return;
    const newStream: Stream = {
        id: Date.now().toString(),
        title: "New Stream",
        url: "",
        active: false
    };
    setConfig({ ...config, streams: [...config.streams, newStream] });
  };

  const removeStream = (index: number) => {
    const newStreams = config.streams.filter((_, i) => i !== index);
    setConfig({ ...config, streams: newStreams });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto p-4 md:p-10">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-gray-700 border-b border-gray-600">
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
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

            {/* Streams */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Stream Links (Max 3)</h3>
                    {config.streams.length < 3 && (
                        <button 
                            onClick={addStream}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                        >
                            + Add Stream
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {config.streams.map((stream, index) => (
                        <div key={stream.id} className="bg-gray-900 p-4 rounded border border-gray-700 relative">
                            <button 
                                onClick={() => removeStream(index)}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                <div>
                                    <label className="text-xs text-gray-500">Title</label>
                                    <input 
                                        type="text" 
                                        value={stream.title}
                                        onChange={(e) => handleStreamChange(index, 'title', e.target.value)}
                                        className="w-full bg-gray-800 border-none rounded p-1 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">URL</label>
                                    <input 
                                        type="text" 
                                        value={stream.url}
                                        onChange={(e) => handleStreamChange(index, 'url', e.target.value)}
                                        className="w-full bg-gray-800 border-none rounded p-1 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={stream.active}
                                    onChange={(e) => handleStreamChange(index, 'active', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className={`text-sm ${stream.active ? 'text-green-400' : 'text-gray-500'}`}>
                                    {stream.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {config.streams.length === 0 && (
                        <p className="text-gray-500 italic text-sm">No streams configured.</p>
                    )}
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