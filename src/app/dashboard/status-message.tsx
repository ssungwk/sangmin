"use client";

import { useEffect, useState } from "react";

type ActionState = { success?: string; error?: string; warning?: string } | undefined;

export function StatusMessage({
  state,
  className = "text-sm",
  duration = 3000,
}: {
  state: ActionState;
  className?: string;
  duration?: number;
}) {
  const [shown, setShown] = useState<ActionState>(state);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs in the latest action result; the timer below auto-clears it
    setShown(state);
    if (!state) return;
    const timer = setTimeout(() => setShown(undefined), duration);
    return () => clearTimeout(timer);
  }, [state, duration]);

  if (!shown) return null;
  if (shown.error) return <span className={`${className} text-red-700`}>{shown.error}</span>;
  if (shown.warning) return <span className={`${className} text-amber-700`}>{shown.warning}</span>;
  if (shown.success) return <span className={`${className} text-blue-700`}>{shown.success}</span>;
  return null;
}
