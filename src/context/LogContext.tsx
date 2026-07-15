import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DailyLog, ExerciseEntry, FoodEntry, WaterEntry } from '@/types';
import { loadAllLogs, saveAllLogs, todayKey } from '@/services/storage';

interface LogContextValue {
  today: DailyLog;
  isLoading: boolean;
  addFood: (entry: FoodEntry) => void;
  removeFood: (id: string) => void;
  addWater: (amountMl: number) => void;
  removeWater: (id: string) => void;
  addExercise: (name: string, met: number, durationMinutes: number, caloriesBurned: number) => void;
  removeExercise: (id: string) => void;
}

const LogContext = createContext<LogContextValue | undefined>(undefined);

function emptyLog(date: string): DailyLog {
  return { date, foods: [], water: [], exercises: [] };
}

// Older persisted logs may predate the exercises array or the sugar macro field.
function normalizeLog(log: DailyLog): DailyLog {
  return {
    ...log,
    exercises: log.exercises ?? [],
    foods: log.foods.map((f) => ({ ...f, sugarG: f.sugarG ?? 0 })),
  };
}

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [isLoading, setIsLoading] = useState(true);
  const key = todayKey();

  useEffect(() => {
    loadAllLogs().then((stored) => {
      setLogs(stored);
      setIsLoading(false);
    });
  }, []);

  const persist = (next: Record<string, DailyLog>) => {
    setLogs(next);
    saveAllLogs(next);
  };

  const today = normalizeLog(logs[key] ?? emptyLog(key));

  const addFood = (entry: FoodEntry) => {
    const current = normalizeLog(logs[key] ?? emptyLog(key));
    persist({ ...logs, [key]: { ...current, foods: [...current.foods, entry] } });
  };

  const removeFood = (id: string) => {
    const current = normalizeLog(logs[key] ?? emptyLog(key));
    persist({ ...logs, [key]: { ...current, foods: current.foods.filter((f) => f.id !== id) } });
  };

  const addWater = (amountMl: number) => {
    const current = normalizeLog(logs[key] ?? emptyLog(key));
    const entry: WaterEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amountMl,
      loggedAt: new Date().toISOString(),
    };
    persist({ ...logs, [key]: { ...current, water: [...current.water, entry] } });
  };

  const removeWater = (id: string) => {
    const current = normalizeLog(logs[key] ?? emptyLog(key));
    persist({ ...logs, [key]: { ...current, water: current.water.filter((w) => w.id !== id) } });
  };

  const addExercise = (name: string, met: number, durationMinutes: number, caloriesBurned: number) => {
    const current = normalizeLog(logs[key] ?? emptyLog(key));
    const entry: ExerciseEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      met,
      durationMinutes,
      caloriesBurned,
      loggedAt: new Date().toISOString(),
    };
    persist({ ...logs, [key]: { ...current, exercises: [...current.exercises, entry] } });
  };

  const removeExercise = (id: string) => {
    const current = normalizeLog(logs[key] ?? emptyLog(key));
    persist({ ...logs, [key]: { ...current, exercises: current.exercises.filter((e) => e.id !== id) } });
  };

  const value = useMemo(
    () => ({ today, isLoading, addFood, removeFood, addWater, removeWater, addExercise, removeExercise }),
    [today, isLoading, logs]
  );

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>;
}

export function useLog(): LogContextValue {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLog must be used within a LogProvider');
  return ctx;
}
