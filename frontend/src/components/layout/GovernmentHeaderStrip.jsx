import React from "react";
import { ShieldCheck, PhoneCall, Globe } from "lucide-react";
import { ThemeToggle } from "../common/ThemeToggle";

export function GovernmentHeaderStrip() {
  return (
    <div className="gov-strip py-1 px-4 sm:px-6 lg:px-8 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
          <span className="tracking-wide">
            Urban Governance & Smart City Inter-Departmental Coordination Cell
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-neutral-200">
            <PhoneCall className="w-3 h-3 text-emerald-300" aria-hidden="true" />
            <span>Civic Control Room: 1800-120-CITY</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-neutral-200 border-l border-emerald-700/50 pl-3">
            <Globe className="w-3 h-3 text-emerald-300" aria-hidden="true" />
            <span>English / हिन्दी</span>
          </div>

          <div className="flex items-center border-l border-emerald-700/50 pl-3">
            <ThemeToggle compact={true} className="py-0.5 px-2 text-[11px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
