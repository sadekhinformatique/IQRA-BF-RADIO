import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppConfig } from '../types';
import Hls from 'hls.js';

interface RadioScreenProps {
  config: AppConfig;
}

const RadioScreen: React.FC<RadioScreenProps> = ({ config }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);
  
  // Clear loading state helper
  const clearLoading = () => {
    setIsLoading(false);
    if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
    }
  };

  // Start loading with timeout safety
  const startLoading = () => {
    setIsLoading(true);
    setError(null);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    // Force stop loading after 10 seconds if stream is stuck
    loadingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setError("Stream connection timed out.");
        setIsPlaying(false);
    }, 10000);
  };

  const handleStreamError = useCallback(() => {
    console.warn("Stream failed.");
    clearLoading();
    setIsPlaying(false);
    setError("Stream unavailable.");
  }, []);

  // Initialize Audio Source (HLS or Standard)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state when url changes
    setIsPlaying(false);
    clearLoading();

    const url = config.streamUrl;
    if (!url) {
        setError("No stream URL configured.");
        return;
    }

    // Clean up previous HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isM3U8 = url.includes('.m3u8') || url.includes('application/vnd.apple.mpegurl');

    // 1. Try HLS.js if supported and it looks like HLS
    if (Hls.isSupported() && isM3U8) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // Ready to play, but don't autoplay unless user clicked play
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
              console.error("HLS Fatal Error", data);
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  hls.startLoad();
              } else {
                  handleStreamError();
              }
            }
        });
        hlsRef.current = hls;
    } 
    // 2. Native HLS (Safari)
    else if (audio.canPlayType('application/vnd.apple.mpegurl') && isM3U8) {
        audio.src = url;
    }
    // 3. Standard Audio (MP3/AAC/Ogg)
    else {
        audio.src = url;
        audio.load();
    }

    return () => {
        clearLoading();
    };
  }, [config.streamUrl, handleStreamError]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      clearLoading();
    } else {
      startLoading();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
            .then(() => {
                setIsPlaying(true);
                clearLoading();
                setError(null);
            })
            .catch(error => {
                console.error("Playback failed:", error);
                handleStreamError();
            });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-8 text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0">
         <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white blur-3xl"></div>
         <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-[color:var(--primary-color)] blur-3xl" style={{ backgroundColor: config.primaryColor }}></div>
      </div>

      <div className="z-10 w-full mt-4">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2">{config.radioName}</h1>
        <div className="h-1 w-20 mx-auto rounded-full" style={{ backgroundColor: config.primaryColor }}></div>
      </div>

      <div className="z-10 flex-1 flex flex-col justify-center items-center w-full my-8">
        {/* Album Art / Logo */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
            <div className={`absolute inset-0 rounded-full border-4 border-opacity-30 border-white ${isPlaying ? 'animate-pulse' : ''}`}></div>
            <div className={`w-full h-full rounded-full overflow-hidden border-8 border-gray-800 shadow-2xl relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <img 
                    src={config.logoUrl} 
                    alt="Radio Logo" 
                    className="w-full h-full object-cover"
                />
            </div>
            {/* Center Axis */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-200 rounded-full z-20 shadow-md"></div>
        </div>

        {/* Stream Info */}
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
                {config.streamTitle}
            </h2>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
               {isPlaying ? (
                 <span className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
                    LIVE
                 </span>
               ) : (
                 <span>PAUSED</span>
               )}
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Controls */}
      <div className="z-10 w-full mb-12">
        <div className="flex items-center justify-center space-x-8">
            
            {/* Play/Pause Button */}
            <button 
                onClick={togglePlayPause}
                className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: config.primaryColor }}
            >
                {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl"></i>
                ) : isPlaying ? (
                    <i className="fa-solid fa-pause text-4xl"></i>
                ) : (
                    <i className="fa-solid fa-play text-4xl pl-2"></i>
                )}
            </button>
        </div>
      </div>

      <audio 
        ref={audioRef}
        onError={() => {
            if (!hlsRef.current) handleStreamError();
        }}
        onPlaying={() => {
            clearLoading();
            setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        preload="none"
      />
    </div>
  );
};

export default RadioScreen;