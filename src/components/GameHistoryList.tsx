import React from 'react';
import { History, Trophy, Award, TrendingUp, Trash2 } from 'lucide-react';
import { GameRecord } from '../types.ts';

interface GameHistoryListProps {
  history: GameRecord[];
  onClearHistory: () => void;
}

export const GameHistoryList: React.FC<GameHistoryListProps> = ({
  history,
  onClearHistory,
}) => {
  const highScore = history.reduce((max, r) => Math.max(max, r.score), 0);
  const bestDistance = history.reduce((max, r) => Math.max(max, r.distance), 0);
  const totalSeeds = history.reduce((sum, r) => sum + r.seedsCollected, 0);

  return (
    <div id="game-history-section" className="w-full mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <History className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight font-['Fredoka']">
            Game History & Stats
          </h2>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-stone-100"
            title="Clear run history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        )}
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-amber-900/70">High Score</div>
            <div className="text-base font-bold text-amber-950">{highScore} pts</div>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-emerald-900/70">Best Run</div>
            <div className="text-base font-bold text-emerald-950">{bestDistance}m</div>
          </div>
        </div>

        <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-800 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-orange-900/70">Seeds Gathered</div>
            <div className="text-base font-bold text-orange-950">🌽 {totalSeeds}</div>
          </div>
        </div>
      </div>

      {/* Runs Table or Empty State */}
      {history.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl text-stone-500">
          <div className="w-12 h-12 mx-auto mb-2 text-3xl">🏁</div>
          <h4 className="text-sm font-semibold text-stone-700">No games played yet</h4>
          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            Spend 20 points to start your first Chicken Jump run and set a new personal record!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Run</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Seeds</th>
                <th className="py-2.5 px-3 text-right">Points Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {history.slice(0, 10).map((record, index) => {
                const net = record.pointsEarned - record.pointsSpent;
                return (
                  <tr key={record.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-stone-900">
                      #{history.length - index}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">
                      {record.date}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-700">
                      {record.score}
                    </td>
                    <td className="py-2.5 px-3">
                      {record.distance}m
                    </td>
                    <td className="py-2.5 px-3 font-medium text-emerald-700">
                      🌽 {record.seedsCollected}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                          net >= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {net > 0 ? `+${net}` : net} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
