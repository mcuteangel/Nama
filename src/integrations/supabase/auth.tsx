import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionContextProviderProps {
  children: ReactNode;
  supabaseClient: SupabaseClient; // Add supabaseClient prop
}

export const SessionContextProvider = ({ children, supabaseClient }: SessionContextProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient]); // Depend on supabaseClient

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};