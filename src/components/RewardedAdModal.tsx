import React, { useState, useEffect } from 'react';
import { X, Award, Play, Volume2, VolumeX, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound.ts';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: (points: number) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardEarned,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(7);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [interactiveTaps, setInteractiveTaps] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(7);
      setIsCompleted(false);
      setShowSkipWarning(false);
      setInteractiveTaps(0);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          soundManager.playReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseAttempt = () => {
    if (isCompleted) {
      onClose();
    } else {
      setShowSkipWarning(true);
    }
  };

  const handleConfirmSkip = () => {
    setShowSkipWarning(false);
    onClose();
  };

  const handleClaimReward = () => {
    if (isCompleted) {
      onRewardEarned(200);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="rewarded-ad-provider-dialog"
        className="relative w-full max-w-lg bg-stone-900 border border-stone-700 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Rewarded Provider Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-850 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white font-semibold text-[11px] tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Rewarded Video Provider
            </span>
            <span className="text-stone-400 text-[11px] hidden sm:inline">AdPlay Media SDK v3.8</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-stone-400 hover:text-white p-1 rounded transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              id="close-rewarded-ad-btn"
              onClick={handleCloseAttempt}
              className="text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Simulation Content */}
        <div className="relative bg-stone-950 aspect-video flex flex-col items-center justify-center overflow-hidden p-6 select-none">
          {/* Animated Background Graphic */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-stone-950 opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Ad Creative Simulation */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 animate-bounce">
              <Award className="w-8 h-8 text-amber-950" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-wide">
              {isCompleted ? 'Reward Completed!' : 'Corn Valley Championship'}
            </h3>
            <p className="text-xs text-stone-300 max-w-xs mt-1">
              {isCompleted 
                ? 'Thank you for watching! Your 200 virtual points have been verified.' 
                : 'Watch the full video to claim your 200 virtual points for Chicken Jump!'}
            </p>

            {/* Interactive element to simulate engagement */}
            {!isCompleted && (
              <button
                onClick={() => setInteractiveTaps((c) => c + 1)}
                className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-amber-200 font-medium transition-all active:scale-95"
              >
                🎮 Tap to try demo {interactiveTaps > 0 ? `(${interactiveTaps} taps)` : ''}
              </button>
            )}
          </div>

          {/* Rewarded Progress Bar & Countdown Overlay */}
          <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-xs bg-black/60 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10">
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span className="text-[11px] font-mono text-stone-200">
                {isCompleted ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> Reward verified
                  </span>
                ) : (
                  `Reward in: ${secondsLeft}s`
                )}
              </span>
            </div>

            <div className="w-32 bg-stone-800 rounded-full h-2 overflow-hidden ml-3">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((7 - secondsLeft) / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-5 bg-stone-900 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400 text-center sm:text-left">
            <span className="font-semibold text-stone-200 block sm:inline">Separate Rewarded Provider:</span>{' '}
            Points are credited only upon complete verified video stream.
          </div>

          {isCompleted ? (
            <button
              id="claim-reward-points-btn"
              onClick={handleClaimReward}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              Claim +200 Points
            </button>
          ) : (
            <div className="text-xs text-amber-400 font-medium px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50">
              Watching ad... ({secondsLeft}s)
            </div>
          )}
        </div>

        {/* Skip Confirmation Alert */}
        {showSkipWarning && (
          <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center p-6 text-center animate-in fade-in">
            <div className="max-w-xs bg-stone-800 p-5 rounded-2xl border border-stone-700 shadow-xl">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-white mb-1">Leave without reward?</h4>
              <p className="text-xs text-stone-300 mb-4">
                You have {secondsLeft}s left. Closing the ad now will forfeit the <strong className="text-amber-300">+200 virtual points</strong>.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkipWarning(false)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Keep Watching
                </button>
                <button
                  onClick={handleConfirmSkip}
                  className="py-2 px-3 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
