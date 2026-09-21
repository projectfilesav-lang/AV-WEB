import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Activity } from 'lucide-react';

interface GoldAudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
  showWaveform?: boolean;
}

// 64-bar static mastering waveform modeling dynamic range and transient peaks
const STATIC_WAVEFORM_PROFILE = [
  22, 28, 36, 44, 58, 66, 52, 74, 82, 68,
  88, 94, 80, 62, 48, 70, 84, 98, 92, 78,
  58, 64, 82, 88, 94, 72, 54, 46, 68, 84,
  100, 90, 72, 58, 76, 92, 86, 64, 50, 68,
  82, 74, 90, 96, 70, 54, 42, 60, 74, 88,
  80, 64, 48, 40, 56, 68, 52, 38, 30, 24,
  18, 28, 22, 16
];

export const GoldAudioPlayer: React.FC<GoldAudioPlayerProps> = ({
  src,
  title,
  className = '',
  showWaveform = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);

  const [isDraggingWaveform, setIsDraggingWaveform] = useState(false);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const effectiveSrc =
    src && !src.includes('actions.google.com') && !src.endsWith('.ogg')
      ? src
      : '/audio/master-reference.mp3';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTime(0);

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      // Gracefully recover to local master audio
      if (audio.src && !audio.src.includes('/audio/master-reference.mp3')) {
        audio.src = '/audio/master-reference.mp3';
        audio.load();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.error) {
        audio.src = '/audio/master-reference.mp3';
        audio.load();
      }
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Audio playback notice:', err);
      });
    }
  };

  const seekToPosition = useCallback(
    (clientX: number) => {
      if (!waveformRef.current || !audioRef.current || !duration) return;
      const rect = waveformRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = rect.width > 0 ? offsetX / rect.width : 0;
      const targetTime = Math.max(0, Math.min(percent * duration, duration));
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [duration]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingWaveform(true);
    seekToPosition(e.clientX);
  };

  useEffect(() => {
    if (!isDraggingWaveform) return;

    const onMouseMove = (e: MouseEvent) => {
      seekToPosition(e.clientX);
    };
    const onMouseUp = () => {
      setIsDraggingWaveform(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingWaveform, seekToPosition]);

  const handleWaveformHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !duration) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = rect.width > 0 ? (offsetX / rect.width) * 100 : 0;
    setHoverPercent(percent);
    setHoverTime((percent / 100) * duration);
  };

  const handleWaveformLeave = () => {
    if (!isDraggingWaveform) {
      setHoverPercent(null);
      setHoverTime(null);
    }
  };

  const handleSeekRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVol = parseFloat(e.target.value);
    audio.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '0:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const progressPercent = Math.min(100, Math.max(0, progressRatio * 100));

  return (
    <div
      className={`w-full bg-[#101926] border border-[var(--border-color)] p-4 sm:p-5 rounded-sm shadow-sm flex flex-col gap-3.5 ${className}`}
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onError={(e) => {
          const target = e.currentTarget;
          if (target && !target.src.includes('/audio/master-reference.mp3')) {
            target.src = '/audio/master-reference.mp3';
            target.load();
          }
        }}
      >
        <source src={effectiveSrc} type="audio/mpeg" />
        <source src="/audio/master-reference.mp3" type="audio/mpeg" />
      </audio>

      {/* Header bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-gold)] font-semibold tracking-wider uppercase truncate max-w-[220px] sm:max-w-md text-xs">
          {title || 'Audio Recording'}
        </span>
        <span className="text-[11px] font-mono text-white/70">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Waveform View (Lightbox & Detailed Display) */}
      {showWaveform ? (
        <div className="flex flex-col gap-2.5 my-1">
          <div
            ref={waveformRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleWaveformHover}
            onMouseLeave={handleWaveformLeave}
            className="relative w-full h-24 sm:h-28 bg-[#090e17] rounded-sm border border-[var(--border-color)]/70 px-3 py-2 flex items-center cursor-pointer select-none group overflow-hidden"
            role="slider"
            tabIndex={0}
            aria-label="Interactive audio waveform timeline"
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            aria-valuenow={currentTime}
            onKeyDown={(e) => {
              if (!audioRef.current || !duration) return;
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = Math.min(duration, currentTime + 5);
                audioRef.current.currentTime = next;
                setCurrentTime(next);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = Math.max(0, currentTime - 5);
                audioRef.current.currentTime = prev;
                setCurrentTime(prev);
              } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                togglePlay();
              }
            }}
          >
            {/* Center zero-crossing baseline */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.07] pointer-events-none" />

            {/* Static Waveform Bars with dynamic progress illumination */}
            <div className="w-full h-full flex items-center justify-between gap-[2px] sm:gap-[3px] z-0">
              {STATIC_WAVEFORM_PROFILE.map((barHeight, idx) => {
                const barRatio = idx / (STATIC_WAVEFORM_PROFILE.length - 1);
                const isPlayed = barRatio <= progressRatio;
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-xs transition-colors duration-75 select-none pointer-events-none"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: isPlayed
                        ? 'var(--color-gold)'
                        : 'rgba(255, 255, 255, 0.16)',
                      boxShadow: isPlayed
                        ? '0 0 6px rgba(212, 175, 55, 0.3)'
                        : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Playhead Hairline - Pure architectural line without AI-vibe dots */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[var(--color-gold)] pointer-events-none transition-[left] duration-75 shadow-[0_0_8px_rgba(212,175,55,0.8)] z-10"
              style={{ left: `${progressPercent}%` }}
            />

            {/* Hover Scrub Preview Guideline & Timestamp Tooltip */}
            {hoverPercent !== null && (
              <>
                <div
                  className="absolute top-0 bottom-0 w-[1px] bg-white/30 pointer-events-none z-10"
                  style={{ left: `${hoverPercent}%` }}
                />
                {hoverTime !== null && (
                  <div
                    className="absolute -top-7 px-2 py-0.5 bg-[#090e17] text-[10px] font-mono text-[var(--color-gold)] rounded-xs border border-[var(--color-gold)]/40 pointer-events-none transform -translate-x-1/2 shadow-md z-20 whitespace-nowrap"
                    style={{
                      left: `${Math.max(6, Math.min(94, hoverPercent))}%`,
                    }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Visual duration and progress indicators */}
          <div className="flex items-center justify-between text-xs font-mono text-white/70 px-1 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-gold)] font-semibold">
                {formatTime(currentTime)}
              </span>
              <span className="text-white/30">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="text-[11px] font-sans uppercase tracking-wider text-white/50 hidden sm:flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[var(--color-gold)]/80" />
              <span>Master Acoustic Waveform</span>
            </div>

            <div className="text-[11px] font-mono text-white/70">
              <span className="text-white/40 uppercase font-sans text-[10px] mr-1.5">
                Progress
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Scrubber Timeline for compact views */
        <div className="relative w-full flex items-center group">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekRange}
            className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[var(--color-gold)] focus:outline-none"
            style={{
              background: `linear-gradient(to right, var(--color-gold) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, #262626 ${duration ? (currentTime / duration) * 100 : 0}%)`,
            }}
            aria-label="Audio timeline scrubber"
          />
        </div>
      )}

      {/* Controls Strip */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-sm bg-[var(--color-gold)] text-[#192c45] flex items-center justify-center hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="text-white/60 hover:text-[var(--color-gold)] transition-colors p-1 cursor-pointer"
            title="Restart track"
            aria-label="Restart audio track"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {showWaveform && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white/5 text-white/60 hidden sm:inline-block">
              Click waveform to seek
            </span>
          )}
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-white/60 hover:text-[var(--color-gold)] transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-[var(--color-gold)]" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="w-16 sm:w-20 h-1 bg-[#262626] rounded appearance-none cursor-pointer accent-[var(--color-gold)]"
            aria-label="Volume slider"
          />
        </div>
      </div>
    </div>
  );
};
