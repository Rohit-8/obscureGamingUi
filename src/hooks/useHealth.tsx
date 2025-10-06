import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { apiService } from '../services/ApiService';

interface HealthContextType {
  healthy: boolean | null; // null = unknown / checking
  checkHealth: () => Promise<boolean>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const healthCheckInProgress = useRef(false);

  const checkHealth = async () => {
    if (healthCheckInProgress.current) {
      return healthy ?? false;
    }

    healthCheckInProgress.current = true;
    try {
      const ok = await apiService.health();
      setHealthy(ok);
      return ok;
    } finally {
      healthCheckInProgress.current = false;
    }
  };

  useEffect(() => {
    // Run a quick health check on mount
    let mounted = true;
    let timeout: NodeJS.Timeout;

    const performHealthCheck = async () => {
      if (healthCheckInProgress.current) return;
      
      healthCheckInProgress.current = true;
      try {
        const ok = await apiService.health();
        if (!mounted) return;
        setHealthy(ok);
      } catch (err) {
        if (!mounted) return;
        setHealthy(false);
      } finally {
        healthCheckInProgress.current = false;
      }
    };

    timeout = setTimeout(performHealthCheck, 50);

    return () => { 
      mounted = false;
      healthCheckInProgress.current = false;
      if (timeout) clearTimeout(timeout);
    };
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
