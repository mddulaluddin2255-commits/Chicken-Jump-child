export interface GameRecord {
  id: string;
  date: string;
  score: number;
  distance: number;
  seedsCollected: number;
  pointsSpent: number;
  pointsEarned: number;
}

export type GameView = 'lobby' | 'playing';

export interface SoundManager {
  playJump: () => void;
  playFlap: () => void;
  playCoin: () => void;
  playGameOver: () => void;
  playReward: () => void;
}
