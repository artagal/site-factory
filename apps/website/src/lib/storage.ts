import { getStorage } from "firebase/storage";
import { getFirebaseApp } from "./firebase";

export function getGoFunMotionStorage() {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}
