/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Tv, Coins, Sparkles, AlertTriangle, ShieldCheck, Volume2, VolumeX, HelpCircle, X } from 'lucide-react';
import { ChickenLogo } from './components/ChickenLogo.tsx';
import { AdSenseDisplayAd } from './components/AdSenseDisplayAd.tsx';
import { RewardedAdModal } from './components/RewardedAdModal.tsx';
import { GameHistoryList } from './components/GameHistoryList.tsx';
import { ChickenJumpGame } from './components/ChickenJumpGame.tsx';
import { GameRecord, GameView } from './types.ts';
import { soundManager } from './utils/sound.ts';

const DEFAULT_INITIAL_POINTS = 100;

export default function App() {
  const [view, setView] = useState<GameView>('lobby');
  const [points, setPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('chicken_jump_points');
      return saved !== null ? parseInt(saved, 10) : DEFAULT_INITIAL_POINTS;
    } catch {
      return DEFAULT_INITIAL_POINTS;
    }
  });

  const [history, setHistory] = useState<GameRecord[]>(() => {
    try {
      const saved = localStorage.getItem('chicken_jump_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init-1',
        date: 'Lobby Demo',
        score: 140,
        distance: 120,
        seedsCollected: 4,
        pointsSpent: 20,
        pointsEarned: 8,
      },
    ];
  });

  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [lowPointsAlert, setLowPointsAlert] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [pointsNotice, setPointsNotice] = useState<string | null>(null);

  // Sync points to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chicken_jump_points', points.toString());
    } catch {}
  }, [points]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chicken_jump_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.enabled = next;
  };

  const handleStartGame = () => {
    if (points < 20) {
      setLowPointsAlert(true);
      soundManager.playGameOver();
      return;
    }

    // Deduct 20 points to start game
    setPoints((prev) => prev - 20);
    soundManager.playJump();
    setView('playing');
  };

  const handleOpenRewardedAd = () => {
    setLowPointsAlert(false);
    setIsRewardedAdOpen(true);
  };

  const handleRewardEarned = (rewardPoints: number) => {
    setPoints((prev) => {
      const updated = prev + rewardPoints;
      return updated;
    });

    setPointsNotice(`+${rewardPoints} Points Credited!`);
    setTimeout(() => setPointsNotice(null), 3000);

    // Also record transaction in history
    setHistory((prev) => [
      {
        id: Date.now().toString(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: 0,
        distance: 0,
        seedsCollected: 0,
        pointsSpent: 0,
        pointsEarned: rewardPoints,
      },
      ...prev,
    ]);
  };

  const handleRecordGame = (record: GameRecord) => {
    setHistory((prev) => [record, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('chicken_jump_history');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-100/40 text-stone-800 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Navbar */}
      <header className="w-full border-b border-amber-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setView('lobby')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🐔</span>
            <span className="font-extrabold text-stone-900 tracking-tight font-['Fredoka'] text-lg sm:text-xl">
              Chicken Jump
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Points Display in Topbar */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-950 font-bold text-xs shadow-2xs">
              <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{points} pts</span>
            </div>

            <button
              onClick={() => setShowHowToPlay(true)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="How to Play & Policies"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title={soundOn ? 'Mute Audio' : 'Enable Audio'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 flex flex-col">
        {/* Floating Notification Toast */}
        {pointsNotice && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-lg font-bold text-xs sm:text-sm flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>{pointsNotice}</span>
          </div>
        )}

        {/* ACTIVE GAMEPLAY VIEW (AdSense Display Ad is kept strictly OUTSIDE active gameplay area) */}
        {view === 'playing' ? (
          <div className="w-full animate-in fade-in duration-200">
            <ChickenJumpGame
              currentPoints={points}
              onPointsChange={setPoints}
              onRecordGame={handleRecordGame}
              onReturnToLobby={() => setView('lobby')}
            />
          </div>
        ) : (
          /* HOME / LOBBY SCREEN (Follows Recommended Order 1 -> 6) */
          <div className="w-full flex flex-col items-center">
            {/* 1. CHICKEN JUMP LOGO */}
            <section id="section-1-logo" className="w-full flex justify-center mb-4">
              <ChickenLogo />
            </section>

            {/* 2. CURRENT POINTS */}
            <section 
              id="section-2-points"
              className="w-full max-w-md my-2 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-orange-400/10 border-2 border-amber-300/80 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Coins className="w-6 h-6 fill-amber-100" />
                </div>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-amber-900/70">
                    Current Points
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-950 font-['Fredoka']">
                    {points}{' '}
                    <span className="text-sm font-semibold text-amber-800">Points</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/80 border border-amber-200 text-amber-900 shadow-2xs">
                  Run Cost: 20 pts
                </span>
              </div>
            </section>

            {/* Low Points Warning Alert if attempted start with < 20 pts */}
            {lowPointsAlert && (
              <div className="w-full max-w-md my-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="flex-1">
                  <strong>Insufficient Points!</strong> You need at least 20 points to start a run. Click <strong>WATCH AD +200 POINTS</strong> below to refill for free!
                </div>
                <button
                  onClick={() => setLowPointsAlert(false)}
                  className="p-1 text-rose-400 hover:text-rose-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ACTION CONTROLS CONTAINER */}
            <div className="w-full max-w-md flex flex-col gap-3 my-3">
              {/* 3. START GAME – 20 POINTS */}
              <button
                id="start-game-btn"
                onClick={handleStartGame}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-base sm:text-lg tracking-wide shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-3 group border-b-4 border-emerald-700 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
                <span>START GAME – 20 POINTS</span>
              </button>

              {/* 4. WATCH AD +200 POINTS (Separate Rewarded-Ad Provider) */}
              <button
                id="watch-rewarded-ad-btn"
                onClick={handleOpenRewardedAd}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 font-extrabold text-sm sm:text-base tracking-wide shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2.5 border-b-4 border-amber-600 cursor-pointer"
              >
                <Tv className="w-5 h-5 text-amber-950" />
                <span>WATCH AD +200 POINTS</span>
                <span className="px-2 py-0.5 rounded-full bg-white/30 text-amber-950 text-xs font-bold uppercase tracking-wider ml-1">
                  Rewarded
                </span>
              </button>
            </div>

            {/* 5. GOOGLE ADSENSE DISPLAY AD UNIT (Strictly separated from game controls) */}
            <section id="section-5-adsense" className="w-full max-w-md">
              <AdSenseDisplayAd />
            </section>

            {/* 6. GAME HISTORY */}
            <section id="section-6-history" className="w-full max-w-md">
              <GameHistoryList
                history={history}
                onClearHistory={handleClearHistory}
              />
            </section>
          </div>
        )}
      </main>

      {/* REWARDED AD MODAL (Separate Provider) */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardEarned={handleRewardEarned}
      />

      {/* How to Play & Policy Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 font-['Fredoka'] flex items-center gap-2">
                <span>🐔</span> How Chicken Jump Works
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-stone-600 leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <strong className="text-amber-900 block mb-1">🎮 Gameplay Rules:</strong>
                Each run costs <strong>20 Virtual Points</strong>. Press Space, Up Arrow, or Tap to jump over hurdles, hay bales, and foxes. Press again mid-air for a double-jump flap!
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <strong className="text-emerald-900 block mb-1">🌽 Collect Corn Seeds:</strong>
                Grab golden corn seeds along the way (+5 score, +2 bonus points per seed upon completing the run).
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <strong className="text-blue-900 block mb-1">🎁 Rewarded Video Ads:</strong>
                Watch a complete video via our separate rewarded ad partner to earn <strong>+200 virtual points</strong> anytime you are low on points.
              </div>

              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-stone-700">
                <strong className="text-stone-900 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                  Google AdSense Compliance:
                </strong>
                The AdSense banner displayed on the lobby screen is an official Google Display Ad. It is strictly separated from game controls, never awards points for clicks, and is not shown during active gameplay.
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="w-full py-4 text-center text-stone-400 text-xs border-t border-amber-200/50 mt-8">
        Chicken Jump • Google AdSense Display Ad Unit Integrated • All Rights Reserved
      </footer>
    </div>
  );
}
