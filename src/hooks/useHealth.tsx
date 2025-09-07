import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/ApiService';

interface HealthContextType {
  healthy: boolean | null; // null = unknown / checking
  checkHealth: () => Promise<boolean>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  const checkHealth = async () => {
    const ok = await apiService.health();
    setHealthy(ok);
    return ok;
  };

  useEffect(() => {
    // Run a quick health check on mount
    let mounted = true;
    (async () => {
      try {
        const ok = await apiService.health();
        if (!mounted) return;
        setHealthy(ok);
      } catch (err) {
        if (!mounted) return;
        setHealthy(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <HealthContext.Provider value={{ healthy, checkHealth }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used within HealthProvider');
  return ctx;
};
