import { useCallback, useRef, useState } from "react";

export type RunStatus = "idle" | "loading" | "error" | "success";

/**
 * Local, offline draft runner. No AI service is connected and nothing leaves
 * the browser — output is composed from the form input only.
 */
export function useToolRun<T>() {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const timer = useRef<number | null>(null);

  const run = useCallback((build: () => T) => {
    if (timer.current) window.clearTimeout(timer.current);
    setStatus("loading");
    setEditing(false);
    setError("");
    timer.current = window.setTimeout(() => {
      try {
        setResult(build());
        setStatus("success");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "The draft could not be prepared. Check your input and try again.",
        );
        setStatus("error");
      }
    }, 900);
  }, []);

  const clear = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setStatus("idle");
    setResult(null);
    setError("");
    setEditing(false);
  }, []);

  return { status, result, setResult, error, editing, setEditing, run, clear };
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable */
  }
}
