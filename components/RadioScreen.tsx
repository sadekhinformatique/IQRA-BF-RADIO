import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppConfig, Stream } from '../types';
import Hls from 'hls.js';

interface RadioScreenProps {
  config: AppConfig;
}

const RadioScreen: React.FC<RadioScreenProps> = ({ config }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const activeStreams = config.streams.filter(s => s.active);
  const currentStream = activeStreams[currentStreamIndex];
  
  // Track if playback is intended (for autoplay on stream switch)
  const shouldPlayRef = useRef(false);

  useEffect(() => {
    if (activeStreams.length === 0) {
      setError("No active streams available.");
    } else {
      setError(null);
    }
  }, [activeStreams]);

  // Error handling / Stream switching logic
  const handleStreamError = useCallback(() => {
    console.warn(`Stream ${currentStream?.title} failed. Trying next...`);
    
    if (activeStreams.length > 1) {
       const nextIndex = (currentStreamIndex + 1) % activeStreams.length;
       // Prevent infinite loop if all streams fail instantly
       if (nextIndex !== currentStreamIndex) {
         setCurrentStreamIndex(nextIndex);
         shouldPlayRef.current = true; // Try to autoplay next
       }
    } else {
      setError("Stream unavailable. Please try again later.");
      setIsPlaying(false);
      setIsLoading(false);
      shouldPlayRef.current = false;
    }
  }, [activeStreams, currentStream, currentStreamIndex]);

  // Initialize Audio Source (HLS or Standard)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStream) return;

    const url = currentStream.url;
    setIsLoading(true);

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
            setIsLoading(false);
            if (shouldPlayRef.current) {
                audio.play()
                .then(() => setIsPlaying(true))
                .catch(e => {
                    console.error("Autoplay failed", e);
                    setIsPlaying(false);
                });
            }
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
              console.error("HLS Fatal Error", data);
              // Try to recover or fail
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
        audio.addEventListener('loadedmetadata', () => {
             setIsLoading(false);
             if (shouldPlayRef.current) {
                audio.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error("Autoplay failed", e));
             }
        }, { once: true });
    }
    // 3. Standard Audio (MP3/AAC/Ogg)
    else {
        audio.src = url;
        audio.load();
        // Native audio doesn't always fire 'canplay' for streams reliably until buffering
        // We set a timeout or wait for events
        const onCanPlay = () => {
             setIsLoading(false);
             if (shouldPlayRef.current) {
                audio.play()
                .then(() => setIsPlaying(true))
                .catch(e => {
                    // console.error("Autoplay failed", e)
                    setIsPlaying(false);
                });
             }
        };
        audio.addEventListener('canplay', onCanPlay, { once: true });
    }

  }, [currentStream, handleStreamError]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      shouldPlayRef.current = false;
    } else {
      setIsLoading(true);
      shouldPlayRef.current = true;
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setError(null);
        })
        .catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
          setIsLoading(false);
          handleStreamError();
        });
    }
  };

  const handleNext = () => {
    if (activeStreams.length > 0) {
        setIsPlaying(false);
        shouldPlayRef.current = true; // Intent to play next
        setCurrentStreamIndex((prev) => (prev + 1) % activeStreams.length);
    }
  };

  const handlePrev = () => {
    if (activeStreams.length > 0) {
        setIsPlaying(false);
        shouldPlayRef.current = true; // Intent to play prev
        setCurrentStreamIndex((prev) => (prev - 1 + activeStreams.length) % activeStreams.length);
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
                {currentStream ? currentStream.title : "No Stream Selected"}
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
            <button 
                onClick={handlePrev}
                className="p-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                disabled={activeStreams.length <= 1}
            >
                <i className="fa-solid fa-backward-step text-2xl"></i>
            </button>

            <button 
                onClick={togglePlayPause}
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: config.primaryColor }}
            >
                {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
                ) : isPlaying ? (
                    <i className="fa-solid fa-pause text-3xl"></i>
                ) : (
                    <i className="fa-solid fa-play text-3xl pl-1"></i>
                )}
            </button>

            <button 
                onClick={handleNext}
                className="p-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                disabled={activeStreams.length <= 1}
            >
                <i className="fa-solid fa-forward-step text-2xl"></i>
            </button>
        </div>
      </div>

      <audio 
        ref={audioRef}
        onError={(e) => {
            // Only handle error if HLS didn't already handle it
            if (!hlsRef.current) {
                handleStreamError();
            }
        }}
        preload="none"
      />
    </div>
  );
};

export default RadioScreen;