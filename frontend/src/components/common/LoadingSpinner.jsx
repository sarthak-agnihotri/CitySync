import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading government records..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3 text-[var(--text-muted)]">
      <Loader2 className="w-7 h-7 animate-spin text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
      {text && <span className="text-xs font-semibold">{text}</span>}
    </div>
  );
}
