import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DailyLog, FoodEntry, WaterEntry } from '@/types';
import { loadAllLogs, saveAllLogs, todayKey } from '@/services/storage';

interface LogContextValue {
  today: DailyLog;
  isLoading: boolean;
  addFood: (entry: FoodEntry) => void;
  removeFood: (id: string) => void;
  addWater: (amountMl: number) => void;
  removeWater: (id: string) => void;
}

const LogContext = createContext<LogContextValue | undefined>(undefined);

function emptyLog(date: string): DailyLog {
  return { date, foods: [], water: [] };
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

  const today = logs[key] ?? emptyLog(key);

  const addFood = (entry: FoodEntry) => {
    const current = logs[key] ?? emptyLog(key);
    persist({ ...logs, [key]: { ...current, foods: [...current.foods, entry] } });
  };

  const removeFood = (id: string) => {
    const current = logs[key] ?? emptyLog(key);
    persist({ ...logs, [key]: { ...current, foods: current.foods.filter((f) => f.id !== id) } });
  };

  const addWater = (amountMl: number) => {
    const current = logs[key] ?? emptyLog(key);
    const entry: WaterEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amountMl,
      loggedAt: new Date().toISOString(),
    };
    persist({ ...logs, [key]: { ...current, water: [...current.water, entry] } });
  };

  const removeWater = (id: string) => {
    const current = logs[key] ?? emptyLog(key);
    persist({ ...logs, [key]: { ...current, water: current.water.filter((w) => w.id !== id) } });
  };

  const value = useMemo(
    () => ({ today, isLoading, addFood, removeFood, addWater, removeWater }),
    [today, isLoading, logs]
  );

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>;
}

export function useLog(): LogContextValue {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLog must be used within a LogProvider');
  return ctx;
}
