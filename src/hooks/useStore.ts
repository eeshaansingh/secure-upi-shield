// === Custom hook to subscribe to the store ===
import { useState, useEffect, useCallback } from 'react';
import { subscribe, getTransactions, getActionLogs, getSession } from '@/lib/store';
import type { Transaction, ActionLog, UserSession } from '@/lib/types';

export function useStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions());
  const [logs, setLogs] = useState<ActionLog[]>(getActionLogs());
  const [session, setSession] = useState<UserSession>(getSession());

  const refresh = useCallback(() => {
    setTransactions(getTransactions());
    setLogs(getActionLogs());
    setSession(getSession());
  }, []);

  useEffect(() => {
    const unsub = subscribe(refresh);
    return () => { unsub; };
  }, [refresh]);

  return { transactions, logs, session };
}
