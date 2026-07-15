import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PlanSummary, UserProfile } from '@/types';
import { buildPlan } from '@/utils/calculations';
import { loadProfile, saveProfile } from '@/services/storage';

interface UserContextValue {
  profile: UserProfile | null;
  plan: PlanSummary | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile().then((stored) => {
      setProfileState(stored);
      setIsLoading(false);
    });
  }, []);

  const setProfile = async (next: UserProfile) => {
    await saveProfile(next);
    setProfileState(next);
  };

  const plan = useMemo(() => (profile ? buildPlan(profile) : null), [profile]);

  return (
    <UserContext.Provider value={{ profile, plan, isLoading, setProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
