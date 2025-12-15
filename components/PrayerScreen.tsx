import React, { useState, useEffect } from 'react';
import { AppConfig, PrayerData, LocationData } from '../types';
import { fetchPrayerTimes, fetchLocationName } from '../services/prayerService';

interface PrayerScreenProps {
  config: AppConfig;
}

const PrayerScreen: React.FC<PrayerScreenProps> = ({ config }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [locationName, setLocationName] = useState<{city: string, country: string} | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const success = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const [pData, locName] = await Promise.all([
            fetchPrayerTimes(latitude, longitude),
            fetchLocationName(latitude, longitude)
        ]);
        
        if (pData) {
            setPrayerData(pData);
        } else {
            setError("Failed to load prayer times.");
        }
        setLocationName(locName);
      } catch (err) {
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    const fail = () => {
      setError("Unable to retrieve your location. Please enable location services.");
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, fail);
  }, []);

  const prayersToShow = [
    { key: 'Fajr', label: 'Fajr', icon: 'fa-cloud-sun' },
    { key: 'Dhuhr', label: 'Dhuhr', icon: 'fa-sun' },
    { key: 'Asr', label: 'Asr', icon: 'fa-cloud-sun-rain' },
    { key: 'Maghrib', label: 'Maghrib', icon: 'fa-moon' },
    { key: 'Isha', label: 'Isha', icon: 'fa-star' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white relative overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-8 rounded-b-3xl shadow-lg relative overflow-hidden" style={{ backgroundColor: config.primaryColor }}>
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <i className="fa-solid fa-mosque text-6xl"></i>
            </div>
            
            <h2 className="text-xl font-bold opacity-90">Prayer Times</h2>
            
            <div className="mt-4">
                {loading ? (
                    <div className="h-6 w-32 bg-white/20 animate-pulse rounded"></div>
                ) : (
                    <div className="flex items-center space-x-2 text-lg">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>
                            {locationName ? `${locationName.city}, ${locationName.country}` : "Unknown Location"}
                        </span>
                    </div>
                )}
                <div className="mt-1 text-sm opacity-80">
                    {prayerData?.date.readable}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
            {loading && (
                <div className="flex flex-col items-center justify-center h-40">
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl" style={{ color: config.primaryColor }}></i>
                    <p className="mt-4 text-gray-400">Locating you...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-center">
                    <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl mb-2"></i>
                    <p className="text-red-200">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 rounded text-white text-sm"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && prayerData && (
                <div className="space-y-3">
                    {prayersToShow.map((prayer) => (
                        <div 
                            key={prayer.key}
                            className="bg-gray-800 rounded-xl p-4 flex items-center justify-between border-l-4 transform transition-all hover:scale-[1.02]"
                            style={{ borderColor: config.primaryColor }}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                                    <i className={`fa-solid ${prayer.icon}`}></i>
                                </div>
                                <span className="font-semibold text-lg">{prayer.label}</span>
                            </div>
                            <span className="text-xl font-bold font-mono tracking-wider">
                                {prayerData.timings[prayer.key]}
                            </span>
                        </div>
                    ))}
                    
                    <div className="mt-6 p-4 rounded-lg bg-gray-800/50 text-center text-xs text-gray-500">
                         Calculation Method: ISNA / Muslim World League <br/>
                         Auto-detected based on {prayerData.meta.timezone}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PrayerScreen;