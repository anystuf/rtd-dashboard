"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebaseClient";
import type { UserRole } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setRole(null);
      setLoading(false);
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult(true);
        const claimRole = token.claims.role as UserRole | undefined;
        if (claimRole) setRole(claimRole);
        const userRoleRef = doc(db, "user_roles", firebaseUser.uid);
        const snapshot = await getDoc(userRoleRef).catch(() => null);
        if (snapshot?.exists()) setRole(snapshot.data().role as UserRole);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "user_roles", user.uid), (snapshot) => {
      if (snapshot.exists()) setRole(snapshot.data().role as UserRole);
    });
    return unsub;
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    role: role || (user ? "viewer" : null),
    loading,
    authError,
    login: async () => {
      setAuthError(null);
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        if (error instanceof FirebaseError) {
          if (error.code === "auth/unauthorized-domain") {
            setAuthError("This website is not authorized in Firebase Authentication. Add anystuf.github.io to Authorized domains.");
            return;
          }
          if (error.code === "auth/popup-blocked") {
            setAuthError("The Google sign-in popup was blocked. Allow popups for this site and try again.");
            return;
          }
          if (error.code === "auth/popup-closed-by-user") {
            setAuthError("The Google sign-in popup was closed before sign-in finished.");
            return;
          }
          setAuthError(`${error.message} (${error.code})`);
          return;
        }
        setAuthError("Google sign-in failed. Please try again.");
      }
    },
    logout: () => signOut(auth),
    clearAuthError: () => setAuthError(null)
  }), [user, role, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
