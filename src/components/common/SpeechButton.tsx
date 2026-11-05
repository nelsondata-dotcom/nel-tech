import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

interface SpeechButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function SpeechButton({ text, className, size = 'md' }: SpeechButtonProps) {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (audio) {
      audio.play();
      setIsPlaying(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const audioObj = new Audio(`data:audio/wav;base64,${data.audio}`);
      audioObj.onended = () => setIsPlaying(false);
      setAudio(audioObj);
      audioObj.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("TTS failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          disabled={loading}
          className={cn(
            "p-2 rounded-lg transition-all flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]",
            language === 'ak' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          )}
          title={language === 'ak' ? "Tie wɔ Twi mu" : "Listen in English"}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          ) : (
            <Volume2 className={cn(size === 'sm' ? "w-3 h-3" : "w-4 h-4")} />
          )}
          {language === 'ak' ? 'Tie' : 'Listen'}
        </button>
      ) : (
        <>
          <button
            onClick={handlePause}
            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-all"
          >
            <Pause className={cn(size === 'sm' ? "w-3 h-3" : "w-4 h-4")} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
          >
            <RotateCcw className={cn(size === 'sm' ? "w-3 h-3" : "w-4 h-4")} />
          </button>
        </>
      )}
    </div>
  );
}
