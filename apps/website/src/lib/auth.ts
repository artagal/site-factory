"use client";

import {
  createUserWithEmailAndPassword,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  OAuthProvider,
  sendEmailVerification,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { getFirebaseApp, isFirebaseConfigured } from "./firebase";

const emulatorConnectedAuth = new WeakSet<object>();

export function getGoFunMotionAuth() {
  const app = getFirebaseApp();
  if (!app) return null;

  const auth = getAuth(app);
  const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
  if (
    process.env.NODE_ENV !== "production"
    && emulatorHost
    && !emulatorConnectedAuth.has(auth)
  ) {
    connectAuthEmulator(auth, `http://${emulatorHost}`, { disableWarnings: true });
    emulatorConnectedAuth.add(auth);
  }

  return auth;
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

export async function signInApple() {
  const auth = getGoFunMotionAuth();
  if (!auth) return null;
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
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
