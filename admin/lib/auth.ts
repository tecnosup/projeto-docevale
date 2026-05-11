// Mock auth — troca por Firebase quando tiver o projeto criado
// import { auth } from "./firebase";
// import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

type MockUser = { email: string; uid: string };
type UserLike = MockUser | null;

let currentUser: UserLike = null;
const listeners = new Set<(u: UserLike) => void>();

function notify(u: UserLike) {
  currentUser = u;
  listeners.forEach((fn) => fn(u));
}

export async function login(email: string, password: string) {
  await new Promise((r) => setTimeout(r, 600));
  if (password.length < 4) throw new Error("auth/wrong-password");
  notify({ email, uid: "mock-uid" });
}

export async function logout() {
  await new Promise((r) => setTimeout(r, 300));
  notify(null);
}

export function onAuthChange(callback: (user: UserLike) => void): () => void {
  listeners.add(callback);
  // fire immediately with current state (mirrors Firebase behavior)
  setTimeout(() => callback(currentUser), 0);
  return () => { listeners.delete(callback); };
}
