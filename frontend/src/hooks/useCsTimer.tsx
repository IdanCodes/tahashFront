import { useRef, useEffect } from "react";

export function useCSTimer() {
  const workerRef = useRef<Worker>(undefined);
  const callbacks = useRef<Record<number, (v: any) => void>>({});
  const msgid = useRef(0);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL(
        "/workers/cstimer_module.js?worker_file&type=classic",
        import.meta.url,
      ),
    );
    workerRef.current.onmessage = (e) => {
      const [id, type, ret] = e.data;
      const cb = callbacks.current[id];
      if (cb) {
        cb(ret);
        delete callbacks.current[id];
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  const callWorker = (type: string, details?: any[]) => {
    return new Promise<any>((resolve) => {
      msgid.current += 1;
      callbacks.current[msgid.current] = resolve;
      workerRef.current?.postMessage([msgid.current, type, details]);
    });
  };

  return {
    getScrambleTypes: () => callWorker("scrtype"),
    getScramble: (...args: any[]) => callWorker("scramble", args),
    setSeed: (seed: number) => callWorker("seed", [seed]),
    setGlobal: (key: string, value: any) => callWorker("set", [key, value]),
    getImage: (scramble: string, type: string) =>
      callWorker("image", [scramble, type]),
  };
}
