import React from 'react';

export function CombinedPV() {
  const pvMark = (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M 12 5 H 57 C 79.09 5 95 22.91 95 45 C 95 67.09 79.09 85 57 85 H 37 V 95 H 12 V 5 Z M 47 25 L 62 45 L 77 25 H 92 L 62 65 L 32 25 H 47 Z" 
      />
    </svg>
  );

  return (
    <div className="flex flex-col w-full h-full min-h-[100dvh] bg-[#0A0A0A] font-sans border-t-[3px] border-[#C8FF00] overflow-hidden">
      {/* Dark section ~60% */}
      <div className="flex-[6] flex flex-col items-center justify-center p-8 relative">
        <div className="text-[#C8FF00] mb-10 w-[240px] h-[240px]">
          {pvMark}
        </div>
        <h1 className="text-[#C8FF00] text-4xl font-bold tracking-[0.15em] uppercase mb-3">
          PayVora
        </h1>
        <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase">
          P+V Monogram
        </p>
      </div>

      {/* Light section ~40% */}
      <div className="flex-[4] bg-white flex flex-col items-center justify-center p-8">
        <div className="flex items-end gap-16 mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[64px] h-[64px] text-black">
              {pvMark}
            </div>
            <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">64PX</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-[32px] h-[32px] text-black">
              {pvMark}
            </div>
            <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">32PX</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-[16px] h-[16px] text-black">
              {pvMark}
            </div>
            <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">16PX</span>
          </div>
        </div>
        <p className="text-zinc-900 text-sm font-bold tracking-wide uppercase">
          Scales to 16×16px
        </p>
      </div>
    </div>
  );
}
