// Permanent fix for awareness interval stopping issue
// This runs in both development and production
import * as time from "lib0/time";
import { type WebsocketProvider } from "y-websocket";

export const createAwarenessWatchdog = (provider: WebsocketProvider) => {
  console.log("🐕 Starting Awareness Watchdog...");

  const awareness = provider.awareness;
  let lastIntervalActivity = Date.now();

  // Monitor original interval and detect when it stops
  const watchdog = () => {
    const timeSinceLastActivity = Date.now() - lastIntervalActivity;

    // If the original interval hasn't run in over 5 seconds, there's likely a problem
    if (timeSinceLastActivity > 5000) {
      console.log(
        "🐕 Watchdog: Awareness interval appears inactive, restarting...",
      );

      // Clear any existing interval
      if (awareness._checkInterval) {
        clearInterval(awareness._checkInterval);
      }

      // Recreate the awareness check interval with the exact same logic as the original
      awareness._checkInterval = setInterval(
        () => {
          lastIntervalActivity = Date.now();

          try {
            const now = time.getUnixTime();
            const clientMeta = awareness.meta.get(awareness.clientID);

            if (!clientMeta) return;

            const outdatedTimeout = 30000; // From awareness.js
            const checkIt =
              awareness.getLocalState() !== null &&
              outdatedTimeout / 2 <= (now - clientMeta.lastUpdated) * 1000;

            if (checkIt) {
              // Renew local clock - exactly as in original awareness.js
              awareness.setLocalState(awareness.getLocalState());
            }

            // Handle cleanup of remote clients
            const remove: number[] = [];
            awareness.meta.forEach((meta, clientid) => {
              if (
                clientid !== awareness.clientID &&
                outdatedTimeout <= (now - meta.lastUpdated) * 1000 &&
                awareness.states.has(clientid)
              ) {
                remove.push(clientid);
              }
            });

            if (remove.length > 0) {
              // Remove outdated awareness states
              remove.forEach((clientid: number) => {
                if (awareness.states.has(clientid)) {
                  awareness.states.delete(clientid);
                  if (clientid === awareness.clientID) {
                    const curMeta = awareness.meta.get(clientid);
                    if (curMeta) {
                      awareness.meta.set(clientid, {
                        clock: curMeta.clock + 1,
                        lastUpdated: time.getUnixTime(),
                      });
                    }
                  }
                }
              });

              if (remove.length > 0) {
                awareness.emit("change", [
                  { added: [], updated: [], removed: remove },
                  "timeout",
                ]);
                awareness.emit("update", [
                  { added: [], updated: [], removed: remove },
                  "timeout",
                ]);
              }
            }
          } catch (error) {
            console.error("🐕 Watchdog: Error in awareness interval:", error);
          }
        },
        Math.floor(30000 / 10),
      ); // Same interval as original (3000ms)

      // Reset our activity tracker
      lastIntervalActivity = Date.now();
    }
  };

  // Set up the watchdog to check every 10 seconds
  const watchdogIntervalId = setInterval(watchdog, 10000);

  // Set initial activity time
  lastIntervalActivity = Date.now();

  // Return cleanup function
  return () => {
    console.log("🐕 Cleaning up Awareness Watchdog...");
    clearInterval(watchdogIntervalId);
  };
};
