"use client";

import { useEffect, useState } from "react";
import { DocumentReference, onSnapshot, Query } from "firebase/firestore";

export function useCollection<T>(queryRef: Query) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = onSnapshot(queryRef, (snapshot) => {
      setData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
      setError(null);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    return unsub;
  }, [queryRef]);

  return { data, loading, error };
}

export function useDoc<T>(docRef: DocumentReference) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = onSnapshot(docRef, (snapshot) => {
      setData(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null);
      setError(null);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    return unsub;
  }, [docRef]);

  return { data, loading, error };
}
