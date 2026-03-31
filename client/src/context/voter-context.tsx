/**
 * @module client/context/voter-context
 *
 * Provides voter identity and vote-receipt state to the React tree.
 *
 * SECURITY DESIGN — Sensitive values (voterId, receipt) are persisted to
 * sessionStorage so the voting flow survives page refreshes within a tab.
 * sessionStorage is tab-scoped and cleared when the tab closes, limiting
 * exposure on shared devices. The `isAuthenticated` flag is derived
 * (`!!voterId`) rather than stored separately, so it cannot drift out of sync.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { VoteReceiptResponse } from "@shared/schema";

const SESSION_KEY = "sacredvote_session";

interface SessionData {
  voterId: string;
  receipt: VoteReceiptResponse | null;
}

interface VoterContextType {
  voterId: string | null;
  setVoterId: (id: string | null) => void;
  receipt: VoteReceiptResponse | null;
  setReceipt: (receipt: VoteReceiptResponse | null) => void;
  isAuthenticated: boolean;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

function saveSession(data: SessionData | null) {
  if (data) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function VoterProvider({ children }: { children: React.ReactNode }) {
  const saved = loadSession();
  const [voterId, setVoterIdState] = useState<string | null>(saved?.voterId ?? null);
  const [receipt, setReceiptState] = useState<VoteReceiptResponse | null>(saved?.receipt ?? null);

  const setVoterId = useCallback((id: string | null) => {
    setVoterIdState(id);
    if (id) {
      saveSession({ voterId: id, receipt: null });
    } else {
      saveSession(null);
    }
  }, []);

  const setReceipt = useCallback((r: VoteReceiptResponse | null) => {
    setReceiptState(r);
    if (voterId) {
      saveSession({ voterId, receipt: r });
    }
  }, [voterId]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === SESSION_KEY && !e.newValue) {
        setVoterIdState(null);
        setReceiptState(null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <VoterContext.Provider
      value={{
        voterId,
        setVoterId,
        receipt,
        setReceipt,
        isAuthenticated: !!voterId,
      }}
    >
      {children}
    </VoterContext.Provider>
  );
}

export function useVoterSession() {
  const context = useContext(VoterContext);
  if (!context) {
    throw new Error("useVoterSession must be used within a VoterProvider");
  }
  return context;
}
