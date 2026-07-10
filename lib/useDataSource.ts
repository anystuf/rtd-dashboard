"use client";

import { useEffect, useMemo, useState } from "react";
import { DocumentReference, onSnapshot, Query } from "firebase/firestore";
import type { DashboardMetrics } from "./types";

type ApiPayload = Record<string, unknown>;

const POLL_MS = 120_000;
const BUILD_DATA_API_URL = process.env.NEXT_PUBLIC_DATA_API_URL || "";

function readBrowserDataApiUrl() {
  if (typeof window === "undefined") return BUILD_DATA_API_URL;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("dataApiUrl");
  if (fromQuery) {
    window.localStorage.setItem("rtdDataApiUrl", fromQuery);
    return fromQuery;
  }

  return BUILD_DATA_API_URL || window.localStorage.getItem("rtdDataApiUrl") || "";
}

function addCacheBuster(rawUrl: string) {
  const url = new URL(rawUrl);
  url.searchParams.set("_", Date.now().toString());
  return url.toString();
}

function fetchJsonp(url: string): Promise<ApiPayload> {
  return new Promise((resolve, reject) => {
    const callbackName = `__rtdDataApi_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const jsonpWindow = window as unknown as Record<string, unknown>;
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Data API timed out"));
    }, 15_000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete jsonpWindow[callbackName];
    }

    jsonpWindow[callbackName] = (payload: ApiPayload) => {
      cleanup();
      resolve(payload);
    };

    const jsonpUrl = new URL(url);
    jsonpUrl.searchParams.set("callback", callbackName);
    script.src = jsonpUrl.toString();
    script.onerror = () => {
      cleanup();
      reject(new Error("Data API request failed"));
    };
    document.body.appendChild(script);
  });
}

async function fetchPayload(apiUrl: string) {
  const url = addCacheBuster(apiUrl);
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Data API returned ${response.status}`);
    return await response.json() as ApiPayload;
  } catch {
    return fetchJsonp(url);
  }
}

function useDataApiUrl() {
  const [apiUrl, setApiUrl] = useState(readBrowserDataApiUrl);

  useEffect(() => {
    setApiUrl(readBrowserDataApiUrl());
  }, []);

  return apiUrl;
}

function useApiPayload(apiUrl: string) {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiUrl) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const payload = await fetchPayload(apiUrl);
        if (!alive) return;
        setData(payload);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Data API request failed");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [apiUrl]);

  return { data, loading, error };
}

function apiArray<T>(payload: ApiPayload | null, key: string) {
  const value = payload?.[key];
  return Array.isArray(value) ? value as T[] : [];
}

function apiMetrics(payload: ApiPayload | null) {
  const value = payload?.dashboard_metrics ?? payload?.metrics;
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return (record.current && typeof record.current === "object" ? record.current : record) as DashboardMetrics;
}

export type DistributionItem = { name: string; value: number };
export type DashboardDistributions = {
  participantsByCountry: DistributionItem[];
  participantsByRole: DistributionItem[];
  issuesBySeverity: DistributionItem[];
  issuesBySource: DistributionItem[];
  issuesByField: DistributionItem[];
  transferByDirection: DistributionItem[];
  transferReadiness: DistributionItem[];
};

function apiDistributions(payload: ApiPayload | null): DashboardDistributions | null {
  const value = payload?.dashboard_distributions;
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  return value as DashboardDistributions;
}

export function useCollectionSource<T>(key: string, queryRef: Query) {
  const apiUrl = useDataApiUrl();
  const api = useApiPayload(apiUrl);
  const [firestoreData, setFirestoreData] = useState<T[]>([]);
  const [firestoreLoading, setFirestoreLoading] = useState(!apiUrl);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (apiUrl) {
      setFirestoreLoading(false);
      setFirestoreError(null);
      return;
    }

    setFirestoreLoading(true);
    setFirestoreError(null);
    const unsub = onSnapshot(queryRef, (snapshot) => {
      setFirestoreData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
      setFirestoreError(null);
      setFirestoreLoading(false);
    }, (err) => {
      setFirestoreError(err.message);
      setFirestoreLoading(false);
    });

    return unsub;
  }, [apiUrl, queryRef]);

  return useMemo(() => {
    if (apiUrl) {
      return {
        data: apiArray<T>(api.data, key),
        loading: api.loading,
        error: api.error,
        source: "api" as const
      };
    }

    return {
      data: firestoreData,
      loading: firestoreLoading,
      error: firestoreError,
      source: "firestore" as const
    };
  }, [api.data, api.error, api.loading, apiUrl, firestoreData, firestoreError, firestoreLoading, key]);
}

export function useDashboardMetricsSource(docRef: DocumentReference) {
  const apiUrl = useDataApiUrl();
  const api = useApiPayload(apiUrl);
  const [firestoreData, setFirestoreData] = useState<DashboardMetrics | null>(null);
  const [firestoreLoading, setFirestoreLoading] = useState(!apiUrl);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (apiUrl) {
      setFirestoreLoading(false);
      setFirestoreError(null);
      return;
    }

    setFirestoreLoading(true);
    setFirestoreError(null);
    const unsub = onSnapshot(docRef, (snapshot) => {
      setFirestoreData(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as unknown as DashboardMetrics) : null);
      setFirestoreError(null);
      setFirestoreLoading(false);
    }, (err) => {
      setFirestoreError(err.message);
      setFirestoreLoading(false);
    });

    return unsub;
  }, [apiUrl, docRef]);

  return useMemo(() => {
    if (apiUrl) {
      return {
        data: apiMetrics(api.data),
        loading: api.loading,
        error: api.error,
        source: "api" as const
      };
    }

    return {
      data: firestoreData,
      loading: firestoreLoading,
      error: firestoreError,
      source: "firestore" as const
    };
  }, [api.data, api.error, api.loading, apiUrl, firestoreData, firestoreError, firestoreLoading]);
}

export function useDashboardDistributionsSource() {
  const apiUrl = useDataApiUrl();
  const api = useApiPayload(apiUrl);

  return useMemo(() => ({
    data: apiUrl ? apiDistributions(api.data) : null,
    loading: apiUrl ? api.loading : false,
    error: apiUrl ? api.error : null,
    source: apiUrl ? "api" as const : "firestore" as const
  }), [api.data, api.error, api.loading, apiUrl]);
}
