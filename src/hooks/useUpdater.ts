import { useState, useCallback, useRef } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "upToDate"
  | "error";

export function useUpdater() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [updateVersion, setUpdateVersion] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const updateRef = useRef<Update | null>(null);

  const checkForUpdate = useCallback(async () => {
    try {
      setStatus("checking");
      setError("");

      const update = await check();

      if (update) {
        updateRef.current = update;
        setUpdateVersion(update.version);
        setStatus("available");
      } else {
        setStatus("upToDate");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, []);

  const installUpdate = useCallback(async () => {
    const update = updateRef.current;
    if (!update) return;

    try {
      setStatus("downloading");
      setProgress(0);

      let totalLength = 0;
      let downloaded = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === "Started" && event.data.contentLength) {
          totalLength = event.data.contentLength;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (totalLength > 0) {
            setProgress(Math.round((downloaded / totalLength) * 100));
          }
        }
      });

      await relaunch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, []);

  return { status, updateVersion, progress, error, checkForUpdate, installUpdate };
}
