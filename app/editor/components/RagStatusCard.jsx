"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";

export default function RagStatusCard() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return <div className="mx-4 mt-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 flex items-center gap-2.5">
    <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-white/8 text-white/55"><BookOpen className="h-3.5 w-3.5" /></div>
    <div className="min-w-0 flex-1"><div className="text-[11px] font-semibold text-white/80">NCERT Class 11 reference library</div><div className="text-[10px] text-white/40 truncate">Gravitation, Motion in a Plane, and Rotational Motion PDFs are available in Sources.</div></div>
    <button type="button" onClick={() => setClosed(true)} title="Dismiss NCERT library notice" className="rounded-md p-1 text-white/30 hover:bg-white/8 hover:text-white/70 transition"><X className="h-3.5 w-3.5" /></button>
  </div>;
}
