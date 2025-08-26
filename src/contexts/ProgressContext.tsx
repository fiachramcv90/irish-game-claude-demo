import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';

import { useLocalStorage } from '../hooks/useLocalStorage';
import type {
  ProgressContextType,
  GameType,
  GameProgress,
  Achievement,
  UserProgress,
} from '../types';

const ProgressContext = createContext<ProgressContextType | null>(null);

interface ProgressProviderProps {
  children: React.ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const { data, updateData, userProgress } = useLocalStorage();

  // Define addAchievement first
  const addAchievement = useCallback(
    (achievement: Achievement) => {
      const isAlreadyUnlocked = userProgress.achievements.some(
        a => a.id === achievement.id
      );
      if (isAlreadyUnlocked) return;

      const newAchievement = {
        ...achievement,
        unlockedAt: new Date(),
        isUnlocked: true,
      };

      const newUserProgress: UserProgress = {
        ...userProgress,
        achievements: [...userProgress.achievements, newAchievement],
        lastActive: new Date(),
      };

      updateData({ userProgress: newUserProgress });

      // Show achievement notification (could be expanded with toast system)
      console.log(`🏆 Achievement Unlocked: ${achievement.title}`);
    },
    [userProgress, updateData]
  );

  // Achievement checking logic
  const checkAndUnlockAchievements = useCallback(
    (newProgress: UserProgress) => {
      // Example achievements - these would be expanded based on vocabularyAchievements from vocabulary.ts
      const achievementChecks = [
        {
          id: 'first_game',
          title: 'First Steps',
          description: 'Complete your first game',
          icon: '🎯',
          type: 'exploration' as const,
          requirement: { type: 'total_games', value: 1 },
          check: () => newProgress.totalGamesPlayed >= 1,
        },
        {
          id: 'score_100',
          title: 'Century Scorer',
          description: 'Reach a score of 100 points',
          icon: '💯',
          type: 'score' as const,
          requirement: { type: 'total_score', value: 100 },
          check: () => newProgress.totalScore >= 100,
        },
        {
          id: 'play_10_games',
          title: 'Dedicated Learner',
          description: 'Play 10 games',
          icon: '🔥',
          type: 'consistency' as const,
          requirement: { type: 'total_games', value: 10 },
          check: () => newProgress.totalGamesPlayed >= 10,
        },
        {
          id: 'perfect_streak_5',
          title: 'Streak Master',
          description: 'Get a perfect streak of 5',
          icon: '⚡',
          type: 'streak' as const,
          requirement: { type: 'best_streak', value: 5 },
          check: () =>
            Object.values(newProgress.gameProgress).some(
              gp => gp.bestStreak >= 5
            ),
        },
      ];

      achievementChecks.forEach(achievement => {
        const isAlreadyUnlocked = newProgress.achievements.some(
          a => a.id === achievement.id
        );
        if (!isAlreadyUnlocked && achievement.check()) {
          addAchievement({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            type: achievement.type,
            requirement: achievement.requirement,
            isUnlocked: false,
          });
        }
      });
    },
    [addAchievement]
  );

  const updateProgress = useCallback(
    (gameType: GameType, updates: Partial<GameProgress>) => {
      const currentGameProgress = userProgress.gameProgress[gameType];
      const updatedGameProgress = {
        ...currentGameProgress,
        ...updates,
        lastPlayed: new Date(),
      };

      // Calculate derived statistics
      let totalSessions = updatedGameProgress.totalSessions;
      let totalTimeSpent = updatedGameProgress.totalTimeSpent;

      if (updates.sessions) {
        totalSessions = updates.sessions.length;
        totalTimeSpent = updates.sessions.reduce(
          (total, session) => total + session.duration,
          0
        );
      }

      const finalProgress = {
        ...updatedGameProgress,
        totalSessions,
        totalTimeSpent,
      };

      // Update user progress
      const newUserProgress: UserProgress = {
        ...userProgress,
        gameProgress: {
          ...userProgress.gameProgress,
          [gameType]: finalProgress,
        },
        lastActive: new Date(),
        totalGamesPlayed:
          userProgress.totalGamesPlayed +
          (updates.sessions
            ? updates.sessions.length - currentGameProgress.sessions.length
            : 0),
        totalTimeSpent:
          userProgress.totalTimeSpent +
          (totalTimeSpent - currentGameProgress.totalTimeSpent),
      };

      // Check for achievements
      checkAndUnlockAchievements(newUserProgress);

      updateData({ userProgress: newUserProgress });
    },
    [userProgress, updateData, checkAndUnlockAchievements]
  );

  const getGameProgress = useCallback(
    (gameType: GameType): GameProgress => {
      return userProgress.gameProgress[gameType];
    },
    [userProgress]
  );

  const resetProgress = useCallback(
    (gameType?: GameType) => {
      if (gameType) {
        // Reset specific game
        const defaultGameProgress: GameProgress = {
          gameType,
          level: 1,
          isUnlocked: gameType === 'card-match', // Only card-match starts unlocked
          accuracy: 0,
          averageResponseTime: 0,
          bestScore: 0,
          bestStreak: 0,
          itemsAttempted: 0,
          itemsMastered: 0,
          mistakesCount: 0,
          hintsUsed: 0,
          sessions: [],
          lastPlayed: new Date(),
          totalSessions: 0,
          totalTimeSpent: 0,
        };

        const newUserProgress: UserProgress = {
          ...userProgress,
          gameProgress: {
            ...userProgress.gameProgress,
            [gameType]: defaultGameProgress,
          },
          lastActive: new Date(),
        };

        updateData({ userProgress: newUserProgress });
      } else {
        // Reset all progress
        const defaultProgress = data.userProgress; // This will get the default from localStorage utility
        updateData({ userProgress: defaultProgress });
      }
    },
    [userProgress, data, updateData]
  );

  const saveProgress = useCallback(() => {
    // Progress is automatically saved via localStorage hook
    // This is mainly for manual saves or sync operations
    updateData({
      userProgress: {
        ...userProgress,
        lastActive: new Date(),
      },
    });
  }, [userProgress, updateData]);

  // Auto-unlock games based on progress
  useEffect(() => {
    const cardMatchProgress = userProgress.gameProgress['card-match'];
    const letterProgress = userProgress.gameProgress['letter-recognition'];
    const soundProgress = userProgress.gameProgress['sound-game'];

    let needsUpdate = false;
    const newGameProgress = { ...userProgress.gameProgress };

    // Unlock letter recognition after completing 5 card matching games
    if (cardMatchProgress.totalSessions >= 5 && !letterProgress.isUnlocked) {
      newGameProgress['letter-recognition'] = {
        ...letterProgress,
        isUnlocked: true,
      };
      needsUpdate = true;
    }

    // Unlock sound game after mastering 10 items total
    const totalMasteredItems = userProgress.masteredItems.length;
    if (totalMasteredItems >= 10 && !soundProgress.isUnlocked) {
      newGameProgress['sound-game'] = { ...soundProgress, isUnlocked: true };
      needsUpdate = true;
    }

    if (needsUpdate) {
      updateData({
        userProgress: {
          ...userProgress,
          gameProgress: newGameProgress,
        },
      });
    }
  }, [userProgress, updateData]);

  const contextValue: ProgressContextType = {
    userProgress,
    updateProgress,
    getGameProgress,
    addAchievement,
    resetProgress,
    saveProgress,
  };

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
