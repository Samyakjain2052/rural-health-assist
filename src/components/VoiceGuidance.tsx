
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceGuidanceProps {
  hindiPrompt: string;
  englishPrompt: string;
  autoPlay?: boolean;
}

const VoiceGuidance: React.FC<VoiceGuidanceProps> = ({ 
  hindiPrompt, 
  englishPrompt, 
  autoPlay = true 
}) => {
  const { language } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // In a real implementation, this would use a proper TTS service
  const playVoicePrompt = () => {
    // For now we're just logging the prompt that would be played
    console.log(`Playing voice prompt: ${language === 'hindi' ? hindiPrompt : englishPrompt}`);
    
    // In a real implementation:
    // 1. Convert text to speech using a service like Google TTS or Eleven Labs
    // 2. Play the returned audio
    
    // Simulate audio playback for demonstration
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
  };

  useEffect(() => {
    if (autoPlay) {
      // Add a small delay to make sure the component is mounted
      const timer = setTimeout(() => {
        playVoicePrompt();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [language]);

  return (
    <div className="voice-guidance">
      {/* This audio element would play the TTS in a real implementation */}
      <audio ref={audioRef} className="hidden">
        <source src="" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <button 
        onClick={playVoicePrompt}
        className="flex items-center justify-center p-3 rounded-full bg-kiosk-blue bg-opacity-10 hover:bg-opacity-20 transition-all"
        aria-label={language === 'hindi' ? "आवाज़ सुनें" : "Listen to voice prompt"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </button>
    </div>
  );
};

export default VoiceGuidance;
