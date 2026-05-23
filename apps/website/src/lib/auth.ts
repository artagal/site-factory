"use client";

import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { getFirebaseApp, isFirebaseConfigured } from "./firebase";

export function getGoFunMotionAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export async function signInGuest() {
  const auth = getGoFunMotionAuth();
  if (!auth) return null;
  return signInAnonymously(auth);
}

export async function signInEmail(email: string, password: string) {
  const auth = getGoFunMotionAuth();
  if (!auth) return null;
  return signInWithEmailAndPassword(auth, email, password);
}

export async function createEmailAccount(email: string, password: string) {
  const auth = getGoFunMotionAuth();
  if (!auth) return null;
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  const auth = getGoFunMotionAuth();
  if (!auth) return;
  await signOut(auth);
}

export function observeUser(callback: (user: User | null) => void) {
  const auth = getGoFunMotionAuth();
  if (!auth || !isFirebaseConfigured()) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}
