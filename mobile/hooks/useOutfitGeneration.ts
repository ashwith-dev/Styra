/**
 * useOutfitGeneration.ts
 *
 * Manages the full outfit generation lifecycle: request → loading → result.
 * Uses a finite state machine for predictable UI transitions.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { generateOutfit } from "@/lib/api";
import type {
  OutfitGenerationRequest,
  OutfitGenerationResponse,
} from "@/lib/types";

export type GenerationState =
  | "idle"
  | "configuring"
  | "generating"
  | "success"
  | "error";

export interface GenerationError {
  message: string;
  code: string;
  retry: boolean;
}

const LOADING_MESSAGES = [
  "Checking your wardrobe...",
  "Finding compatible pieces...",
  "Matching colors and textures...",
  "Considering today's weather...",
  "Styling your look...",
] as const;

export function useOutfitGeneration() {
  const [state, setState] = useState<GenerationState>("idle");
  const [result, setResult] = useState<OutfitGenerationResponse | null>(null);
  const [error, setError] = useState<GenerationError | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Identifies the latest run — stale async continuations (aborted previous
  // runs) must not clobber a newer run's state.
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Unmount cleanup: abort any in-flight request and stop the timers so no
  // interval keeps firing setState after the screen is gone.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      clearTimers();
    };
  }, [clearTimers]);

  const startGenerating = useCallback(async (params: OutfitGenerationRequest) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const runId = ++runIdRef.current;

    setState("generating");
    setError(null);
    setResult(null);
    setLoadingMessageIndex(0);
    setLoadingProgress(0);

    clearTimers();

    messageIntervalRef.current = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 0.88) return prev + 0.005;
        if (prev >= 0.70) return prev + 0.01;
        if (prev >= 0.40) return prev + 0.015;
        return prev + 0.04;
      });
    }, 200);

    try {
      const data = await generateOutfit(params, abortRef.current.signal);
      if (runId !== runIdRef.current || !mountedRef.current) return;
      clearTimers();
      setLoadingProgress(1);
      setResult(data);
      setState("success");
    } catch (err: any) {
      if (runId !== runIdRef.current || !mountedRef.current) return;
      clearTimers();

      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        setState("idle");
        return;
      }

      const genError: GenerationError = {
        message: err?.message || "Something went wrong while generating your outfit.",
        code: "GENERATION_FAILED",
        retry: true,
      };

      if (err?.statusCode === 404) {
        genError.code = "WARDROBE_INSUFFICIENT";
        genError.message = err.message;
        genError.retry = false;
      } else if (err?.statusCode === 422) {
        genError.code = "INVALID_REQUEST";
        genError.message = err.message;
        genError.retry = false;
      } else if (!err?.statusCode || err?.statusCode === 0) {
        genError.code = "NETWORK_ERROR";
        genError.message = "Unable to reach the server. Check your connection and try again.";
      }

      setError(genError);
      setState("error");
    }
  }, [clearTimers]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    runIdRef.current += 1; // invalidate any in-flight continuation
    clearTimers();
    setState("idle");
    setResult(null);
    setError(null);
    setLoadingMessageIndex(0);
    setLoadingProgress(0);
  }, [clearTimers]);

  const retry = useCallback((params: OutfitGenerationRequest) => {
    startGenerating(params);
  }, [startGenerating]);

  const openConfig = useCallback(() => {
    reset();
    setState("configuring");
  }, [reset]);

  return {
    state,
    result,
    error,
    loadingMessage: LOADING_MESSAGES[loadingMessageIndex],
    loadingProgress,
    openConfig,
    startGenerating,
    reset,
    retry,
  };
}
