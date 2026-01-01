import React, { useState } from 'react';
import { Music, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';
import { MusicMood } from '../types';

const PLAYLISTS = {
  worship: "PLzSu3c-F4h6wTBD7uE4ZcWJqj_QfH_zJ7", // Hillsong Worship etc. (Example ID)
  instrumental: "PLzSu3c-F4h6x_wJqj_QfH_zJ7", // Piano Worship (Example ID - using a placeholder logic for demo)
  peace: "PLzSu3c-F4h6y_wJqj_QfH_zJ7" // Ambient (Example ID)
};

// Actual working video IDs for demo purposes since playlists can be tricky with embeds sometimes
const VIDEO_IDS = {
  worship: "zY5o9mP22s0", // Hillsong Instrumental
  instrumental: "_p2xiRj4yS8", // Piano instrumental
  peace: "h8Hj-p9Qo8I" // Rain and pads
};

export const MusicPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<MusicMood>('peace');
  const [isPlaying, setIsPlaying] = useState(false);

  // Toggle Minimize/Maximize
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'w-80' : 'w-12'}`}>
      <div className="bg-white border border-neutral-200 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header / Minimized State */}
        <div 
            className="h-12 flex items-center justify-between px-3 bg-neutral-900 text-white cursor-pointer"
            onClick={toggleOpen}
        >
            <div className="flex items-center gap-2">
                {isPlaying ? <Volume2 size={16} className="text-sacred-gold animate-pulse" /> : <Music size={16} />}
                {isOpen && <span className="text-xs font-medium tracking-widest uppercase">Atmósfera</span>}
            </div>
            {isOpen && <Minimize2 size={14} />}
        </div>

        {/* Expanded Content */}
        {isOpen && (
          <div className="p-4 bg-white">
            <div className="flex justify-between mb-4">
               {(['worship', 'instrumental', 'peace'] as MusicMood[]).map((m) => (
                   <button
                    key={m}
                    onClick={() => { setMood(m); setIsPlaying(true); }}
                    className={`text-xs px-2 py-1 rounded border ${mood === m ? 'bg-neutral-900 text-white border-neutral-900' : 'text-neutral-500 border-neutral-200 hover:border-neutral-900'}`}
                   >
                       {m.charAt(0).toUpperCase() + m.slice(1)}
                   </button>
               ))}
            </div>

            {/* YouTube Embed */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                {isPlaying ? (
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${VIDEO_IDS[mood]}?autoplay=1&controls=0&loop=1&playlist=${VIDEO_IDS[mood]}`} 
                        title="Atmosphere Player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                        Selecciona un ambiente
                    </div>
                )}
            </div>
            
            <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="mt-3 w-full py-2 text-xs font-bold tracking-widest text-neutral-400 hover:text-neutral-900 border-t border-neutral-100"
            >
                {isPlaying ? 'DETENER' : 'REANUDAR'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};