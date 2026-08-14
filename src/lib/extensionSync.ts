// Signals the JobPlotter browser extension (via its content-script bridge) that
// something the extension shows — the active resume or the user's profile — just
// changed, so it refreshes in real time. No-op when there's no extension.
//
// Two channels: a `postMessage` the bridge receives *instantly* (no poll delay),
// and a localStorage marker as a fallback (survives if the message is missed and
// works cross-tab).
export function signalExtensionSync(): void {
  try {
    window.postMessage({ __jobplotterSync: true, at: Date.now() }, window.location.origin);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem("jobplotter_sync", String(Date.now()));
  } catch {
    /* storage unavailable — ignore */
  }
}

// Fire the *instant* the user switches their active resume — before the backend
// round-trip — so the extension shows "Switching…" immediately, then polls for
// the new resume. Falls back to the generic sync path if the message is missed.
export function signalExtensionResumeSwitch(): void {
  try {
    window.postMessage({ __jobplotterSwitch: true, at: Date.now() }, window.location.origin);
  } catch {
    /* ignore */
  }
  signalExtensionSync();
}
