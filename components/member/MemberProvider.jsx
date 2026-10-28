"use client";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth, apiRequest } from "../auth/AuthProvider";
const Context = createContext(null);
export function MemberProvider({ children }) {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const generation = useRef(0),
    pending = useRef(null);
  const refresh = useCallback(async () => {
    if (!user) return;
    if (pending.current) return pending.current;
    const stamp = generation.current;
    const request = apiRequest("/api/member/", undefined, "GET")
      .then((data) => {
        if (stamp === generation.current) {
          setSnapshot({ owner: user.id, data });
          setError("");
        }
      })
      .catch((err) => {
        if (stamp === generation.current) setError(err.message);
      })
      .finally(() => {
        if (stamp === generation.current) pending.current = null;
      });
    pending.current = request;
    return request;
  }, [user?.id]);
  useEffect(() => {
    generation.current++;
    pending.current = null;
    setSnapshot(null);
    setError("");
    refresh();
    const focus = () => {
      if (!document.hidden) refresh();
    };
    window.addEventListener("focus", focus);
    const timer = setInterval(focus, 30000);
    return () => {
      generation.current++;
      pending.current = null;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [refresh]);
  const mutate = async (body) => {
    setBusy(true);
    try {
      await apiRequest("/api/member/", body);
      generation.current++;
      pending.current = null;
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  const data = user && snapshot?.owner === user.id ? snapshot.data : null;
  return (
    <Context.Provider value={{ data, error, busy, refresh, mutate }}>
      {children}
    </Context.Provider>
  );
}
export function useMember() {
  return useContext(Context);
}
