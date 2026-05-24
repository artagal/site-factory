"use client";

import { useEffect } from "react";
import { observeUser } from "../../lib/auth";
import { getLocalProgress, setProgressScope } from "../../lib/localStorage";
import { emitProgressUpdate, syncLocalProgressToFirebase } from "../../lib/progressActions";

export function AuthProgressBridge() {
  useEffect(() => {
    return observeUser((user) => {
      if (!user) {
        const guestProgress = setProgressScope(null);
        emitProgressUpdate(guestProgress);
        return;
      }

      setProgressScope(user.uid);
      emitProgressUpdate(getLocalProgress());
      void syncLocalProgressToFirebase().then((result) => {
        emitProgressUpdate(result.progress);
      });
    });
  }, []);

  return null;
}
