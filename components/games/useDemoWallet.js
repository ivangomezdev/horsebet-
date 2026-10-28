"use client";
import { useEffect, useRef, useState } from "react";
import { INITIAL_CREDITS, MAX_STAKE, payoutFor } from "../../lib/games/engine";

const storageKey = "horsebet-originals-demo-v1";
const emptyWallet = () => ({
  balance: INITIAL_CREDITS,
  history: [],
  pending: null,
});
export default function useDemoWallet() {
  const [wallet, setWallet] = useState(emptyWallet);
  const [ready, setReady] = useState(false);
  const state = useRef(wallet);
  const commit = (next) => {
    state.current = next;
    setWallet(next);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Demo also works without storage. */
    }
  };
  useEffect(() => {
    let next = emptyWallet();
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      if (
        saved &&
        Number.isSafeInteger(saved.balance) &&
        saved.balance >= 0 &&
        saved.balance <= 1e13 &&
        Array.isArray(saved.history)
      ) {
        next = {
          balance: saved.balance,
          history: saved.history
            .filter(
              (row) =>
                row &&
                typeof row.id === "string" &&
                typeof row.game === "string" &&
                typeof row.detail === "string" &&
                Number.isSafeInteger(row.payout) &&
                row.payout >= 0 &&
                Number.isSafeInteger(row.stake) &&
                row.stake >= 100 &&
                row.stake <= MAX_STAKE &&
                Number.isFinite(row.multiplier) &&
                row.multiplier >= 0,
            )
            .slice(0, 12),
          pending: null,
        };
        if (
          Number.isSafeInteger(saved.pending?.stake) &&
          saved.pending.stake >= 100 &&
          saved.pending.stake <= MAX_STAKE
        )
          next.balance += saved.pending.stake;
      }
    } catch {
      /* Start fresh when a browser blocks or invalidates session storage. */
    }
    commit(next);
    setReady(true);
    return () => {
      const current = state.current;
      if (current.pending) {
        const refunded = {
          ...current,
          balance: current.balance + current.pending.stake,
          pending: null,
        };
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(refunded));
        } catch {}
      }
    };
  }, []);
  const start = (stake, game) => {
    const current = state.current;
    if (
      !ready ||
      current.pending ||
      !Number.isSafeInteger(stake) ||
      stake < 100 ||
      stake > MAX_STAKE ||
      stake > current.balance
    )
      return null;
    const round = { id: crypto.randomUUID(), stake, game };
    commit({ ...current, balance: current.balance - stake, pending: round });
    return round;
  };
  const finish = (id, multiplier, detail) => {
    const current = state.current;
    if (current.pending?.id !== id) return null;
    const payout = payoutFor(current.pending.stake, multiplier);
    const result = { ...current.pending, payout, multiplier, detail };
    commit({
      balance: current.balance + payout,
      pending: null,
      history: [result, ...current.history].slice(0, 12),
    });
    return result;
  };
  const reset = () => {
    if (!state.current.pending) commit(emptyWallet());
  };
  return { ...wallet, ready, start, finish, reset };
}
