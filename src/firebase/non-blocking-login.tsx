'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FirebaseError,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch((error: FirebaseError) => {
    // This is a non-critical error, so we can ignore it.
    // The onAuthStateChanged listener will handle the case where the user is not signed in.
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch((error: FirebaseError) => {
    // This is a non-critical error, so we can ignore it.
    // The onAuthStateChanged listener will handle the case where the user is not signed in.
    console.error("Sign-up failed", error.message);
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch((error: FirebaseError) => {
    // This is a non-critical error, so we can ignore it.
    // The onAuthStateChanged listener will handle the case where the user is not signed in.
    console.error("Sign-in failed", error.message);
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Call signInWithPopup directly. Do NOT use 'await signInWithPopup(...)'.
  signInWithPopup(authInstance, provider).catch((error: FirebaseError) => {
    // The 'auth/popup-closed-by-user' error is a common, user-driven event.
    // We catch it here to prevent it from being thrown as an unhandled rejection,
    // which would trigger Next.js's error overlay. We don't need to show this
    // specific error to the user.
    if (error.code !== 'auth/popup-closed-by-user') {
      console.error("Google sign-in failed", error.message);
    }
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
