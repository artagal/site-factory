"use client";

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
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

export async function signInGoogle() {
  const auth = getGoFunMotionAuth();
  if (!auth) return null;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
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

export async function updateUserDisplayName(displayName: string) {
  const auth = getGoFunMotionAuth();
  const user = auth?.currentUser;
  if (!user) return null;

  await updateProfile(user, { displayName });
  return user;
}

export async function sendCurrentUserEmailVerification() {
  const auth = getGoFunMotionAuth();
  const user = auth?.currentUser;
  if (!user?.email || user.emailVerified) return null;

  await sendEmailVerification(user);
  return user;
}

export async function getCurrentUserIdToken() {
  const auth = getGoFunMotionAuth();
  const user = auth?.currentUser;
  if (!user) return null;

  return user.getIdToken();
}

export function observeUser(callback: (user: User | null) => void) {
  const auth = getGoFunMotionAuth();
  if (!auth || !isFirebaseConfigured()) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}
